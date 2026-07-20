import { describe, it, expect } from 'vitest';
import {
    generateResetToken,
    hashToken,
    tokenMatches,
    isExpired,
    validatePassword,
    buildResetUrl,
    identifierForEmail,
    normalizeEmail,
    RESET_TOKEN_TTL_MS,
} from '@/lib/auth/password-reset';

describe('geração e verificação de token', () => {
    it('gera token aleatório com hash e validade de 1 hora', () => {
        const agora = new Date('2026-07-21T10:00:00Z');
        const t = generateResetToken(agora);
        expect(t.plain).toHaveLength(64);
        expect(t.hash).toHaveLength(64);
        expect(t.hash).not.toBe(t.plain);
        expect(t.expires.getTime() - agora.getTime()).toBe(RESET_TOKEN_TTL_MS);
    });

    it('gera tokens diferentes a cada chamada', () => {
        expect(generateResetToken().plain).not.toBe(generateResetToken().plain);
    });

    it('o token guardado é o hash — quem lê a BD não consegue forjar um reset', () => {
        const t = generateResetToken();
        expect(t.hash).toBe(hashToken(t.plain));
        expect(tokenMatches(t.plain, t.hash)).toBe(true);
    });

    it('rejeita token errado, hash mal formado e comprimentos diferentes', () => {
        const t = generateResetToken();
        expect(tokenMatches('a'.repeat(64), t.hash)).toBe(false);
        expect(tokenMatches(t.plain, 'nao-e-hex')).toBe(false);
        expect(tokenMatches(t.plain, 'abcd')).toBe(false);
    });
});

describe('expiração', () => {
    it('expira exatamente ao fim do TTL', () => {
        const agora = new Date('2026-07-21T10:00:00Z');
        const t = generateResetToken(agora);
        expect(isExpired(t.expires, new Date('2026-07-21T10:59:00Z'))).toBe(false);
        expect(isExpired(t.expires, new Date('2026-07-21T11:00:00Z'))).toBe(true);
        expect(isExpired(t.expires, new Date('2026-07-21T11:01:00Z'))).toBe(true);
    });
});

describe('força da palavra-passe', () => {
    it('aceita 10+ caracteres com letras e números', () => {
        expect(validatePassword('abcdef1234').ok).toBe(true);
        expect(validatePassword('UmaFrasePasse2026').ok).toBe(true);
    });

    it('rejeita curtas, só letras, só números e absurdamente longas', () => {
        expect(validatePassword('curta1').ok).toBe(false);
        expect(validatePassword('apenasletras').ok).toBe(false);
        expect(validatePassword('1234567890').ok).toBe(false);
        expect(validatePassword('a1'.repeat(150)).ok).toBe(false);
    });
});

describe('identificadores e URLs', () => {
    it('normaliza o email (maiúsculas e espaços não criam contas paralelas)', () => {
        expect(normalizeEmail('  Bilal.Machraa@Gmail.com ')).toBe('bilal.machraa@gmail.com');
        expect(identifierForEmail('BILAL@X.PT')).toBe('pwreset:bilal@x.pt');
    });

    it('constrói o URL sem barras duplicadas e com o token escapado', () => {
        expect(buildResetUrl('https://x.pt/', 'abc123')).toBe('https://x.pt/auth/reset-password?token=abc123');
        expect(buildResetUrl('https://x.pt', 'a b')).toContain('token=a%20b');
    });
});
