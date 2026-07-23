/**
 * Tokens stateless dos alertas (fase B): HMAC-SHA256 sobre payload base64url.
 * Sem estado na BD — o segredo (NEXTAUTH_SECRET) valida autenticidade.
 * confirm: expira em 48h; unsub: sem expiração (tem de funcionar para sempre).
 */
import { createHmac, timingSafeEqual } from 'crypto';

export type TokenPurpose = 'confirm' | 'unsub';

interface TokenPayload {
    e: string;           // email
    p: TokenPurpose;
    x?: number;          // exp epoch seconds (só confirm)
}

function secret(): string {
    const s = process.env.ALERTAS_TOKEN_SECRET || process.env.NEXTAUTH_SECRET;
    if (!s) throw new Error('NEXTAUTH_SECRET/ALERTAS_TOKEN_SECRET em falta');
    return s;
}

const b64url = (buf: Buffer) => buf.toString('base64url');
const assinar = (data: string) => createHmac('sha256', secret()).update(data).digest('base64url');

export function gerarToken(email: string, purpose: TokenPurpose): string {
    const payload: TokenPayload = { e: email.toLowerCase().trim(), p: purpose };
    if (purpose === 'confirm') payload.x = Math.floor(Date.now() / 1000) + 48 * 3600;
    const body = b64url(Buffer.from(JSON.stringify(payload)));
    return `${body}.${assinar(body)}`;
}

export type VerificacaoToken =
    | { ok: true; email: string; purpose: TokenPurpose }
    | { ok: false; motivo: 'invalido' | 'expirado' };

export function verificarToken(token: string, expectedPurpose: TokenPurpose): VerificacaoToken {
    const partes = token.split('.');
    if (partes.length !== 2) return { ok: false, motivo: 'invalido' };
    const [body, sig] = partes;
    const esperado = assinar(body);
    const a = Buffer.from(sig);
    const b = Buffer.from(esperado);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return { ok: false, motivo: 'invalido' };
    try {
        const payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as TokenPayload;
        if (payload.p !== expectedPurpose || !payload.e) return { ok: false, motivo: 'invalido' };
        if (payload.x && payload.x < Math.floor(Date.now() / 1000)) return { ok: false, motivo: 'expirado' };
        return { ok: true, email: payload.e, purpose: payload.p };
    } catch {
        return { ok: false, motivo: 'invalido' };
    }
}
