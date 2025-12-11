/**
 * Horizon Europe API Integration
 * Fonte: CORDIS API v3 e Funding & Tenders Portal
 */

export interface HorizonOpportunity {
    id: string;
    title: string;
    topics: string[];
    deadline: string;
    budget?: string;
    programme: string;
    callIdentifier?: string;
    type: 'open' | 'closed' | 'forthcoming';
    url: string;
    coordinatorRequirements?: string;
    countries?: string[];
    scraped_at: string;
}

export class HorizonEuropeScraper {
    private readonly CORDIS_BASE = 'https://cordis.europa.eu/api/v3';
    private readonly FUNDING_BASE = 'https://ec.europa.eu/info/funding-tenders/opportunities';

    async scrape(): Promise<HorizonOpportunity[]> {
        console.log('🇪🇺 Scraping Horizon Europe via API...');

        const opportunities: HorizonOpportunity[] = [];

        // 1. Obter calls abertas do CORDIS
        try {
            const cordisCalls = await this.getCordisCalls();
            opportunities.push(...cordisCalls);
            console.log(`✅ CORDIS: ${cordisCalls.length} calls encontrados`);
        } catch (error) {
            console.warn('⚠️ Falha no CORDIS API:', error);
        }

        // 2. Buscar calls do Funding Portal
        try {
            const fundingCalls = await this.getFundingPortalCalls();
            opportunities.push(...fundingCalls);
            console.log(`✅ Funding Portal: ${fundingCalls.length} calls encontrados`);
        } catch (error) {
            console.warn('⚠️ Falha no Funding Portal:', error);
        }

        // 3. Remover duplicados
        const unique = this.removeDuplicates(opportunities);

        console.log(`✅ Horizon Europe total: ${unique.length} oportunidades`);
        return unique;
    }

    private async getCordisCalls(): Promise<HorizonOpportunity[]> {
        const today = new Date().toISOString().split('T')[0];

        // Buscar calls ativas dos próximos 6 meses
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 6);
        const futureDate = endDate.toISOString().split('T')[0];

        const response = await fetch(
            `${this.CORDIS_BASE}/calls/calls?status=open&from=${today}&to=${futureDate}`,
            {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (compatible; TA-Consulting-Bot/1.0)'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`CORDIS API error: ${response.status}`);
        }

        const data = await response.json();

        return data.payload?.map((call: any) => ({
            id: `HORIZON_${call.id}`,
            title: call.title || call.shortTitle,
            topics: call.topics || [],
            deadline: call.deadlineDates?.submissionDeadline || '',
            budget: call.budget,
            programme: 'Horizon Europe',
            callIdentifier: call.identifier,
            type: call.status === 'Open' ? 'open' : 'closed',
            url: call.url || `${this.CORDIS_BASE}/call/id/${call.id}`,
            scraped_at: new Date().toISOString()
        })) || [];
    }

    private async getFundingPortalCalls(): Promise<HorizonOpportunity[]> {
        // Tentar RSS feed primeiro
        const rssUrl = `${this.FUNDING_BASE}/rss_en`;

        try {
            const response = await fetch(rssUrl);
            if (response.ok) {
                const text = await response.text();
                return this.parseRSSFeed(text);
            }
        } catch (e) {
            // Continuar para método alternativo
        }

        // Fallback: página HTML
        const htmlUrl = `${this.FUNDING_BASE}/portal/screen/home`;
        const response = await fetch(htmlUrl);

        if (!response.ok) {
            return [];
        }

        const html = await response.text();

        // Usar regex para encontrar calls (simplificado)
        const callMatches = html.match(/<a[^>]*href="([^"]*)"[^>]*>([^<]*(?:Horizon|HORIZON)[^<]*call[^<]*)<\/a>/gi) || [];

        return callMatches.map((match, i) => {
            const urlMatch = match.match(/href="([^"]*)"/);
            const titleMatch = match.match(/>([^<]+)</);

            return {
                id: `HORIZON_FUNDING_${i}`,
                title: titleMatch ? titleMatch[1] : 'Horizon Europe Call',
                topics: [],
                deadline: this.estimateDeadline(),
                programme: 'Horizon Europe',
                type: 'open' as const,
                url: urlMatch ? (urlMatch[1].startsWith('http') ? urlMatch[1] : `https://ec.europa.eu${urlMatch[1]}`) : '',
                scraped_at: new Date().toISOString()
            };
        });
    }

    private parseRSSFeed(xml: string): HorizonOpportunity[] {
        const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];

        return items.map((item, i) => {
            const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/);
            const linkMatch = item.match(/<link>(.*?)<\/link>/);
            const descMatch = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/);

            // Extrair deadline da descrição
            const deadline = this.extractDeadline(descMatch ? descMatch[2] : '');

            return {
                id: `HORIZON_RSS_${i}`,
                title: titleMatch ? titleMatch[2] : 'Horizon Europe Opportunity',
                topics: [],
                deadline: deadline,
                programme: 'Horizon Europe',
                type: 'open' as const,
                url: linkMatch ? linkMatch[1] : '',
                description: descMatch ? descMatch[2].replace(/<[^>]*>/g, '').substring(0, 500) : '',
                scraped_at: new Date().toISOString()
            };
        }).filter(item =>
            item.title.toLowerCase().includes('horizon') &&
            !item.title.toLowerCase().includes('closed')
        );
    }

    private extractDeadline(text: string): string {
        // Padrões comuns de deadline
        const patterns = [
            /deadline:\s*(\d{1,2}\/\d{1,2}\/\d{4})/i,
            /(\d{1,2}\s+\w+\s+\d{4})\s*at/i,
            /(\d{4}-\d{2}-\d{2})/
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                return match[1];
            }
        }

        // Estimar deadline se não encontrado
        return this.estimateDeadline();
    }

    private estimateDeadline(): string {
        // Horizons geralmente tem deadlines a cada 2-3 meses
        const date = new Date();
        date.setDate(date.getDate() + 60); // 2 meses no futuro
        return date.toISOString().split('T')[0];
    }

    private removeDuplicates(opportunities: HorizonOpportunity[]): HorizonOpportunity[] {
        const seen = new Set<string>();
        return opportunities.filter(opp => {
            const key = opp.title.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }
}