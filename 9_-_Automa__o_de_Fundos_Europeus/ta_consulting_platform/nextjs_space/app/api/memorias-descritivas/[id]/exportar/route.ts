
// API para exportar Memória Descritiva para DOCX
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType } from 'docx';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

// GET: Exportar memória para DOCX
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const formato = searchParams.get('formato') || 'docx'; // docx ou markdown

    // Buscar memória completa
    const memoria = await prisma.memoriaDescritiva.findUnique({
      where: { id: params.id },
      include: {
        empresa: true,
        aviso: true,
        seccoes: {
          orderBy: {
            numeroSeccao: 'asc',
          },
        },
      },
    });

    if (!memoria) {
      return NextResponse.json({ error: 'Memória não encontrada' }, { status: 404 });
    }

    if (formato === 'markdown') {
      // Exportar como Markdown
      let markdown = `# ${memoria.titulo}\n\n`;
      markdown += `**Empresa:** ${memoria.empresa.nome} (${memoria.empresa.nipc})\n`;
      markdown += `**Aviso:** ${memoria.aviso.nome} (${memoria.aviso.codigo})\n`;
      markdown += `**Data:** ${new Date().toLocaleDateString('pt-PT')}\n\n`;
      markdown += `---\n\n`;

      for (const seccao of memoria.seccoes) {
        markdown += `## ${seccao.titulo}\n\n`;
        markdown += `${seccao.conteudo}\n\n`;
        markdown += `---\n\n`;
      }

      return new NextResponse(markdown, {
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Content-Disposition': `attachment; filename="memoria_${memoria.id}.md"`,
        },
      });
    }

    // Exportar como DOCX
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Cabeçalho
          new Paragraph({
            text: memoria.titulo,
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),

          // Informações da candidatura
          new Paragraph({
            children: [
              new TextRun({ text: 'Empresa: ', bold: true }),
              new TextRun({ text: `${memoria.empresa.nome} (${memoria.empresa.nipc})` }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Aviso/Programa: ', bold: true }),
              new TextRun({ text: `${memoria.aviso.nome}` }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Código: ', bold: true }),
              new TextRun({ text: memoria.aviso.codigo }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Portal: ', bold: true }),
              new TextRun({ text: memoria.aviso.portal }),
            ],
            spacing: { after: 400 },
          }),

          // Linha separadora
          new Paragraph({
            text: '_______________________________________________',
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),

          // Secções
          ...memoria.seccoes.flatMap(seccao => [
            new Paragraph({
              text: seccao.titulo,
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 400, after: 240 },
            }),
            ...parseContentToParagraphs(seccao.conteudo),
            new Paragraph({
              text: '', // Espaçamento entre secções
              spacing: { after: 400 },
            }),
          ]),
        ],
      }],
    });

    // Gerar buffer do documento
    const buffer = await Packer.toBuffer(doc);

    // Retornar DOCX
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="memoria_${memoria.empresa.nome}_${new Date().toISOString().split('T')[0]}.docx"`,
      },
    });
  } catch (error) {
    console.error('Erro ao exportar memória:', error);
    return NextResponse.json(
      { error: 'Erro ao exportar memória' },
      { status: 500 }
    );
  }
}

// Converter conteúdo markdown em parágrafos do Word
function parseContentToParagraphs(content: string): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      // Linha vazia - adicionar espaçamento
      paragraphs.push(new Paragraph({ text: '', spacing: { after: 120 } }));
      continue;
    }

    // Detectar títulos markdown (##, ###, etc.)
    if (line.startsWith('###')) {
      paragraphs.push(new Paragraph({
        text: line.replace(/^###\s*/, ''),
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 240, after: 120 },
      }));
      continue;
    }

    if (line.startsWith('##')) {
      paragraphs.push(new Paragraph({
        text: line.replace(/^##\s*/, ''),
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 320, after: 160 },
      }));
      continue;
    }

    // Detectar listas (- ou * ou 1.)
    if (line.match(/^[*\-]\s/) || line.match(/^\d+\.\s/)) {
      const bulletText = line.replace(/^[*\-]\s/, '').replace(/^\d+\.\s/, '');
      paragraphs.push(new Paragraph({
        text: bulletText,
        bullet: { level: 0 },
        spacing: { after: 100 },
      }));
      continue;
    }

    // Parágrafo normal - processar negrito e itálico
    const runs = parseInlineFormatting(line);
    paragraphs.push(new Paragraph({
      children: runs,
      spacing: { after: 200 },
      alignment: AlignmentType.JUSTIFIED,
    }));
  }

  return paragraphs;
}

// Processar formatação inline (negrito, itálico)
function parseInlineFormatting(text: string): TextRun[] {
  const runs: TextRun[] = [];
  const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|([^*]+)/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match[2]) {
      // Negrito
      runs.push(new TextRun({ text: match[2], bold: true }));
    } else if (match[4]) {
      // Itálico
      runs.push(new TextRun({ text: match[4], italics: true }));
    } else if (match[5]) {
      // Texto normal
      runs.push(new TextRun({ text: match[5] }));
    }
  }

  return runs.length > 0 ? runs : [new TextRun({ text })];
}
