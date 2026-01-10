/**
 * Horizon Europe API Integration v2
 * Source: EU Funding & Tenders Portal Public Search API
 * 
 * The official portal uses a search API at api.tech.ec.europa.eu
 * This implementation uses the documented public endpoints.
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
    description?: string;
    scraped_at: string;
}

// API response structure - metadata fields are arrays
interface FTPortalResult {
    metadata: {
        identifier?: string[];
        title?: string[];
        callIdentifier?: string[];
        deadlineDate?: string[];
        status?: string[];
        frameworkProgramme?: string[];
        programmeDivision?: string[];
        typesOfAction?: string[];
        budgetOverview?: string[];
        url?: string[];
        description?: string[];
    };
}

export class HorizonEuropeScraper {
    // Official EU Search API endpoint
    private readonly SEARCH_API = 'https://api.tech.ec.europa.eu/search-api/prod/rest/search';
    private readonly PORTAL_BASE = 'https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/opportunities/topic-details';

    async scrape(): Promise<HorizonOpportunity[]> {
        console.log('🇪🇺 Scraping Horizon Europe via F&T Portal API...');

        const opportunities: HorizonOpportunity[] = [];

        try {
            // Method 1: Direct topic search API
            const apiResults = await this.searchOpenTopics();
            opportunities.push(...apiResults);
            console.log(`✅ F&T Portal API: ${apiResults.length} topics found`);
        } catch (error) {
            console.warn('⚠️ F&T Portal API failed:', error);

            // Method 2: Fallback to static known calls
            const fallbackResults = this.getKnownOpenCalls();
            opportunities.push(...fallbackResults);
            console.log(`📋 Using fallback data: ${fallbackResults.length} known calls`);
        }

        // Deduplicate
        const unique = this.removeDuplicates(opportunities);
        console.log(`✅ Horizon Europe total: ${unique.length} opportunities`);

        return unique;
    }

    private async searchOpenTopics(): Promise<HorizonOpportunity[]> {
        // The F&T Portal uses a specific query format
        // Search for open/forthcoming topics in Horizon Europe
        const query = {
            bool: {
                must: [
                    { term: { type: 'topic' } },
                    { terms: { status: ['open', 'forthcoming', 'Open', 'Forthcoming'] } }
                ],
                should: [
                    { terms: { frameworkProgramme: ['HORIZON', 'HE', 'Horizon Europe'] } }
                ]
            }
        };

        const params = new URLSearchParams({
            apiKey: 'SEDIA', // Public API key used by the portal
            text: '*',
            pageSize: '100',
            pageNumber: '1',
            sort: 'deadlineDate:asc'
        });

        const response = await fetch(`${this.SEARCH_API}?${params}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (compatible; TA-Consulting-Bot/1.0)'
            },
            body: JSON.stringify({
                query: query,
                languages: ['en']
            })
        });

        if (!response.ok) {
            throw new Error(`API returned ${response.status}`);
        }

        const data = await response.json();

        // Map results - metadata fields are arrays
        const results = (data.results || []) as FTPortalResult[];

        // Accept all topics with valid titles - the API query already filters by type
        return results
            .map(r => this.mapResultToOpportunity(r))
            .filter(o => o.title !== 'Unknown Topic' && o.title.length > 5);
    }

    private isHorizonEurope(result: FTPortalResult): boolean {
        const framework = result.metadata?.frameworkProgramme?.[0]?.toLowerCase() || '';
        const programme = result.metadata?.programmeDivision?.[0]?.toLowerCase() || '';

        return framework.includes('horizon') ||
            framework.includes('he') ||
            programme.includes('horizon') ||
            programme.includes('msca') ||
            programme.includes('eic');
    }

    private mapResultToOpportunity(result: FTPortalResult): HorizonOpportunity {
        const m = result.metadata;

        const identifier = m.identifier?.[0] || m.callIdentifier?.[0] || `UNKNOWN_${Date.now()}`;
        const title = m.title?.[0] || 'Unknown Topic';
        const deadline = m.deadlineDate?.[0] || this.estimateDeadline();
        const status = m.status?.[0]?.toLowerCase() || 'forthcoming';
        const callId = m.callIdentifier?.[0];

        // Extract budget from budgetOverview JSON if available
        let budget: string | undefined;
        if (m.budgetOverview?.[0]) {
            try {
                const budgetData = JSON.parse(m.budgetOverview[0]);
                const years = Object.values(budgetData.budgetTopicActionMap || {}).flat() as any[];
                const totalBudget = years.reduce((sum, y) => {
                    const yearBudgets = Object.values(y?.budgetYearMap || {}) as number[];
                    return sum + yearBudgets.reduce((a, b) => a + b, 0);
                }, 0);
                if (totalBudget > 0) {
                    budget = totalBudget >= 1000000
                        ? `€${(totalBudget / 1000000).toFixed(1)}M`
                        : `€${(totalBudget / 1000).toFixed(0)}K`;
                }
            } catch {
                // Ignore parse errors
            }
        }

        return {
            id: `HORIZON_${identifier}`,
            title: title,
            topics: [],
            deadline: deadline,
            budget: budget,
            programme: m.frameworkProgramme?.[0] || 'Horizon Europe',
            callIdentifier: callId,
            type: status === 'open' ? 'open' : status === 'closed' ? 'closed' : 'forthcoming',
            url: m.url?.[0] || `${this.PORTAL_BASE}/${identifier}`,
            description: m.description?.[0]?.substring(0, 500),
            scraped_at: new Date().toISOString()
        };
    }

    private getKnownOpenCalls(): HorizonOpportunity[] {
        // Fallback: Known active Horizon Europe work programmes
        // These are generally valid for 2024-2025
        const knownProgrammes = [
            {
                id: 'HORIZON_CLUSTER1_HEALTH',
                title: 'Horizon Europe - Cluster 1: Health',
                programme: 'Horizon Europe',
                type: 'open' as const,
                url: 'https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/programmes/horizon',
                topics: ['Health', 'Medical Research', 'Digital Health']
            },
            {
                id: 'HORIZON_CLUSTER2_CULTURE',
                title: 'Horizon Europe - Cluster 2: Culture, Creativity & Inclusive Society',
                programme: 'Horizon Europe',
                type: 'open' as const,
                url: 'https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/programmes/horizon',
                topics: ['Culture', 'Social Sciences', 'Humanities']
            },
            {
                id: 'HORIZON_CLUSTER4_DIGITAL',
                title: 'Horizon Europe - Cluster 4: Digital, Industry & Space',
                programme: 'Horizon Europe',
                type: 'open' as const,
                url: 'https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/programmes/horizon',
                topics: ['Digital', 'Industry 4.0', 'Space', 'AI']
            },
            {
                id: 'HORIZON_CLUSTER5_CLIMATE',
                title: 'Horizon Europe - Cluster 5: Climate, Energy & Mobility',
                programme: 'Horizon Europe',
                type: 'open' as const,
                url: 'https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/programmes/horizon',
                topics: ['Climate', 'Renewable Energy', 'Green Mobility']
            },
            {
                id: 'HORIZON_CLUSTER6_FOOD',
                title: 'Horizon Europe - Cluster 6: Food, Bioeconomy & Natural Resources',
                programme: 'Horizon Europe',
                type: 'open' as const,
                url: 'https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/programmes/horizon',
                topics: ['Agriculture', 'Food Security', 'Biodiversity']
            },
            {
                id: 'HORIZON_EIC_ACCELERATOR',
                title: 'EIC Accelerator - Horizon Europe',
                programme: 'Horizon Europe - EIC',
                type: 'open' as const,
                url: 'https://eic.ec.europa.eu/eic-funding-opportunities/eic-accelerator_en',
                topics: ['SME', 'Startups', 'Innovation', 'Scale-up']
            },
            {
                id: 'HORIZON_MSCA',
                title: 'Marie Skłodowska-Curie Actions',
                programme: 'Horizon Europe - MSCA',
                type: 'open' as const,
                url: 'https://marie-sklodowska-curie-actions.ec.europa.eu/',
                topics: ['Research Mobility', 'Training', 'Fellowships']
            }
        ];

        return knownProgrammes.map(p => ({
            ...p,
            deadline: this.estimateDeadline(),
            scraped_at: new Date().toISOString()
        }));
    }

    private estimateDeadline(): string {
        // Most Horizon calls have quarterly deadlines
        const date = new Date();
        date.setMonth(date.getMonth() + 3);
        return date.toISOString().split('T')[0];
    }

    private removeDuplicates(opportunities: HorizonOpportunity[]): HorizonOpportunity[] {
        const seen = new Set<string>();
        return opportunities.filter(opp => {
            const key = opp.id || opp.title.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }
}