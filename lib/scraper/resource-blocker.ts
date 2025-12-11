/**
 * Resource Blocker for Puppeteer
 * Bloqueia recursos desnecessários para otimizar performance
 */

export class ResourceBlocker {
    private blockedTypes = new Set(['image', 'stylesheet', 'font', 'media']);
    private allowedDomains = new Set([
        'portugal2030.pt',
        'recuperarportugal.gov.pt',
        'ifap.pt',
        'pdr.pt',
        'ipdj.gov.pt',
        'europacriativa.eu',
        'ec.europa.eu'
    ]);

    static async setup(page: any): Promise<void> {
        await page.setRequestInterception(true);

        page.on('request', (request: any) => {
            const resourceType = request.resourceType();
            const url = request.url();

            // Permitir recursos críticos
            if (resourceType === 'document' ||
                resourceType === 'script' ||
                resourceType === 'xhr' ||
                resourceType === 'fetch') {
                request.continue();
                return;
            }

            // Bloquear imagens e styles para otimizar
            if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
                request.abort();
                return;
            }

            // Permitir APIs importantes
            if (url.includes('/api/') ||
                url.includes('/wp-json/') ||
                url.includes('/ajax/') ||
                url.includes('.json')) {
                request.continue();
                return;
            }

            // Bloquear recursos externos não essenciais
            if (url.includes('doubleclick') ||
                url.includes('google-analytics') ||
                url.includes('facebook') ||
                url.includes('analytics')) {
                request.abort();
                return;
            }

            // Continuar para outros casos
            request.continue();
        });
    }
}