
import * as fs from 'fs';
import * as path from 'path';

const STORE_CONFIG_PATH = path.join(__dirname, '../apify-actors/super-scraper/rag-store.json');
const ENV_PATH = path.join(__dirname, '../.env');

async function updateEnv() {
    if (!fs.existsSync(STORE_CONFIG_PATH)) {
        console.error('❌ rag-store.json ainda não existe. A ingestão terminou?');
        process.exit(1);
    }

    const config = JSON.parse(fs.readFileSync(STORE_CONFIG_PATH, 'utf-8'));
    const storeName = config.storeName;

    if (!storeName) {
        console.error('❌ Store Name não encontrado no JSON.');
        process.exit(1);
    }

    console.log(`✅ Store ID encontrado: ${storeName}`);

    let envContent = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, 'utf-8') : '';

    // Check if key exists
    if (envContent.includes('GEMINI_RAG_STORE_ID=')) {
        // Replace
        envContent = envContent.replace(/GEMINI_RAG_STORE_ID=.*/g, `GEMINI_RAG_STORE_ID=${storeName}`);
    } else {
        // Append
        envContent += `\nGEMINI_RAG_STORE_ID=${storeName}\n`;
    }

    fs.writeFileSync(ENV_PATH, envContent);
    console.log('✅ .env atualizado com sucesso!');
}

updateEnv();
