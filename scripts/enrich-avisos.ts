/**
 * Agente de enriquecimento de avisos (design 2026-07-09, bloco 2).
 *
 * Para cada aviso aberto sem descrição útil (ou Fundo Ambiental sem datas):
 * fetch do link (HTML ou PDF) → extração estruturada com Gemini Flash →
 * validação em lib/enrichment.ts → update conservador na BD.
 *
 * Uso:
 *   yarn tsx scripts/enrich-avisos.ts                    # dry-run, 50 avisos
 *   yarn tsx scripts/enrich-avisos.ts --commit --limit 150
 *   yarn tsx scripts/enrich-avisos.ts --portal FUNDO_AMBIENTAL --commit
 *
 * Datas: só são escritas para avisos cujo prazo atual está no passado
 * (ex.: fallback do Fundo Ambiental) e nunca sobrescrevem o scraper —
 * ver buildUpdateData em lib/enrichment.ts.
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import axios from 'axios';
import { PrismaClient, Portal, Prisma } from '@prisma/client';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { coerceExtraction, htmlToText, buildUpdateData, TIPOS_BENEFICIARIO, ABRANGENCIAS, TIPOS_APOIO } from '../lib/enrichment';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require('pdf-parse');

const prisma = new PrismaClient();
const MODEL = 'gemini-2.5-flash';

interface CliOptions {
    commit: boolean;
    limit: number;
    portal?: Portal;
}

function parseArgs(argv: string[]): CliOptions {
    const opts: CliOptions = { commit: false, limit: 50 };
    for (let i = 0; i < argv.length; i++) {
        if (argv[i] === '--commit') opts.commit = true;
        if (argv[i] === '--limit') opts.limit = parseInt(argv[i + 1] || '50', 10);
        if (argv[i] === '--portal') opts.portal = argv[i + 1] as Portal;
    }
    return opts;
}

const responseSchema = {
    type: SchemaType.OBJECT,
    properties: {
        descricao: { type: SchemaType.STRING, nullable: true, description: 'Resumo do aviso em português (2-3 parágrafos, mínimo 50 caracteres): objetivo, quem pode candidatar-se, o que financia.' },
        dataInicioSubmissao: { type: SchemaType.STRING, nullable: true, description: 'Data de início de candidaturas, formato YYYY-MM-DD. null se não constar do texto.' },
        dataFimSubmissao: { type: SchemaType.STRING, nullable: true, description: 'Prazo final de candidaturas, formato YYYY-MM-DD. null se não constar do texto.' },
        tiposBeneficiarios: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING, enum: [...TIPOS_BENEFICIARIO], format: 'enum' }, description: 'Tipos de beneficiários elegíveis explicitamente referidos.' },
        caeElegiveis: { type: SchemaType.ARRAY, items: { type: SchemaType.NUMBER }, description: 'Códigos CAE elegíveis SE explicitamente listados no texto (números).' },
        regiaoNUTS2: { type: SchemaType.STRING, nullable: true, description: 'Região NUTS II abrangida (Norte, Centro, Lisboa, Alentejo, Algarve, Açores, Madeira). null se nacional ou não referido.' },
        abrangenciaGeografica: { type: SchemaType.STRING, nullable: true, enum: [...ABRANGENCIAS], format: 'enum' },
        montanteMinimo: { type: SchemaType.NUMBER, nullable: true, description: 'Investimento/apoio mínimo em euros, se referido.' },
        montanteMaximo: { type: SchemaType.NUMBER, nullable: true, description: 'Dotação ou apoio máximo em euros, se referido.' },
        taxaCofinanciamentoMax: { type: SchemaType.NUMBER, nullable: true, description: 'Taxa máxima de cofinanciamento em percentagem (0-100), se referida.' },
        tipoApoio: { type: SchemaType.STRING, nullable: true, enum: [...TIPOS_APOIO], format: 'enum' },
    },
    required: ['descricao', 'dataInicioSubmissao', 'dataFimSubmissao', 'tiposBeneficiarios', 'caeElegiveis', 'regiaoNUTS2', 'abrangenciaGeografica', 'montanteMinimo', 'montanteMaximo', 'taxaCofinanciamentoMax', 'tipoApoio'],
} as const;

async function fetchAvisoText(url: string): Promise<{ text: string; contentType: string } | null> {
    try {
        const response = await axios.get(url, {
            timeout: 25000,
            maxContentLength: 20 * 1024 * 1024,
            responseType: 'arraybuffer',
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TAConsultingBot/1.0)' },
        });
        const contentType = String(response.headers['content-type'] || '');
        const buffer = Buffer.from(response.data);

        if (contentType.includes('pdf') || url.toLowerCase().endsWith('.pdf')) {
            const parsed = await pdfParse(buffer);
            return { text: String(parsed.text || '').replace(/\s+/g, ' ').trim().slice(0, 15000), contentType: 'pdf' };
        }
        return { text: htmlToText(buffer.toString('utf-8')), contentType: 'html' };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.log(`      ⚠️ fetch falhou: ${message.slice(0, 80)}`);
        return null;
    }
}

async function main(): Promise<void> {
    const opts = parseArgs(process.argv.slice(2));
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY não configurada no .env');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: MODEL,
        generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: responseSchema as never,
            temperature: 0.1,
        },
    });

    const now = new Date();
    // FA entra sempre (as datas fallback estão no passado e é isso que queremos corrigir)
    const where: Prisma.AvisoWhereInput = {
        link: { not: null },
        enrichmentStatus: 'BASIC',
        ...(opts.portal
            ? { portal: opts.portal }
            : {
                OR: [
                    { dataFimSubmissao: { gte: now }, descricao: null },
                    { dataFimSubmissao: { gte: now }, descricao: { equals: '' } },
                    { portal: 'FUNDO_AMBIENTAL' },
                ],
            }),
    };

    // avisos com descrição curta (<200) também contam — filtro fino em memória
    const candidatosRaw = await prisma.aviso.findMany({
        where,
        orderBy: { dataFimSubmissao: 'asc' },
        take: opts.limit * 2,
        select: { id: true, codigo: true, nome: true, portal: true, link: true, descricao: true, dataFimSubmissao: true },
    });
    const candidatos = candidatosRaw
        .filter((a) => a.portal === 'FUNDO_AMBIENTAL' || !a.descricao || a.descricao.length < 200)
        .slice(0, opts.limit);

    console.log('═'.repeat(60));
    console.log(`🧠 ENRIQUECIMENTO DE AVISOS — ${MODEL} ${opts.commit ? '(COMMIT)' : '(dry-run)'}`);
    console.log(`   candidatos: ${candidatos.length} (limit ${opts.limit}${opts.portal ? `, portal ${opts.portal}` : ''})`);
    console.log('═'.repeat(60));

    let enriched = 0;
    let failed = 0;
    let tokensIn = 0;
    let tokensOut = 0;

    for (const aviso of candidatos) {
        console.log(`\n📄 [${aviso.portal}] ${aviso.codigo.slice(0, 40)} — ${aviso.nome.slice(0, 60)}`);
        const fetched = await fetchAvisoText(aviso.link as string);
        if (!fetched || fetched.text.length < 200) {
            console.log('      ⏭️ sem texto útil, ignorado');
            failed++;
            continue;
        }

        try {
            const prompt =
                `És um extrator de dados de avisos de financiamento (fundos portugueses e europeus). ` +
                `Extrai APENAS informação presente no texto — usa null/lista vazia quando a informação não consta. Não inventes.\n\n` +
                `TÍTULO DO AVISO: ${aviso.nome}\n\nTEXTO DA PÁGINA OFICIAL (${fetched.contentType}):\n${fetched.text}`;
            const result = await model.generateContent(prompt);
            const usage = result.response.usageMetadata;
            tokensIn += usage?.promptTokenCount ?? 0;
            tokensOut += usage?.candidatesTokenCount ?? 0;

            const coerced = coerceExtraction(JSON.parse(result.response.text()));
            if (!coerced || coerced.fieldCount === 0) {
                console.log('      ⚠️ extração vazia/inválida');
                if (opts.commit && coerced === null) {
                    await prisma.aviso.update({ where: { id: aviso.id }, data: { enrichmentStatus: 'VALIDATION_FAILED', lastEnrichedAt: new Date() } });
                }
                failed++;
                continue;
            }

            const allowDates = aviso.portal === 'FUNDO_AMBIENTAL';
            const update = buildUpdateData(coerced, { descricao: aviso.descricao, dataFimSubmissao: aviso.dataFimSubmissao }, { allowDates });
            const campos = Object.keys(update);
            console.log(`      ✅ ${coerced.fieldCount}/11 campos extraídos → escreve: ${campos.length ? campos.join(', ') : '(nada novo)'}`);

            if (opts.commit) {
                await prisma.aviso.update({
                    where: { id: aviso.id },
                    data: {
                        ...update,
                        enrichmentStatus: 'AI_ENRICHED',
                        enrichedBy: MODEL,
                        lastEnrichedAt: new Date(),
                        enrichmentScore: coerced.fieldCount / coerced.totalFields,
                        dataSourceLog: {
                            url: aviso.link,
                            fetchedAt: new Date().toISOString(),
                            contentType: fetched.contentType,
                            chars: fetched.text.length,
                            model: MODEL,
                        },
                    },
                });
            }
            enriched++;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            console.log(`      ❌ ${message.slice(0, 100)}`);
            failed++;
        }

        await new Promise((r) => setTimeout(r, 300));
    }

    // preços Gemini 2.5 Flash (USD/1M tokens) — ordem de grandeza para o log
    const custoUSD = (tokensIn / 1e6) * 0.3 + (tokensOut / 1e6) * 2.5;
    console.log('\n' + '═'.repeat(60));
    console.log(`✅ enriquecidos: ${enriched} | falhados/ignorados: ${failed}`);
    console.log(`💰 tokens: ${tokensIn} in / ${tokensOut} out ≈ $${custoUSD.toFixed(3)}`);
    console.log('═'.repeat(60));

    await prisma.$disconnect();
    if (enriched === 0 && candidatos.length > 0) process.exit(1);
}

main().catch((e) => {
    console.error('Fatal:', e);
    process.exit(1);
});
