import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const startTime = Date.now();

    try {
        console.log('🔥 Iniciando scraping direto da API Portugal 2030...');

        // Fazer request direto para a API WordPress
        const apiUrl = 'https://portugal2030.pt/wp-json/wp/v2/posts';
        const perPage = 20; // Limitar a 20 posts mais recentes

        const response = await fetch(`${apiUrl}?per_page=${perPage}&status=publish`, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (compatible; TA-Platform/1.0; +https://ta-consulting.pt)'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const posts = await response.json();

        // Filtrar e transformar dados relevantes
        const avisos = posts
            .filter((post: any) => {
                const title = post.title.rendered.toLowerCase();
                const content = post.content.rendered.toLowerCase();

                // Procurar por termos relevantes em avisos/candidaturas
                return title.includes('aviso') ||
                       title.includes('candidatura') ||
                       title.includes('concurso') ||
                       title.includes('apoio') ||
                       title.includes('convocatória') ||
                       title.includes('seleção') ||
                       content.includes('aviso de abertura') ||
                       content.includes('candidatura');
            })
            .map((post: any) => {
                // Extrair URL do PDF se existir
                const pdfMatch = post.content.rendered.match(/href="([^"]*\.pdf)"/i);
                const pdfUrl = pdfMatch ? pdfMatch[1] : '';

                // Tentar extrair data de fecho do conteúdo
                let dataFecho = '';
                const deadlineRegex = /(\d{2}[-/]\d{2}[-/]\d{4})/;
                const deadlineMatch = post.content.rendered.match(deadlineRegex);
                if (deadlineMatch) {
                    dataFecho = deadlineMatch[1].replace(/\//g, '-');
                } else {
                    // Calcular deadline estimado (60 dias após publicação)
                    const date = new Date(post.date);
                    date.setDate(date.getDate() + 60);
                    dataFecho = date.toISOString().split('T')[0];
                }

                return {
                    id: `PT2030_${post.id}`,
                    titulo: post.title.rendered.replace(/<[^>]*>/g, '').trim(),
                    descricao: post.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 500),
                    url: post.link,
                    data: post.date.split('T')[0],
                    data_fecho: dataFecho,
                    programa: 'Portugal 2030',
                    pdf_url: pdfUrl,
                    categoria: post.categories?.[0] ? `CAT_${post.categories[0]}` : 'Geral',
                    tags: post.tags || []
                };
            });

        const duration = Date.now() - startTime;

        console.log(`✅ Scraping Portugal 2030 concluído em ${duration}ms`);
        console.log(`📊 Total de posts processados: ${posts.length}`);
        console.log(`📋 Avisos encontrados: ${avisos.length}`);

        return NextResponse.json({
            success: true,
            portal: 'Portugal 2030',
            method: 'direct-api',
            count: avisos.length,
            total_posts: posts.length,
            duration_ms: duration,
            data: avisos
        });

    } catch (error: any) {
        console.error('❌ Erro no scraping direto:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}