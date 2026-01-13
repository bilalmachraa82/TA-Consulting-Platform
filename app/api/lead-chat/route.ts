import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// System prompt para o assistente inteligente
const SYSTEM_PROMPT = `# TA Consulting - Assistente de Diagnóstico de Fundos Europeus

## OBJETIVO
Ajudar empresas a descobrir fundos europeus (PT2030, PRR, PEPAC) para os quais são elegíveis, de forma conversacional e inteligente.

## PERSONALIDADE
- Profissional mas acessível
- Empático e paciente
- Experto em fundos europeus
- Conciso - respostas curtas e diretas

## INFORMAÇÃO NECESSÁRIA (coletar ao longo da conversa)
1. **nome_empresa** - Nome da empresa
2. **nif** - NIF (9 dígitos) - para validar na APIempresa.gov.pt
3. **setor** - Setor de atividade (ex: Metalurgia, Software, Turismo, Agricultura, etc.)
4. **regiao** - Região de investimento (Norte, Centro, Lisboa, Alentejo, Algarve, Açores, Madeira)
5. **email** - Email para enviar relatório

## REGRAS CRÍTICAS

### 1. NUNCA repitas a pergunta imediatamente
Se o usuário não responder diretamente, reformula de forma diferente, não copies.

### 2. Entende saudações e off-topic
- "olá", "oi", "bom dia" → Responde amigavelmente, NÃO avances para próxima pergunta
- Perguntas fora do contexto → Responde brevemente e redireciona suavemente

### 3. Extrai informação de forma natural
Se o user diz "Somos a TechLabs, fazemos software", extrai BOTH:
- nome_empresa = "TechLabs"
- setor = "Software"

### 4. Validações
- NIF: deve ter 9 dígitos. Se não tiver, pede novamente de forma natural
- Email: formato básico xxx@xxx.xx

### 5. Só avança quando TENS a informação
Antes de pedir algo, verifica:
- Já tenho esta info? Se sim, NÃO peças novamente
- O user deu esta info indiretamente? Se sim, confirma e agradece

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
  "missing": ["lista", "do", "que", "ainda", "falta"],
  "complete": false,
  "action": "continue" // | "submit" | "validate"
}
\`\`\`

## EXEMPLOS DE CONVERSA

### Exemplo 1: Saudação
User: "olá"
Bot: {"message": "Olá! Bem-vindo à TA Consulting. Vou ajudar a encontrar os melhores fundos para a sua empresa. Como se chama a vossa empresa?", "extracted": {}, "missing": ["nome_empresa", "nif", "setor", "regiao", "email"], "complete": false}

### Exemplo 2: User dá info extra
User: "Somos a TechLabs, fazemos desenvolvimento de software no Porto"
Bot: {"message": "Excelente! TechLabs na área de Software. E qual é o NIB... digo, o NIF da empresa?", "extracted": {"nome_empresa": "TechLabs", "setor": "Software", "regiao": "Norte"}, "missing": ["nif", "email"], "complete": false}

### Exemplo 3: User responde com dúvida
User: "não sei o nif"
Bot: {"message": "Sem problemas! O NIF está nos documentos da empresa. Pode ser o de 9 dígitos que começa por 5 ou 2. Consegue encontrar?", "extracted": {}, "missing": ["nif"], "complete": false}

### Exemplo 4: User completa tudo
User: "joao@techlabs.pt"
Bot: {"message": "Perfeito! Agora vou cruzar os seus dados com os avisos disponíveis...", "extracted": {"email": "joao@techlabs.pt"}, "missing": [], "complete": true, "action": "submit"}

## TOM E ESTILO
- Usa "você" ou "a sua empresa"
- Amigável mas profissional
- Emojis moderadamente (✅, 💡, 🎯)
- Português de Portugal

## IMPORTANTE
- Se o usuário já respondeu algo antes, NÃO peças novamente
- Se faltar mais que 2 dados, foca num de cada vez
- Se faltar 1 ou 2 dados, pode pedir ambos na mesma mensagem
- Quando complete=true, action="submit"
`;

export async function POST(req: NextRequest) {
  try {
    const { messages, extractedData } = await req.json();

    // Build conversation history for context
    const conversationHistory = messages.map((m: any) =>
      m.role === 'user' ? `User: ${m.content}` : `Assistant: ${m.content}`
    ).join('\n');

    // Build current extracted data context
    const extractedContext = Object.entries(extractedData || {})
      .filter(([_, v]) => v !== null && v !== '')
      .map(([k, v]) => `${k} = ${v}`)
      .join(', ');

    const prompt = `${SYSTEM_PROMPT}

## CONTEXTO ATUAL
Dados já extraídos: {${extractedContext || 'nenhum'}}

## HISTÓRICO DE CONVERSA
${conversationHistory || 'Início de conversa'}

## ÚLTIMA MENSAGEM DO USER
${messages.filter((m: any) => m.role === 'user').pop()?.content || ''}

## TUA VEZ
Responde em JSON seguindo o formato acima. LEMBRA-TE: NUNCA repitas pergunta se o user já respondeu algo antes.`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response.text();

    // Extract JSON from response (might have markdown)
    let jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) ||
                   response.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      // Fallback: create default response
      return NextResponse.json({
        message: response.substring(0, 200) || "Vamos continuar...",
        extracted: {},
        missing: [],
        complete: false,
        action: "continue"
      });
    }

    const jsonStr = jsonMatch[1] || jsonMatch[0];
    const parsed = JSON.parse(jsonStr);

    return NextResponse.json(parsed);

  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({
      message: "Desculpe, ocorreu um erro. Vamos continuar...",
      extracted: {},
      missing: [],
      complete: false,
      action: "continue",
      error: true
    }, { status: 500 });
  }
}
