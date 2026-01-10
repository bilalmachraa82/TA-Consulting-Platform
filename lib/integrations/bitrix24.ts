/**
 * Bitrix24 Integration Client
 * 
 * Handles communication with Bitrix24 CRM via Webhooks or REST API.
 * Maps CRM entities (Contacts/Companies/Deals) to internal platform models.
 */

import { DimensaoEmpresa } from "@prisma/client";

export interface BitrixCompany {
    ID: string;
    TITLE: string;
    COMPANY_TYPE: string;
    INDUSTRY: string;
    REVENUE: string;
    EMPLOYEES: string;
    CURRENCY_ID: string;
    COMMENTS: string;
    DATE_CREATE: string;
    DATE_MODIFY: string;
    // Custom fields (presumed based on meeting)
    UF_CRM_NIF?: string;
    UF_CRM_CAE?: string;
    UF_CRM_REGION?: string;
    UF_CRM_DISTRICT?: string;
}

export interface BitrixLead {
    ID: string;
    TITLE: string;
    NAME: string;
    LAST_NAME: string;
    EMAIL: { VALUE: string }[];
    PHONE: { VALUE: string }[];
    STATUS_ID: string;
    UF_CRM_NIF?: string;
}

export class Bitrix24Client {
    private webhookUrl: string;

    constructor(webhookUrl: string) {
        this.webhookUrl = webhookUrl.endsWith('/') ? webhookUrl : `${webhookUrl}/`;
    }

    /**
     * Call Bitrix24 REST API method
     */
    private async callMethod(method: string, params: any = {}) {
        const response = await fetch(`${this.webhookUrl}${method}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Bitrix24 API Error (${method}): ${error}`);
        }

        return await response.json();
    }

    /**
     * Get company details by ID
     */
    async getCompany(id: string): Promise<BitrixCompany> {
        const result = await this.callMethod('crm.company.get', { id });
        return result.result;
    }

    /**
     * Search companies by NIF (custom field)
     */
    async findCompanyByNif(nif: string): Promise<BitrixCompany[]> {
        const result = await this.callMethod('crm.company.list', {
            filter: { 'UF_CRM_NIF': nif },
            select: ['ID', 'TITLE', 'UF_CRM_NIF', 'UF_CRM_CAE', 'UF_CRM_REGION', 'REVENUE', 'EMPLOYEES']
        });
        return result.result;
    }

    /**
     * List companies with pagination
     */
    async listCompanies(start = 0, limit = 50): Promise<{ result: BitrixCompany[], total: number }> {
        const response = await this.callMethod('crm.company.list', {
            order: { 'DATE_CREATE': 'DESC' },
            select: ['*', 'UF_CRM_*'],
            start
        });
        return {
            result: response.result,
            total: response.total
        };
    }

    /**
     * Map Bitrix Company to internal Empresa model
     */
    static mapToInternalEmpresa(bitrixComp: BitrixCompany) {
        return {
            nipc: bitrixComp.UF_CRM_NIF || '',
            nome: bitrixComp.TITLE || '',
            cae: bitrixComp.UF_CRM_CAE || '',
            setor: bitrixComp.INDUSTRY || 'Desconhecido',
            dimensao: this.parseDimensao(bitrixComp.EMPLOYEES),
            regiao: bitrixComp.UF_CRM_REGION,
            distrito: bitrixComp.UF_CRM_DISTRICT,
            // Additional fields can be mapped here
        };
    }

    private static parseDimensao(employees: string | undefined): DimensaoEmpresa {
        const count = parseInt(employees || '0');
        if (count < 10) return "MICRO";
        if (count < 50) return "PEQUENA";
        if (count < 250) return "MEDIA";
        return "GRANDE";
    }
}
