/**
 * LLM-based extraction for operational fields
 * Uses Anthropic Claude (already configured) for structured extraction
 */

import Anthropic from '@anthropic-ai/sdk';

// Initialize client (uses ANTHROPIC_API_KEY from env)
const anthropic = new Anthropic();

export interface OperationalFields {
    canal_submissao?: string;
    caminho_menu?: string;
    pre_requisitos?: string[];
    links_legislacao?: string[];
    contacto?: {
        email?: string;
        telefone?: string;
    };
    notas_adicionais?: string;
}

/**
 * Extract operational fields from aviso HTML/text using Claude
 */
export async function extractOperationalFields(
    html: string,
    titulo?: string
): Promise<OperationalFields> {
    // Limit input to avoid token limits
    const truncatedHtml = html.slice(0, 50000);

    const prompt = `Analisa o seguinte texto de um aviso de fundos portugueses e extrai informações operacionais.

TÍTULO DO AVISO: ${titulo || 'Não especificado'}

CONTEÚDO:
${truncatedHtml}

Extrai os seguintes campos (se existirem no texto):

1. **canal_submissao**: Onde se submetem as candidaturas?
   - Exemplos válidos: "Área Reservada IFAP", "Balcão de Candidaturas", "Balcão dos Fundos", "Portal COMPETE", "Formulário Eletrónico"
   - Se não encontrares, devolve null

2. **caminho_menu**: Qual o caminho de navegação no portal?
   - Exemplo: "O Meu Processo » Candidaturas » VITIS » Campanha 2025/2026"
   - Se não encontrares, devolve null

3. **pre_requisitos**: Lista de requisitos para candidatura
   - Procura bullets ou listas com termos como: "devem", "obrigatório", "necessário", "registo", "NIFAP", "iSIP", "declaração", "parecer"
   - Devolve array de strings curtas e claras
   - Se não encontrares, devolve array vazio []

4. **links_legislacao**: URLs para legislação (Portarias, Despachos, DRE)
   - Procura links que contenham: dre.pt, portaria, despacho, regulamento
   - Se não encontrares, devolve array vazio []

5. **contacto**: Email e/ou telefone de contacto
   - Devolve objeto com campos email e telefone
   - Se não encontrares, devolve null

6. **notas_adicionais**: Informações importantes para consultores
   - Datas limite especiais, alterações, avisos importantes
   - Se não encontrares, devolve null

RESPONDE APENAS COM JSON VÁLIDO, sem explicações:
{
  "canal_submissao": "...",
  "caminho_menu": "...",
  "pre_requisitos": ["...", "..."],
  "links_legislacao": ["...", "..."],
  "contacto": {"email": "...", "telefone": "..."},
  "notas_adicionais": "..."
}`;

    try {
        const response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 2048,
            messages: [{
                role: 'user',
                content: prompt
            }]
        });

        // Extract text from response
        const text = response.content[0].type === 'text'
            ? response.content[0].text
            : '';

        // Parse JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.warn('LLM did not return valid JSON');
            return {};
        }

        const parsed = JSON.parse(jsonMatch[0]);

        // Validate and clean response
        return {
            canal_submissao: typeof parsed.canal_submissao === 'string' ? parsed.canal_submissao : undefined,
            caminho_menu: typeof parsed.caminho_menu === 'string' ? parsed.caminho_menu : undefined,
            pre_requisitos: Array.isArray(parsed.pre_requisitos) ? parsed.pre_requisitos.filter((s: any) => typeof s === 'string') : undefined,
            links_legislacao: Array.isArray(parsed.links_legislacao) ? parsed.links_legislacao.filter((s: any) => typeof s === 'string') : undefined,
            contacto: parsed.contacto && (parsed.contacto.email || parsed.contacto.telefone) ? {
                email: parsed.contacto.email || undefined,
                telefone: parsed.contacto.telefone || undefined,
            } : undefined,
            notas_adicionais: typeof parsed.notas_adicionais === 'string' ? parsed.notas_adicionais : undefined,
        };
    } catch (error: any) {
        console.error(`LLM extraction error: ${error.message}`);
        return {};
    }
}

/**
 * Batch extract operational fields for multiple avisos
 * Uses rate limiting to avoid API throttling
 */
export async function batchExtractOperationalFields(
    items: Array<{ html: string; titulo?: string }>,
    maxConcurrent: number = 3,
    delayMs: number = 500
): Promise<OperationalFields[]> {
    const results: OperationalFields[] = [];

    console.log(`    🤖 Extraindo campos operacionais via LLM (${items.length} itens)...`);

    for (let i = 0; i < items.length; i += maxConcurrent) {
        const batch = items.slice(i, i + maxConcurrent);

        const batchResults = await Promise.all(
            batch.map(item => extractOperationalFields(item.html, item.titulo))
        );

        results.push(...batchResults);

        // Rate limiting
        if (i + maxConcurrent < items.length) {
            await new Promise(r => setTimeout(r, delayMs));
        }

        // Progress log every 10 items
        if ((i + maxConcurrent) % 10 === 0 || i + maxConcurrent >= items.length) {
            console.log(`    ✅ Processados ${Math.min(i + maxConcurrent, items.length)}/${items.length}`);
        }
    }

    return results;
}

export default extractOperationalFields;
