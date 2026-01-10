
/**
 * Utilitário para processar streams SSE (Server-Sent Events) da API AbacusAI (OpenAI compatible).
 * Converte o fluxo de "data: {...}" em texto limpo para o cliente.
 */

export async function handleAbacusStream(response: Response): Promise<ReadableStream> {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    if (!reader) {
        throw new Error('Response body is null');
    }

    return new ReadableStream({
        async start(controller) {
            try {
                let buffer = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    buffer += chunk;

                    const lines = buffer.split('\n');
                    // Manter o último pedaço no buffer se não terminar em \n
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                        const trimmed = line.trim();
                        if (!trimmed || trimmed === 'data: [DONE]') continue;

                        if (trimmed.startsWith('data: ')) {
                            try {
                                const jsonStr = trimmed.slice(6); // Remove "data: "
                                const data = JSON.parse(jsonStr);

                                // Extrair conteúdo delta (formato standard OpenAI)
                                const content = data.choices?.[0]?.delta?.content || '';

                                if (content) {
                                    controller.enqueue(encoder.encode(content));
                                }
                            } catch (e) {
                                // Se falhar o parse JSON, ignoramos esta linha (pode ser keepalive ou lixo)
                                console.warn('Erro parse SSE:', e);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Erro no stream handler:', error);
                controller.error(error);
            } finally {
                controller.close();
            }
        },
    });
}
