/**
 * Push de leads do Eligivo para o HubSpot (o CRM da plataforma/aitipro).
 *
 * O Bitrix é do cliente (TA Consulting); o HubSpot é do Eligivo. Cada lead
 * captada em /encontrar-fundos vira um Contact no HubSpot + uma Note com o
 * contexto (NIF, setor, região, aviso de interesse). Gated em HUBSPOT_API_KEY:
 * se não estiver definido, é no-op silencioso (não bloqueia nem falha a lead).
 *
 * Token: HubSpot → Settings → Integrations → Private Apps → Create → scopes
 * crm.objects.contacts.write (+ crm.objects.notes ou crm.objects.contacts.write
 * cobre a note). Metê-lo como HUBSPOT_API_KEY no Vercel.
 */

const BASE = 'https://api.hubapi.com'

export interface HubspotLead {
    nome: string
    email: string
    nif: string
    telefone?: string
    setor?: string
    dimensao?: string
    regiao?: string
    cae?: string
    aviso?: { nome: string; portal: string } | null
    mensagem?: string
}

export interface HubspotResult {
    ok: boolean
    skipped?: boolean
    contactId?: string
    error?: string
}

export async function pushLeadToHubspot(lead: HubspotLead): Promise<HubspotResult> {
    const key = process.env.HUBSPOT_API_KEY
    if (!key) return { ok: false, skipped: true }

    const headers = { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }

    try {
        // 1) Upsert do Contact por email (idProperty=email → sem duplicados).
        const upsertRes = await fetch(`${BASE}/crm/v3/objects/contacts/batch/upsert`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                inputs: [{
                    idProperty: 'email',
                    id: lead.email,
                    properties: {
                        email: lead.email,
                        firstname: lead.nome,
                        phone: lead.telefone ?? '',
                        lifecyclestage: 'lead',
                    },
                }],
            }),
        })
        if (!upsertRes.ok) {
            const body = await upsertRes.text().catch(() => '')
            return { ok: false, error: `contact upsert ${upsertRes.status}: ${body.slice(0, 200)}` }
        }
        const upsertJson = await upsertRes.json()
        const contactId: string | undefined = upsertJson?.results?.[0]?.id
        if (!contactId) return { ok: false, error: 'HubSpot não devolveu contactId' }

        // 2) Note com o contexto, associada ao Contact (typeId 202 = note→contact).
        const linhas = [
            'Lead Eligivo — /encontrar-fundos',
            `NIF: ${lead.nif}`,
            lead.setor ? `Setor: ${lead.setor}` : '',
            lead.dimensao ? `Dimensão: ${lead.dimensao}` : '',
            lead.regiao ? `Região: ${lead.regiao}` : '',
            lead.cae ? `CAE: ${lead.cae}` : '',
            lead.aviso ? `Aviso de interesse: ${lead.aviso.nome} (${lead.aviso.portal})` : '',
            lead.mensagem ? `Mensagem: ${lead.mensagem}` : '',
        ].filter(Boolean).join('\n')

        await fetch(`${BASE}/crm/v3/objects/notes`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                properties: { hs_note_body: linhas, hs_timestamp: new Date().toISOString() },
                associations: [{
                    to: { id: contactId },
                    types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 202 }],
                }],
            }),
        }).catch(() => { /* a note é bónus — não deita a lead abaixo */ })

        return { ok: true, contactId }
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : String(e) }
    }
}
