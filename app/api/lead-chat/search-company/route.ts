import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { lookupNif } from '@/lib/nif-provider';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Company Search by Name
 * Uses Gemini with Google Search capability to find company data
 */

interface CompanySearchResult {
    found: boolean;
    nif?: string;
    nome: string;
    morada?: string;
    codigoPostal?: string;
    concelho?: string;
    distrito?: string;
    cae?: string;
    atividade?: string;
    setor?: string;
    email?: string;
    telefone?: string;
    website?: string;
    dimensoes?: string;
    fontes: string[];
    confianca: 'ALTA' | 'MEDIA' | 'BAIXA';
    rawResponse?: string;
}

export async function POST(req: NextRequest) {
    try {
        const { nomeEmpresa, nif: userProvidedNif } = await req.json();

        if (!nomeEmpresa) {
            return NextResponse.json({ error: 'Nome da empresa é obrigatório' }, { status: 400 });
        }

        // If user provided NIF, validate it first
        if (userProvidedNif) {
            const nifValidation = await lookupNif(userProvidedNif);
            if (nifValidation.valid && nifValidation.nome) {
                // Check if names match
                const namesMatch = nifValidation.nome.toLowerCase().includes(nomeEmpresa.toLowerCase()) ||
                                   nomeEmpresa.toLowerCase().includes(nifValidation.nome.toLowerCase());

                return NextResponse.json({
                    found: true,
                    nif: nifValidation.nif,
                    nome: nifValidation.nome,
                    morada: nifValidation.morada,
                    codigoPostal: nifValidation.codigoPostal,
                    concelho: nifValidation.concelho,
                    distrito: nifValidation.distrito,
                    cae: nifValidation.cae,
                    atividade: nifValidation.atividade,
                    setor: nifValidation.atividade,
                    fontes: ['NIF.PT'],
                    confianca: namesMatch ? 'ALTA' : 'MEDIA',
                } as CompanySearchResult);
            }
        }

        // Use Gemini to find company by name
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-exp',
            generationConfig: {
                temperature: 0.2, // Low for factual data
                maxOutputTokens: 1500,
            }
        });

        const prompt = `# TASK: Company Intelligence - Portugal

Pesquisa informação sobre a empresa portuguesa: **"${nomeEmpresa}"**

## FONTES PRIORITÁRIAS (em ordem):
1. **www.nif.pt** - Mais fiável para NIF
2. **racius.com** - Muito bom para empresas PT
3. **einforma.pt** - Dados fiáveis
4. **iapmei.pt** - Oficial para PME
5. **linkedin.com** - Para validar setor/atividade
6. **google.com/maps** - Para morada/telefone

## DADOS A RETORNAR (OBRIGATÓRIOS):
- nif: NIF de 9 dígitos
- nome: Nome oficial da empresa
- morada: Morada completa
- concelho: Concelho
- distrito: Distrito
- codigoPostal: Código postal (XXXX-XXX)
- cae: Código CAE principal
- atividade: Descrição da atividade/setor
- setor: Setor principal (Indústria, Comércio, Serviços, Tecnologia, Turismo, Agricultura, etc)
- email: Email da empresa (se público)
- telefone: Telefone (se público)
- website: Site oficial

## REGRA DE CONFIRMAÇÃO:
- **ALTA**: Encontrei em NIF.PT ou racius.com com nome EXATO
- **MEDIA**: Encontrei em outras fontes mas com nome similar
- **BAIXA**: Apenas inferência, não encontrei dados oficiais

## FORMATO JSON (responde APENAS com JSON, sem markdown):

\`\`\`json
{
  "found": true,
  "nif": "123456789",
  "nome": "Nome Oficial da Empresa, Lda",
  "morada": "Rua Exemplo, 123",
  "codigoPostal": "1000-001",
  "concelho": "Lisboa",
  "distrito": "Lisboa",
  "cae": "62010",
  "atividade": "Consultoria de informática",
  "setor": "Tecnologia",
  "email": "geral@empresa.pt",
  "telefone": "+351 210000000",
  "website": "www.empresa.pt",
  "fontes": ["nif.pt", "racius.com"],
  "confianca": "ALTA"
}
\`\`\`

Se NÃO encontrares a empresa, retorna:
\`\`\`json
{
  "found": false,
  "nome": "${nomeEmpresa}",
  "fontes": [],
  "confianca": "BAIXA"
}
\`\`\`

**IMPORTANTE**: Pesquisa SEMPRE primeiro no nif.pt e racius.com.`;

        const result = await model.generateContent(prompt);
        const response = await result.response.text();

        // Parse JSON from response
        let jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) ||
                       response.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            return NextResponse.json({
                found: false,
                nome: nomeEmpresa,
                fontes: [],
                confianca: 'BAIXA',
                rawResponse: response
            } as CompanySearchResult);
        }

        const jsonStr = jsonMatch[1] || jsonMatch[0];
        const data = JSON.parse(jsonStr);

        // If NIF found, validate with NIF.PT for confirmation
        if (data.found && data.nif) {
            try {
                const nifValidation = await lookupNif(data.nif);
                if (nifValidation.valid && nifValidation.nome) {
                    // Merge data from NIF.PT (more reliable)
                    data.nome = nifValidation.nome; // Use official name
                    data.morada = nifValidation.morada || data.morada;
                    data.codigoPostal = nifValidation.codigoPostal || data.codigoPostal;
                    data.concelho = nifValidation.concelho || data.concelho;
                    data.distrito = nifValidation.distrito || data.distrito;
                    data.cae = nifValidation.cae || data.cae;
                    data.atividade = nifValidation.atividade || data.atividade;
                    data.fontes = [...new Set([...data.fontes, 'NIF.PT'])];
                    data.confianca = 'ALTA';
                }
            } catch (error) {
                console.error('NIF validation failed:', error);
            }
        }

        return NextResponse.json(data);

    } catch (error: any) {
        console.error('Company search error:', error);
        return NextResponse.json({
            found: false,
            error: error.message,
            fontes: [],
            confianca: 'BAIXA'
        } as CompanySearchResult, { status: 500 });
    }
}
