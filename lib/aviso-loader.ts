/**
 * Aviso Loader - Loads real avisos from scraped data and converts to eligibility engine format
 */

import { AvisoCriteria } from './eligibility-engine';
import { prisma, dataProvider } from './db';
import path from 'path';
import fs from 'fs';

// CAE prefix mappings for common sectors
const SECTOR_TO_CAE_PREFIXES: Record<string, string[]> = {
    'Indústria Transformadora': ['10', '11', '13', '14', '15', '16', '17', '18', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33'],
    'Indústria': ['10', '11', '13', '14', '15', '16', '17', '18', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33'],
    'Serviços e Comércio': ['45', '46', '47', '55', '56', '58', '59', '60', '61', '62', '63', '69', '70', '71', '72', '73', '74'],
    'I&D e Tecnologia': ['62', '63', '72', '73', '74'],
    'Agricultura': ['01', '02', '03'],
    'Floresta': ['02'],
    'Agricultura Biológica': ['01'],
    'Agroindústria': ['10', '11'],
    'Todos os setores': [], // Empty means all CAEs are eligible
};

// Extract dimensao from tipo_beneficiario string or array
function extractDimensao(tipoBeneficiario: unknown): string[] {
    // Handle array or object
    let tipoBenStr = '';
    if (Array.isArray(tipoBeneficiario)) {
        tipoBenStr = tipoBeneficiario.join(' ').toLowerCase();
    } else if (typeof tipoBeneficiario === 'string') {
        tipoBenStr = tipoBeneficiario.toLowerCase();
    } else {
        return ['MICRO', 'PEQUENA', 'MEDIA', 'GRANDE']; // Default to all
    }

    const lower = tipoBenStr;
    const dimensoes: string[] = [];

    if (lower.includes('micro')) dimensoes.push('MICRO');
    if (lower.includes('pequen')) dimensoes.push('PEQUENA');
    if (lower.includes('médi') || lower.includes('media')) dimensoes.push('MEDIA');
    if (lower.includes('grand')) dimensoes.push('GRANDE');
    if (lower.includes('pme') || lower.includes('p.m.e')) {
        if (!dimensoes.includes('MICRO')) dimensoes.push('MICRO');
        if (!dimensoes.includes('PEQUENA')) dimensoes.push('PEQUENA');
        if (!dimensoes.includes('MEDIA')) dimensoes.push('MEDIA');
    }

    // If no specific dimension mentioned, assume all
    if (dimensoes.length === 0) {
        return ['MICRO', 'PEQUENA', 'MEDIA', 'GRANDE'];
    }

    return dimensoes;
}

// Extract tipo de projeto from keywords and description
function extractTiposProjeto(aviso: any): string[] {
    const tipos: string[] = [];
    const keywords = (aviso.keywords || []).join(' ').toLowerCase();
    const desc = (aviso.descricao || '').toLowerCase();
    const linha = (aviso.linha || '').toLowerCase();
    const combined = `${keywords} ${desc} ${linha}`;

    if (combined.includes('inovação') || combined.includes('inovacao') || combined.includes('produtiv')) tipos.push('inovacao');
    if (combined.includes('digital') || combined.includes('tecnolog') || combined.includes('automaç')) tipos.push('digital');
    if (combined.includes('internac') || combined.includes('exporta') || combined.includes('qualifica')) tipos.push('internacional');
    if (combined.includes('sustent') || combined.includes('ambient') || combined.includes('energ') || combined.includes('renovável') || combined.includes('bio')) tipos.push('sustentabilidade');
    if (combined.includes('produção') || combined.includes('producao') || combined.includes('investimento') || combined.includes('moder')) tipos.push('producao');

    return tipos.length > 0 ? tipos : ['outro'];
}

// Extract regiões from string or array
function extractRegioes(regiaoInput: unknown): string[] | undefined {
    let regiaoStr = '';
    if (Array.isArray(regiaoInput)) {
        regiaoStr = regiaoInput.join(',');
    } else if (typeof regiaoInput === 'string') {
        regiaoStr = regiaoInput;
    } else {
        return undefined; // Nacional = all regions
    }

    if (!regiaoStr || regiaoStr.toLowerCase() === 'nacional') {
        return undefined; // Nacional = all regions
    }

    return regiaoStr.split(',').map(r => r.trim()).filter(r => r.length > 0);
}

// Convert scraped aviso to eligibility engine format
export function convertToAvisoCriteria(aviso: any): AvisoCriteria {
    const setor = aviso.setor || 'Todos os setores';
    const caePrefixos = SECTOR_TO_CAE_PREFIXES[setor] || [];

    return {
        id: aviso.id,
        nome: aviso.titulo,
        portal: aviso.fonte || 'PORTUGAL2030',
        programa: aviso.programa || '',
        dataFimSubmissao: new Date(aviso.data_fecho),
        link: aviso.url,
        taxa: aviso.taxa_apoio ? `${aviso.taxa_apoio}%` : undefined,
        criterios: {
            dimensao: extractDimensao(aviso.tipo_beneficiario || ''),
            caePrefixos: caePrefixos.length > 0 ? caePrefixos : undefined,
            regioes: extractRegioes(aviso.regiao),
            tiposProjeto: extractTiposProjeto(aviso),
            investimentoMin: aviso.montante_min ? parseInt(aviso.montante_min) : undefined,
            investimentoMax: aviso.montante_max ? parseInt(aviso.montante_max) : undefined,
        },
        documentosNecessarios: aviso.documentos_necessarios,
    };
}

// Load avisos from scraped JSON files
export async function loadAvisosFromScrapedData(): Promise<AvisoCriteria[]> {
    const dataDir = path.join(process.cwd(), 'data', 'scraped');
    const avisos: AvisoCriteria[] = [];

    const files = ['portugal2030_avisos.json', 'pepac_avisos.json', 'prr_avisos.json'];

    for (const file of files) {
        try {
            const filePath = path.join(dataDir, file);
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf-8');
                const data = JSON.parse(content);
                if (Array.isArray(data)) {
                    for (const aviso of data) {
                        try {
                            avisos.push(convertToAvisoCriteria(aviso));
                        } catch (avisoError) {
                            console.error(`Error converting aviso ${aviso?.id}:`, avisoError);
                            // Continue with other avisos
                        }
                    }
                }
            }
        } catch (error) {
            console.error(`Error loading ${file}:`, error);
        }
    }

    console.log(`[Aviso Loader] Loaded ${avisos.length} avisos from scraped files`);

    return avisos;
}

// Load avisos from database (Prisma or fallback)
export async function loadAvisosFromDatabase(): Promise<AvisoCriteria[]> {
    try {
        // Try to get avisos from the database
        const dbAvisos = await prisma.aviso.findMany({
            where: {
                status: 'Aberto',
                dataFimSubmissao: {
                    gte: new Date(),
                },
            },
        });

        if (dbAvisos.length > 0) {
            return dbAvisos.map((aviso: any) => convertToAvisoCriteria({
                id: aviso.id,
                titulo: aviso.titulo,
                fonte: aviso.fonte,
                programa: aviso.programa,
                data_fecho: aviso.dataFimSubmissao,
                url: aviso.url,
                taxa_apoio: aviso.taxaApoio,
                tipo_beneficiario: aviso.tipoBeneficiario,
                setor: aviso.setor,
                regiao: aviso.regiao,
                montante_min: aviso.montanteMin,
                montante_max: aviso.montanteMax,
                documentos_necessarios: aviso.documentos,
                keywords: aviso.keywords,
                descricao: aviso.descricao,
                linha: aviso.linha,
            }));
        }
    } catch (error) {
        console.log('[Aviso Loader] Database not available, falling back to JSON files');
    }

    // Fallback to scraped JSON files
    return loadAvisosFromScrapedData();
}

// Main loader function - gets avisos from best available source
export async function loadAvisos(): Promise<{ avisos: AvisoCriteria[]; source: string; }> {
    // For now, prioritize scraped files as they have richer data
    // DB integration will be used when Aviso schema is aligned
    const scrapedAvisos = await loadAvisosFromScrapedData();
    const activeAvisos = scrapedAvisos.filter(a => a.dataFimSubmissao > new Date());

    console.log(`[Aviso Loader] Returning ${activeAvisos.length} active avisos (from ${scrapedAvisos.length} total scraped)`);

    return {
        avisos: activeAvisos,
        source: 'scraped_json',
    };
}
