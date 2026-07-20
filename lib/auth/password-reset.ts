/**
 * Lógica pura da recuperação de palavra-passe (testável sem BD nem rede).
 *
 * Decisões de segurança:
 * - O token vai em claro no email mas é guardado como SHA-256 na BD: quem ler
 *   a base não consegue forjar um reset.
 * - Validade curta (1h) e uso único (apagado ao ser consumido).
 * - Comparação em tempo constante para não expor tokens por timing.
 * - As rotas devolvem sempre a mesma resposta, exista ou não a conta
 *   (evita descobrir que emails estão registados).
 */

import { createHash, randomBytes, timingSafeEqual } from 'crypto';

/** Validade do link enviado por email. */
export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

/** Prefixo no identifier do VerificationToken para distinguir de outros usos. */
export const RESET_IDENTIFIER_PREFIX = 'pwreset:';

export function identifierForEmail(email: string): string {
    return `${RESET_IDENTIFIER_PREFIX}${normalizeEmail(email)}`;
}

export function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

export interface GeneratedToken {
    /** vai no link enviado ao utilizador */
    plain: string;
    /** o que fica na base de dados */
    hash: string;
    expires: Date;
}

export function generateResetToken(now: Date = new Date()): GeneratedToken {
    const plain = randomBytes(32).toString('hex');
    return {
        plain,
        hash: hashToken(plain),
        expires: new Date(now.getTime() + RESET_TOKEN_TTL_MS),
    };
}

export function hashToken(plain: string): string {
    return createHash('sha256').update(plain).digest('hex');
}

/** Comparação em tempo constante entre o token recebido e o guardado. */
export function tokenMatches(plain: string, storedHash: string): boolean {
    const candidate = Buffer.from(hashToken(plain), 'hex');
    let stored: Buffer;
    try {
        stored = Buffer.from(storedHash, 'hex');
    } catch {
        return false;
    }
    if (candidate.length !== stored.length) return false;
    return timingSafeEqual(candidate, stored);
}

export function isExpired(expires: Date, now: Date = new Date()): boolean {
    return expires.getTime() <= now.getTime();
}

export interface PasswordCheck {
    ok: boolean;
    erro?: string;
}

/**
 * Requisitos mínimos: 10 caracteres com letras e números. Deliberadamente
 * simples — comprimento protege mais do que regras de símbolos que levam as
 * pessoas a escolher "Password1!".
 */
export function validatePassword(password: string): PasswordCheck {
    if (password.length < 10) {
        return { ok: false, erro: 'A palavra-passe tem de ter pelo menos 10 caracteres.' };
    }
    if (password.length > 200) {
        return { ok: false, erro: 'A palavra-passe é demasiado longa.' };
    }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
        return { ok: false, erro: 'A palavra-passe tem de incluir letras e números.' };
    }
    return { ok: true };
}

export function buildResetUrl(baseUrl: string, token: string): string {
    const base = baseUrl.replace(/\/+$/, '');
    return `${base}/auth/reset-password?token=${encodeURIComponent(token)}`;
}

export function resetEmailHtml(resetUrl: string, nome?: string | null): string {
    const saudacao = nome ? `Olá ${nome},` : 'Olá,';
    return `
<div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 480px; margin: 0 auto; color: #0f172a;">
  <h2 style="color:#1e3a8a; margin-bottom: 8px;">Recuperar palavra-passe</h2>
  <p>${saudacao}</p>
  <p>Recebemos um pedido para repor a palavra-passe da tua conta na plataforma TA Consulting.</p>
  <p style="margin: 24px 0;">
    <a href="${resetUrl}" style="background:#2563eb; color:#fff; padding:12px 20px; border-radius:8px; text-decoration:none; display:inline-block; font-weight:600;">
      Definir nova palavra-passe
    </a>
  </p>
  <p style="color:#475569; font-size: 14px;">O link é válido durante 1 hora e só pode ser usado uma vez.</p>
  <p style="color:#475569; font-size: 14px;">Se não foste tu que pediste, ignora este email — a tua palavra-passe atual continua válida.</p>
  <hr style="border:none; border-top:1px solid #e2e8f0; margin: 24px 0;" />
  <p style="color:#94a3b8; font-size: 12px;">Se o botão não funcionar, copia este endereço para o navegador:<br />${resetUrl}</p>
</div>`.trim();
}
