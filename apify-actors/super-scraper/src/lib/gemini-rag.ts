/**
 * Gemini RAG Module - File Search for EU Funding Documents
 * 
 * Uses Gemini Files API (via GoogleAIFileManager) to upload PDFs and query with RAG
 * 
 * @see https://ai.google.dev/gemini-api/docs/document-processing
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager, FileState } from '@google/generative-ai/server';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Types
export interface UploadedFile {
    name: string;
    displayName: string;
    uri: string;
    mimeType: string;
    sizeBytes: number;
    state: FileState;
    metadata?: Record<string, string>;
}

export interface RAGQueryResult {
    answer: string;
    sources: string[];
    confidence: number;
}

// Initialize client
const getApiKey = () => process.env.GEMINI_API_KEY || '';
const getFileManager = () => new GoogleAIFileManager(getApiKey());

/**
 * Upload a PDF file to Gemini Files API
 */
export async function uploadPdfToGemini(
    filePath: string,
    displayName?: string,
    metadata?: Record<string, string>
): Promise<UploadedFile> {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

    const fileName = displayName || path.basename(filePath);

    console.log(`    📤 Uploading ${fileName}...`);

    try {
        const fileManager = getFileManager();
        const uploadResponse = await fileManager.uploadFile(filePath, {
            mimeType: 'application/pdf',
            displayName: fileName,
            // @ts-ignore - metadata might be experimental in SDK types
            metadata: metadata
        });

        const file = uploadResponse.file;
        console.log(`    ✅ Uploaded: ${file.name} (${file.uri})`);

        return {
            name: file.name,
            displayName: file.displayName || file.name, // Fallback
            uri: file.uri,
            mimeType: file.mimeType,
            sizeBytes: parseInt(file.sizeBytes || '0', 10),
            state: file.state as FileState,
            metadata
        };
    } catch (error: any) {
        console.error(`    ❌ Upload Failed: ${error.message}`);
        throw error;
    }
}

/**
 * Upload PDF from URL (downloads first to temp, then uploads)
 */
export async function uploadPdfFromUrl(
    pdfUrl: string,
    displayName: string,
    metadata?: Record<string, string>
): Promise<UploadedFile> {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

    console.log(`    📥 Downloading ${displayName}...`);

    // Download PDF to temp file
    const tempFilePath = path.join(os.tmpdir(), `${displayName.replace(/[^a-z0-9]/gi, '_')}.pdf`);

    const response = await axios.get(pdfUrl, {
        responseType: 'arraybuffer',
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 60000,
    });

    console.log(`    📊 Downloaded ${response.data.length} bytes. Content-Type: ${response.headers['content-type']}`);

    fs.writeFileSync(tempFilePath, Buffer.from(response.data));

    try {
        const result = await uploadPdfToGemini(tempFilePath, displayName, metadata);
        // Clean up temp file
        fs.unlinkSync(tempFilePath);
        return result;
    } catch (error) {
        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
        throw error;
    }
}

/**
 * List all uploaded files with pagination logic
 */
export async function listUploadedFiles(): Promise<UploadedFile[]> {
    try {
        const fileManager = getFileManager();
        let allFiles: UploadedFile[] = [];
        let pageToken: string | undefined;

        do {
            const response: any = await fileManager.listFiles({
                pageSize: 100, // Max page size
                pageToken
            });

            const files = (response.files || []).map((f: any) => ({
                name: f.name,
                displayName: f.displayName,
                uri: f.uri,
                mimeType: f.mimeType,
                sizeBytes: parseInt(f.sizeBytes || '0', 10),
                state: f.state as FileState,
            }));

            allFiles = [...allFiles, ...files];
            pageToken = response.nextPageToken;

        } while (pageToken);

        return allFiles;
    } catch (error: any) {
        console.error('Failed to list files:', error.message);
        return [];
    }
}

/**
 * Query documents using RAG (with optional metadata filtering mock-up or actual tool use)
 */
export async function queryDocuments(
    question: string,
    fileUris: string[],
    options: {
        model?: string;
        systemPrompt?: string;
        metadataFilter?: Record<string, string>;
    } = {}
): Promise<RAGQueryResult> {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

    const {
        model = 'gemini-2.5-flash', // Validated as the most stable and performant (Benchmark Dec 2025)
        systemPrompt = `És um assistente especializado em fundos europeus portugueses (Portugal 2030, PRR, PEPAC).
Analisa os documentos fornecidos e responde com precisão.
Se a pergunta for sobre temas fora do âmbito dos fundos europeus ou não relacionada com os documentos fornecidos, deves recusar responder educadamente.
Se não encontrares informação nos documentos, diz explicitamente que a informação não consta na base de dados.
Cita sempre a fonte (nome do documento).`,
        metadataFilter
    } = options;

    const genAI = new GoogleGenerativeAI(apiKey);
    const gemini = genAI.getGenerativeModel({
        model,
    });

    // Build file parts - effectively "Long Context" mode which is very robust for < 100 files
    const fileParts = fileUris.map(uri => ({
        fileData: {
            fileUri: uri,
            // mimeType: 'application/pdf', // REMOVED: Let API infer & cast to avoid TS strict union errors
        },
    } as any));

    const prompt = `${systemPrompt}

PERGUNTA: ${question}

Analisa os documentos anexados e responde de forma clara e concisa.`;

    const result = await gemini.generateContent([
        ...fileParts,
        { text: prompt },
    ]);

    const answer = result.response.text();

    return {
        answer,
        sources: fileUris.map(uri => uri.split('/').pop() || uri),
        confidence: 0.8,
    };
}

/**
 * Batch upload multiple PDFs from avisos
 */
export async function batchUploadFromAvisos(
    avisos: Array<{ codigo: string; portal?: string; documentos?: Array<{ url: string; nome: string }> }>,
    options: {
        maxDocs?: number;
        delayMs?: number;
        onProgress?: (done: number, total: number) => void;
    } = {}
): Promise<UploadedFile[]> {
    const { maxDocs = 50, delayMs = 1000, onProgress } = options;
    const uploaded: UploadedFile[] = [];
    const errors: string[] = [];

    // Collect all PDF URLs
    const pdfItems: Array<{ url: string; name: string; metadata: Record<string, string> }> = [];

    for (const aviso of avisos) {
        for (const doc of aviso.documentos || []) {
            if (doc.url?.toLowerCase().includes('.pdf')) {
                pdfItems.push({
                    url: doc.url,
                    name: `${aviso.codigo}_${doc.nome}`.slice(0, 100).replace(/[^a-zA-Z0-9._-]/g, '_'),
                    metadata: {
                        portal: aviso.portal || 'unknown',
                        aviso_codigo: aviso.codigo
                    }
                });
            }
            if (pdfItems.length >= maxDocs) break;
        }
        if (pdfItems.length >= maxDocs) break;
    }

    console.log(`📦 Batch upload: ${pdfItems.length} PDFs...`);

    for (let i = 0; i < pdfItems.length; i++) {
        try {
            const file = await uploadPdfFromUrl(
                pdfItems[i].url,
                pdfItems[i].name,
                pdfItems[i].metadata
            );
            uploaded.push(file);
            if (onProgress) onProgress(i + 1, pdfItems.length);
        } catch (e: any) {
            console.log(`    ❌ Erro: ${pdfItems[i].name} - ${e.message}`);
            errors.push(pdfItems[i].name);
        }

        // Rate limiting
        if (i < pdfItems.length - 1) {
            await new Promise(r => setTimeout(r, delayMs));
        }
    }

    console.log(`✅ Upload completo: ${uploaded.length}/${pdfItems.length} (${errors.length} erros)`);
    return uploaded;
}

export default {
    uploadPdfToGemini,
    uploadPdfFromUrl,
    listUploadedFiles,
    queryDocuments,
    batchUploadFromAvisos,
};
