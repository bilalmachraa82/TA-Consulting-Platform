import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limiter';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Helper: Search company by name using internal API
 */
async function searchCompanyByName(nomeEmpresa: string, nif?: string) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/lead-chat/search-company`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nomeEmpresa, nif }),
        });

        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.error('[Chat] Company search failed:', error);
    }
    return null;
}

// System prompt para o assistente INTELIGENTE
const SYSTEM_PROMPT = `# TA Consulting - Assistente Inteligente de Fundos Europeus

## OBJETIVO PRINCIPAL
Ajudar empresas a descobrir fundos europeus (PT2030, PRR, PEPAC) de forma INTELIGENTE e CONVERSACIONAL.

## CAPACIDADES ESPECIAIS
Tens acesso a pesquisa na internet. Podes:
- Pesquisar empresas por nome em NIF.PT, Racius, etc.
- Validar NIFs
- Encontrar setor, CAE, morada automaticamente

## PERSONALIDADE
- 🧠 **INTELIGENTE**: Usa as tuas capacidades de pesquisa
- 💬 **NATURAL**: Fala como humano, não como robô
- 🎯 **DIRETO**: Vai ao ponto, não enerves o user
- ✨ **PROATIVO**: Antecipa necessidades, não espares que ele diga tudo

## FLUXO INTELIGENTE

### 1. Quando o user dá o nome da empresa
**IMEDIATAMENTE:**
- Usa searchCompany para pesquisar
- Encontra NIF, setor, região automaticamente
- **CONFIRMA com o user**: "Encontrei a empresa X com NIF Y. Confirmas?"

### 2. Sobre fundos abertos
**RESPONDE DIRETAMENTE:**
- Pesquisa fundos atuais
- Dá exemplos relevantes
- NÃO exijas dados para responder perguntas gerais

### 3. Sobre NIF
- Se ele der o nome, pesquisa TUA a empresa
- Diz: "Deixa-me pesquisar a empresa..."
- Apresenta os dados encontrados e pede confirmação

### 4. Validações
- Se encontrares dados, mostra e pede confirmação
- Se não encontrares, pede ajuda ao user
- NÃO sejas insistente de forma estúpida

## RESPOSTA FORMATO JSON

\`\`\`json
{
  "message": "tua resposta conversacional",
  "extracted": {
    "nome_empresa": "valor ou null",
    "nif": "valor ou null",
    "setor": "valor ou null",
    "regiao": "valor ou null",
    "email": "valor ou null"
  },
  "company_found": {
    "nif": "...",
    "nome": "...",
    "morada": "...",
    "setor": "...",
    "confianca": "ALTA"
  },
  "missing": [],
  "complete": false,
  "action": "continue" // | "submit" | "search_company" | "confirm_data"
}
\`\`\`

## EXEMPLOS DE CONVERSA INTELIGENTE

### Exemplo 1: User pergunta sobre fundos
User: "quais fundos abertos atualmente"
Bot: {
  "message": "🎯 **Fundos Abertos Agora:**\\n\\n**PT2030 - Convite 58/C 109**\\n- Turismo de natureza\\n- Deadline: 15 Mar\\n\\n**PRR - Avisos 42-51**\\n- Digitalização PME\\n- Eficiência energética\\n\\nPara te indicar os MELHORES para a tua empresa, qual é o nome?",
  "extracted": {},
  "missing": ["nome_empresa"],
  "complete": false,
  "action": "continue"
}

### Exemplo 2: User dá nome - pesquisar automaticamente
User: "somos a techcorp"
Bot: {
  "message": "🔍 Deixa-me pesquisar a TechCorp...",
  "extracted": {},
  "action": "search_company"
}
// Depois da pesquisa:
{
  "message": "✅ Encontrei! **TechCorp, Lda**\\n\\n📋 NIF: 508123456\\n📍 Porto, Software\\n\\nConfirmas que é esta a empresa?",
  "extracted": {"nome_empresa": "TechCorp, Lda", "nif": "508123456", "setor": "Software", "regiao": "Norte"},
  "company_found": {"nif": "508123456", "nome": "TechCorp, Lda", "setor": "Software", "confianca": "ALTA"},
  "action": "confirm_data"
}

### Exemplo 3: User quer dar NIF
User: "o nif é 508123456"
Bot: {
  "message": "🔍 Validando NIF...",
  "extracted": {},
  "action": "search_company"
}

### Exemplo 4: User recusa dados encontrados
User: "nao é essa"
Bot: {
  "message": "Sem problemas! Podes dizer-me:\\n\\n1. O nome correto da empresa\\n2. Ou o NIF direto\\n\\nAssim pesquisamos novamente.",
  "extracted": {},
  "action": "continue"
}

### Exemplo 5: Saudação inteligente
User: "ola"
Bot: {
  "message": "Olá! 👋 Vou encontrar os melhores fundos para a tua empresa.\\n\\nPodes começar por:\\n• Dizer o nome da empresa (eu pesquiso o resto!)\\n• Ou perguntar que fundos estão abertos",
  "extracted": {},
  "action": "continue"
}

### Exemplo 6: User quer saber fundos SEM dar dados
User: "podes dizer-me apenas os fundos abertos para pme"
Bot: {
  "message": "🎯 **Fundos PME Abertos:**\\n\\n**PT2030**\\n• Inovação PME - até €200K\\n• Internacionalização - até €100K\\n\\n**PRR**\\n• Transição Digital - até €50K\\n• Eficiência Energética - até €30K\\n\\nPara saber quais se aplicam a ti, basta dizeres o nome da empresa que eu pesquiso o NIF e setor automaticamente! 🚀",
  "extracted": {},
  "action": "continue"
}

## COMANDOS ESPECIAIS

No campo "action" usa:
- **"search_company"**: Pesquisar empresa (nome detetado)
- **"confirm_data"**: Pedir confirmação dos dados encontrados
- **"continue"**: Continuar conversa normalmente
- **"submit"**: Submeter para matching

## REGRAS DE OURO

1. **NUNCA** repitas a mesma pergunta se o user já respondeu algo relacionado
2. **SEMPRE** pesquisa a empresa quando o user der o nome
3. **RESPONDE** a perguntas sobre fundos SEM exigir dados primeiro
4. **CONFIRMA** dados encontrados com o user antes de avançar
5. **NÃO** sejas robótico com "preciso do NIF" - pesquisa tu mesmo!

## FUNDS DATA (Contexto)
Usa estes dados para responder perguntas gerais:
- PT2030: ~100 avisos ativos, até €2M por projeto
- PRR: ~499 avisos, focused em transição verde e digital
- PEPAC: ~9 avisos, agricultura e desenvolvimento rural
- Portugal 2020: ainda alguns avisos com deadline curto

Lembra: Tens acesso à internet. Usa-a! 🌐
`;

export async function POST(req: NextRequest) {
  // Initialize defaults for error handling
  let extractedData: any = {};
  let companyFound: any = null;
  let messages: any[] = [];

  // Public endpoint — no session required, but rate limit to prevent abuse
  const ip = getClientIP(req);
  const rateLimit = checkRateLimit(`lead-chat:${ip}`, RATE_LIMITS.CHATBOT);
  if (!rateLimit.success) {
    return NextResponse.json(
      { message: 'Demasiadas mensagens. Por favor aguarde antes de continuar.', error: true },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    messages = body.messages || [];
    extractedData = body.extractedData || {};
    companyFound = body.companyFound || null;

    // Build conversation history
    const conversationHistory = messages.map((m: any) =>
      m.role === 'user' ? `User: ${m.content}` : `Assistant: ${m.content}`
    ).join('\n');

    // Build current extracted data context
    const extractedContext = Object.entries(extractedData || {})
      .filter(([_, v]) => v !== null && v !== '')
      .map(([k, v]) => `${k} = ${v}`)
      .join(', ');

    // Build company found context
    const companyContext = companyFound
      ? `\n## EMPRESA ENCONTRADA (se aplicável)\n${JSON.stringify(companyFound, null, 2)}`
      : '';

    const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop()?.content || '';

    const prompt = `${SYSTEM_PROMPT}

## CONTEXTO ATUAL
Dados já extraídos: {${extractedContext || 'nenhum'}}${companyContext}

## HISTÓRICO DE CONVERSA
${conversationHistory}

## ÚLTIMA MENSAGEM DO USER
${lastUserMessage}

## TUA VEZ
Responde em JSON seguindo o formato acima.

**IMPORTANTE:**
- Se o user mencionou nome de empresa, usa action="search_company"
- Se já temos dados da empresa, pede confirmação com action="confirm_data"
- Se o user pergunta sobre fundos, RESPONDE DIRETAMENTE sem pedir dados primeiro
- SÊ CONVERSACIONAL, não robótico!`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.8, // Higher for more natural conversation
        maxOutputTokens: 800,
      }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response.text();

    // Extract JSON from response
    let jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) ||
                   response.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return NextResponse.json({
        message: response.substring(0, 300) || "Vamos continuar...",
        extracted: {},
        missing: [],
        complete: false,
        action: "continue"
      });
    }

    const jsonStr = jsonMatch[1] || jsonMatch[0];

    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      // Try to clean JSON
      parsed = JSON.parse(jsonStr.replace(/[\n\r\t]/g, ' ').replace(/\s+/g, ' '));
    }

    // Handle search_company action
    if (parsed.action === 'search_company' && parsed.extracted?.nome_empresa) {
      const searchResult = await searchCompanyByName(
        parsed.extracted.nome_empresa,
        parsed.extracted.nif
      );

      if (searchResult?.found) {
        return NextResponse.json({
          message: parsed.message || "🔍 Encontrei a tua empresa!",
          extracted: {
            nome_empresa: searchResult.nome,
            nif: searchResult.nif,
            setor: searchResult.setor || searchResult.atividade,
            regiao: searchResult.distrito || searchResult.concelho,
          },
          company_found: searchResult,
          action: 'confirm_data',
          complete: false
        });
      }
    }

    return NextResponse.json(parsed);

  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({
      message: "Vamos continuar...",
      extracted: extractedData || {},
      missing: [],
      complete: false,
      action: "continue",
      error: true
    }, { status: 500 });
  }
}
