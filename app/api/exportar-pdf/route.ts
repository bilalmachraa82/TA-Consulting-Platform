import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { tipo, ids = [] } = await request.json();

    let dados: any[] = [];
    let titulo = '';

    // Buscar dados baseado no tipo
    if (tipo === 'avisos') {
      titulo = 'Relatório de Avisos';
      dados = await prisma.aviso.findMany({
        where: ids.length > 0 ? { id: { in: ids } } : {},
        orderBy: { createdAt: 'desc' },
      });
    } else if (tipo === 'empresas') {
      titulo = 'Relatório de Empresas';
      dados = await prisma.empresa.findMany({
        where: ids.length > 0 ? { id: { in: ids } } : {},
        include: { candidaturas: true },
      });
    } else if (tipo === 'candidaturas') {
      titulo = 'Relatório de Candidaturas';
      dados = await prisma.candidatura.findMany({
        where: ids.length > 0 ? { id: { in: ids } } : {},
        include: {
          aviso: true,
          empresa: true,
        },
        orderBy: { dataSubmissao: 'desc' },
      });
    } else {
      return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 });
    }

    // Gerar HTML para PDF usando a API LLM
    const prompt = `
Gere um documento HTML profissional e bem formatado para exportação como PDF.

TÍTULO: ${titulo}
DATA: ${new Date().toLocaleDateString('pt-PT')}
TOTAL DE REGISTOS: ${dados.length}

DADOS (JSON):
${JSON.stringify(dados, null, 2)}

INSTRUÇÕES:
1. Crie um HTML completo e válido com <!DOCTYPE html>
2. Use CSS inline para formatação profissional
3. Inclua cabeçalho com logo TA Consulting e data
4. Organize os dados em tabelas ou cards bem formatados
5. Use cores profissionais (azul, roxo, cinza)
6. Adicione rodapé com informações da empresa
7. Seja conciso mas informativo
8. Responda APENAS com o código HTML, sem explicações

Responda com raw HTML apenas, sem markdown ou code blocks.
`;

    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 4000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error('Erro ao gerar HTML para PDF');
    }

    const result = await response.json();
    const htmlContent = result.choices[0].message.content;

    return NextResponse.json({ html: htmlContent, dados });
  } catch (error) {
    console.error('Erro ao exportar PDF:', error);
    return NextResponse.json(
      { error: 'Erro ao exportar PDF' },
      { status: 500 }
    );
  }
}
