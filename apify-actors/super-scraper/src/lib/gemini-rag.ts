/**
 * Gemini RAG Module - File Search for EU Funding Documents
 * 
 * Uses Gemini Files API to upload PDFs and query with RAG
 * 
 * @see https://ai.google.dev/gemini-api/docs/document-processing
 */

import { GoogleGenerativeAI, FileDataPart } from '@google/generative-ai';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

// Types
export interface UploadedFile {
    name: string;
    displayName: string;
    uri: string;
    mimeType: string;
    sizeBytes: number;
    state: 'PROCESSING' | 'ACTIVE' | 'FAILED';
}

export interface RAGQueryResult {
    answer: string;
    sources: string[];
    confidence: number;
}

// Initialize client
const getApiKey = () => process.env.GEMINI_API_KEY || '';
const BASE_URL = 'https://generativelanguage.googleapis.com';

/**
 * Upload a PDF file to Gemini Files API
 */
export async function uploadPdfToGemini(
    filePath: string,
    displayName?: string
): Promise<UploadedFile> {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

    const fileName = displayName || path.basename(filePath);
    const fileBuffer = fs.readFileSync(filePath);
    const numBytes = fileBuffer.length;
    const mimeType = 'application/pdf';

    console.log(`    📤 Uploading ${fileName} (${(numBytes / 1024).toFixed(1)} KB)...`);

    // Step 1: Start resumable upload
    const startResponse = await axios.post(
        `${BASE_URL}/upload/v1beta/files?key=${apiKey}`,
        { file: { display_name: fileName } },
        {
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Upload-Protocol': 'resumable',
                'X-Goog-Upload-Command': 'start',
                'X-Goog-Upload-Header-Content-Length': numBytes.toString(),
                'X-Goog-Upload-Header-Content-Type': mimeType,
            },
        }
    );

    const uploadUrl = startResponse.headers['x-goog-upload-url'];
    if (!uploadUrl) throw new Error('Failed to get upload URL');

    // Step 2: Upload file content
    const uploadResponse = await axios.post(uploadUrl, fileBuffer, {
        headers: {
            'Content-Length': numBytes.toString(),
            'X-Goog-Upload-Offset': '0',
            'X-Goog-Upload-Command': 'upload, finalize',
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
    });

    const file = uploadResponse.data.file;
    console.log(`    ✅ Uploaded: ${file.uri}`);

    return {
        name: file.name,
        displayName: file.displayName,
        uri: file.uri,
        mimeType: file.mimeType,
        sizeBytes: parseInt(file.sizeBytes || '0', 10),
        state: file.state,
    };
}

/**
 * Upload PDF from URL (downloads first, then uploads)
 */
export async function uploadPdfFromUrl(
    pdfUrl: string,
    displayName: string
): Promise<UploadedFile> {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

    console.log(`    📥 Downloading ${displayName}...`);

    // Download PDF
    const response = await axios.get(pdfUrl, {
        responseType: 'arraybuffer',
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 60000,
    });

    const fileBuffer = Buffer.from(response.data);
    const numBytes = fileBuffer.length;
    const mimeType = 'application/pdf';

    console.log(`    📤 Uploading ${displayName} (${(numBytes / 1024).toFixed(1)} KB)...`);

    // Start resumable upload
    const startResponse = await axios.post(
        `${BASE_URL}/upload/v1beta/files?key=${apiKey}`,
        { file: { display_name: displayName } },
        {
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Upload-Protocol': 'resumable',
                'X-Goog-Upload-Command': 'start',
                'X-Goog-Upload-Header-Content-Length': numBytes.toString(),
                'X-Goog-Upload-Header-Content-Type': mimeType,
            },
        }
    );

    const uploadUrl = startResponse.headers['x-goog-upload-url'];
    if (!uploadUrl) throw new Error('Failed to get upload URL');

    // Upload file content
    const uploadResponse = await axios.post(uploadUrl, fileBuffer, {
        headers: {
            'Content-Length': numBytes.toString(),
            'X-Goog-Upload-Offset': '0',
            'X-Goog-Upload-Command': 'upload, finalize',
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
    });

    const file = uploadResponse.data.file;
    console.log(`    ✅ Uploaded: ${file.name}`);

    return {
        name: file.name,
        displayName: file.displayName,
        uri: file.uri,
        mimeType: file.mimeType,
        sizeBytes: parseInt(file.sizeBytes || '0', 10),
        state: file.state,
    };
}

/**
 * List all uploaded files
 */
export async function listUploadedFiles(): Promise<UploadedFile[]> {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

    const response = await axios.get(`${BASE_URL}/v1beta/files?key=${apiKey}`);
    return (response.data.files || []).map((f: any) => ({
        name: f.name,
        displayName: f.displayName,
        uri: f.uri,
        mimeType: f.mimeType,
        sizeBytes: parseInt(f.sizeBytes || '0', 10),
        state: f.state,
    }));
}

/**
 * Query documents using RAG
 */
export async function queryDocuments(
    question: string,
    fileUris: string[],
    options: {
        model?: string;
        systemPrompt?: string;
    } = {}
): Promise<RAGQueryResult> {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

    const {
        model = 'gemini-2.0-flash-lite',
        systemPrompt = `És um assistente especializado em fundos europeus portugueses (Portugal 2030, PRR, PEPAC).
Analisa os documentos fornecidos e responde com precisão.
Se não encontrares informação, diz claramente.
Cita sempre a fonte (nome do documento).`
    } = options;

    const genAI = new GoogleGenerativeAI(apiKey);
    const gemini = genAI.getGenerativeModel({ model });

    // Build file parts
    const fileParts: FileDataPart[] = fileUris.map(uri => ({
        fileData: {
            fileUri: uri,
            mimeType: 'application/pdf',
        },
    }));

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
        confidence: 0.8, // Placeholder
    };
}

/**
 * Batch upload multiple PDFs from avisos
 */
export async function batchUploadFromAvisos(
    avisos: Array<{ codigo: string; documentos?: Array<{ url: string; nome: string }> }>,
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
    const pdfItems: Array<{ url: string; name: string }> = [];
    for (const aviso of avisos) {
        for (const doc of aviso.documentos || []) {
            if (doc.url?.includes('.pdf')) {
                pdfItems.push({
                    url: doc.url,
                    name: `${aviso.codigo}_${doc.nome}`.slice(0, 100),
                });
            }
            if (pdfItems.length >= maxDocs) break;
        }
        if (pdfItems.length >= maxDocs) break;
    }

    console.log(`📦 Batch upload: ${pdfItems.length} PDFs`);

    for (let i = 0; i < pdfItems.length; i++) {
        try {
            const file = await uploadPdfFromUrl(pdfItems[i].url, pdfItems[i].name);
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
