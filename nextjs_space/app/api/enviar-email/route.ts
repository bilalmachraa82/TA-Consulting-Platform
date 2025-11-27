import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { destinatario, assunto, conteudo, tipo = 'aviso' } = await request.json();

    if (!destinatario || !assunto || !conteudo) {
      return NextResponse.json(
        { error: 'Destinatário, assunto e conteúdo são obrigatórios' },
        { status: 400 }
      );
    }

    // Template HTML para o email
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 30px auto;
      background: white;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content {
      padding: 30px;
    }
    .content h2 {
      color: #667eea;
      font-size: 20px;
      margin-top: 0;
    }
    .content p {
      margin: 15px 0;
      color: #555;
    }
    .badge {
      display: inline-block;
      padding: 6px 12px;
      background: #f0f4ff;
      color: #667eea;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 600;
      margin: 5px 0;
    }
    .footer {
      background: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #888;
      border-top: 1px solid #e0e0e0;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      border-radius: 6px;
      margin: 15px 0;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎯 TA Consulting Platform</h1>
      <p style="margin: 5px 0 0 0; opacity: 0.9;">Consultoria em Fundos Europeus</p>
    </div>
    <div class="content">
      ${conteudo}
    </div>
    <div class="footer">
      <p><strong>TA Consulting</strong></p>
      <p>Esta é uma notificação automática da plataforma TA Consulting.</p>
      <p>© ${new Date().getFullYear()} TA Consulting. Todos os direitos reservados.</p>
    </div>
  </div>
</body>
</html>
    `;

    // Enviar email usando Resend
    const data = await resend.emails.send({
      from: 'TA Consulting Platform <noreply@ta-consulting-platfo-tfdltj.abacusai.app>',
      to: [destinatario],
      subject: assunto,
      html: htmlContent,
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Erro ao enviar email:', error);
    return NextResponse.json(
      { error: 'Erro ao enviar email', details: error.message },
      { status: 500 }
    );
  }
}
