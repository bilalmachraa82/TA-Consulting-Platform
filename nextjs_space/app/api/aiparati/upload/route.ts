/**
 * API Route: /api/aiparati/upload
 *
 * Upload de ficheiros IES (PDF/XML) para processamento
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAiparatiClient } from '@/lib/aiparati-client';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Ficheiro obrigatório' },
        { status: 400 }
      );
    }

    // Validar tipo de ficheiro
    const validTypes = ['application/pdf', 'application/xml', 'text/xml'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|xml)$/i)) {
      return NextResponse.json(
        { success: false, error: 'Tipo de ficheiro inválido. Aceites: PDF, XML' },
        { status: 400 }
      );
    }

    // Converter para buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Enviar para aiparati
    const client = getAiparatiClient();
    const iesData = await client.uploadIES(buffer, file.name);

    // Se não conseguiu extrair dados (serviço offline), retornar template
    if (!iesData.nipc) {
      return NextResponse.json({
        success: true,
        message: 'Ficheiro recebido. Preencha os dados manualmente.',
        iesData: null,
        requiresManualInput: true,
        template: {
          nipc: '',
          nomeEmpresa: '',
          cae: '',
          anoExercicio: new Date().getFullYear() - 1,
          ativoTotal: 0,
          ativoCorrente: 0,
          ativoNaoCorrente: 0,
          passivoTotal: 0,
          passivoCorrente: 0,
          passivoNaoCorrente: 0,
          capitalProprio: 0,
          volumeNegocios: 0,
          resultadoOperacional: 0,
          resultadoLiquido: 0,
          gastosComPessoal: 0,
          custoMercadoriasVendidas: 0,
          fse: 0,
          numeroTrabalhadores: 0,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'IES processada com sucesso',
      iesData,
      requiresManualInput: false,
    });
  } catch (error: any) {
    console.error('[aiparati/upload] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Configurar limite de tamanho
export const config = {
  api: {
    bodyParser: false,
  },
};
