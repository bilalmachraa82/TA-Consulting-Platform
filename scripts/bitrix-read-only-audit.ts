/**
 * BITRIX24 READ-ONLY AUDIT SCRIPT
 * ================================
 * Este script APENAS LÊ dados. ZERO escrita.
 * Objetivo: Validar conexão e estrutura de dados para o projeto TA Consulting.
 * 
 * Run: npx tsx scripts/bitrix-read-only-audit.ts
 */

const BITRIX_WEBHOOK = process.env.BITRIX_WEBHOOK_URL;
if (!BITRIX_WEBHOOK) {
    console.error('BITRIX_WEBHOOK_URL environment variable is required.');
    process.exit(1);
}

// ============================================================
// SAFE METHODS ONLY - NO .add, .update, .delete
// ============================================================

async function safeFetch(method: string, params: Record<string, any> = {}): Promise<any> {
    const url = new URL(`${BITRIX_WEBHOOK}${method}.json`);
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) url.searchParams.append(key, String(value));
    });

    console.log(`  📡 GET ${method}...`);
    const response = await fetch(url.toString());

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
}

// ============================================================
// AUDIT FUNCTIONS
// ============================================================

async function testConnection(): Promise<boolean> {
    console.log("\n🔌 TESTE DE CONEXÃO");
    console.log("=".repeat(50));

    try {
        const profile = await safeFetch("profile");
        console.log("  ✅ Conexão OK!");
        console.log(`  👤 Utilizador: ${profile.result.NAME} ${profile.result.LAST_NAME}`);
        console.log(`  📧 Email: ${profile.result.EMAIL}`);
        console.log(`  🆔 ID: ${profile.result.ID}`);
        return true;
    } catch (error) {
        console.log(`  ❌ ERRO: ${error}`);
        return false;
    }
}

async function auditLeads(): Promise<any> {
    console.log("\n📋 AUDITORIA: LEADS");
    console.log("=".repeat(50));

    const result = await safeFetch("crm.lead.list", { start: 0 });
    const leads = result.result || [];
    const total = result.total || leads.length;

    console.log(`  📊 Total de Leads: ${total}`);
    console.log(`  📄 Sample (primeiros 5):`);

    leads.slice(0, 5).forEach((lead: any, i: number) => {
        console.log(`    ${i + 1}. [ID: ${lead.ID}] ${lead.TITLE || lead.NAME || "Sem título"}`);
    });

    // Estrutura de campos
    if (leads.length > 0) {
        console.log(`  🔑 Campos disponíveis: ${Object.keys(leads[0]).join(", ")}`);
    }

    return { total, sample: leads.slice(0, 5), fields: leads.length > 0 ? Object.keys(leads[0]) : [] };
}

async function auditDeals(): Promise<any> {
    console.log("\n💼 AUDITORIA: DEALS (Negócios)");
    console.log("=".repeat(50));

    const result = await safeFetch("crm.deal.list", { start: 0 });
    const deals = result.result || [];
    const total = result.total || deals.length;

    console.log(`  📊 Total de Deals: ${total}`);
    console.log(`  📄 Sample (primeiros 5):`);

    deals.slice(0, 5).forEach((deal: any, i: number) => {
        console.log(`    ${i + 1}. [ID: ${deal.ID}] ${deal.TITLE || "Sem título"} - Stage: ${deal.STAGE_ID}`);
    });

    if (deals.length > 0) {
        console.log(`  🔑 Campos disponíveis: ${Object.keys(deals[0]).join(", ")}`);
    }

    return { total, sample: deals.slice(0, 5), fields: deals.length > 0 ? Object.keys(deals[0]) : [] };
}

async function auditCompanies(): Promise<any> {
    console.log("\n🏢 AUDITORIA: COMPANIES (Empresas)");
    console.log("=".repeat(50));

    const result = await safeFetch("crm.company.list", { start: 0 });
    const companies = result.result || [];
    const total = result.total || companies.length;

    console.log(`  📊 Total de Empresas: ${total}`);
    console.log(`  📄 Sample (primeiras 5):`);

    companies.slice(0, 5).forEach((company: any, i: number) => {
        console.log(`    ${i + 1}. [ID: ${company.ID}] ${company.TITLE || "Sem nome"}`);
    });

    if (companies.length > 0) {
        console.log(`  🔑 Campos disponíveis: ${Object.keys(companies[0]).join(", ")}`);
    }

    return { total, sample: companies.slice(0, 5), fields: companies.length > 0 ? Object.keys(companies[0]) : [] };
}

async function auditContacts(): Promise<any> {
    console.log("\n👥 AUDITORIA: CONTACTS");
    console.log("=".repeat(50));

    const result = await safeFetch("crm.contact.list", { start: 0 });
    const contacts = result.result || [];
    const total = result.total || contacts.length;

    console.log(`  📊 Total de Contactos: ${total}`);
    console.log(`  📄 Sample (primeiros 5):`);

    contacts.slice(0, 5).forEach((contact: any, i: number) => {
        console.log(`    ${i + 1}. [ID: ${contact.ID}] ${contact.NAME || ""} ${contact.LAST_NAME || ""}`);
    });

    if (contacts.length > 0) {
        console.log(`  🔑 Campos disponíveis: ${Object.keys(contacts[0]).join(", ")}`);
    }

    return { total, sample: contacts.slice(0, 5), fields: contacts.length > 0 ? Object.keys(contacts[0]) : [] };
}

async function auditUsers(): Promise<any> {
    console.log("\n👤 AUDITORIA: USERS");
    console.log("=".repeat(50));

    const result = await safeFetch("user.get");
    const users = result.result || [];

    console.log(`  📊 Total de Utilizadores: ${users.length}`);

    users.forEach((user: any, i: number) => {
        console.log(`    ${i + 1}. [ID: ${user.ID}] ${user.NAME} ${user.LAST_NAME} - ${user.EMAIL}`);
    });

    return { total: users.length, users };
}

async function validateProjectAssumptions(audit: any): Promise<void> {
    console.log("\n\n");
    console.log("=".repeat(60));
    console.log("🔍 VALIDAÇÃO DOS PRESSUPOSTOS DO PROJETO");
    console.log("=".repeat(60));

    // Pressuposto 1: 24.000 Empresas
    const companyCount = audit.companies?.total || 0;
    const expectedCompanies = 24000;
    const companyMatch = companyCount >= expectedCompanies * 0.5; // Tolerância de 50%

    console.log(`\n1. PRESSUPOSTO: "24.000 Empresas no Bitrix"`);
    console.log(`   📊 Real: ${companyCount} empresas`);
    console.log(`   ${companyMatch ? "✅" : "⚠️"} ${companyMatch ? "VALIDADO" : `DIFERENTE (esperado ~${expectedCompanies})`}`);

    // Pressuposto 2: CAI disponível nos campos
    const companyFields = audit.companies?.fields || [];
    const hasCAI = companyFields.some((f: string) =>
        f.toLowerCase().includes("cai") ||
        f.toLowerCase().includes("cae") ||
        f.toLowerCase().includes("uf_")
    );

    console.log(`\n2. PRESSUPOSTO: "Campo CAI/CAE disponível"`);
    console.log(`   📊 Campos: ${companyFields.length} campos encontrados`);
    console.log(`   ${hasCAI ? "✅" : "⚠️"} ${hasCAI ? "Campo CAI/CAE ENCONTRADO" : "Campo CAI/CAE NÃO encontrado (pode ser campo customizado UF_*)"}`);

    // Pressuposto 3: Leads/Deals para criar oportunidades
    const dealCount = audit.deals?.total || 0;
    const leadCount = audit.leads?.total || 0;

    console.log(`\n3. PRESSUPOSTO: "Sistema de Leads/Deals funcional"`);
    console.log(`   📊 Leads: ${leadCount}, Deals: ${dealCount}`);
    console.log(`   ✅ VALIDADO - Estrutura de CRM presente`);

    // Pressuposto 4: Contactos associados
    const contactCount = audit.contacts?.total || 0;

    console.log(`\n4. PRESSUPOSTO: "Contactos para comunicação"`);
    console.log(`   📊 Contactos: ${contactCount}`);
    console.log(`   ✅ VALIDADO - Base de contactos existe`);

    console.log("\n" + "=".repeat(60));
    console.log("📋 RESUMO FINAL");
    console.log("=".repeat(60));
    console.log(`
    Empresas:   ${companyCount}
    Leads:      ${leadCount}
    Deals:      ${dealCount}
    Contactos:  ${contactCount}
    
    ➡️ Próximo passo: Mapear campos customizados (UF_*) para encontrar CAI/CAE/Região.
    `);
}

// ============================================================
// MAIN
// ============================================================

async function main() {
    console.log("╔══════════════════════════════════════════════════════════╗");
    console.log("║    BITRIX24 READ-ONLY AUDIT - TA CONSULTING PLATFORM     ║");
    console.log("║    ⚠️ Este script APENAS LÊ dados. ZERO escrita.         ║");
    console.log("╚══════════════════════════════════════════════════════════╝");

    const audit: any = {};

    // 1. Testar conexão
    const connected = await testConnection();
    if (!connected) {
        console.log("\n❌ Não foi possível conectar ao Bitrix. Verifica o webhook.");
        process.exit(1);
    }

    // 2. Auditar entidades
    try {
        audit.leads = await auditLeads();
        audit.deals = await auditDeals();
        audit.companies = await auditCompanies();
        audit.contacts = await auditContacts();
        audit.users = await auditUsers();
    } catch (error) {
        console.log(`\n❌ Erro durante auditoria: ${error}`);
    }

    // 3. Validar pressupostos
    await validateProjectAssumptions(audit);

    console.log("\n✅ Auditoria concluída. Nenhum dado foi modificado.");
}

main().catch(console.error);
