/**
 * Testes dos tokens stateless de alertas (fase B): roundtrip, adulteração,
 * propósito trocado, expiração, formato inválido.
 */
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { gerarToken, verificarToken } from '@/lib/alert-tokens';

beforeAll(() => {
    process.env.ALERTAS_TOKEN_SECRET = 'segredo-de-teste-unitario';
});

describe('alert-tokens', () => {
    it('roundtrip confirm: gera e verifica', () => {
        const t = gerarToken('Pessoa@Empresa.PT', 'confirm');
        const v = verificarToken(t, 'confirm');
        expect(v).toEqual({ ok: true, email: 'pessoa@empresa.pt', purpose: 'confirm' });
    });

    it('roundtrip unsub: sem expiração', () => {
        const t = gerarToken('a@b.pt', 'unsub');
        expect(verificarToken(t, 'unsub').ok).toBe(true);
    });

    it('token adulterado → invalido', () => {
        const t = gerarToken('a@b.pt', 'confirm');
        const [body, sig] = t.split('.');
        const outro = Buffer.from(JSON.stringify({ e: 'atacante@mal.pt', p: 'confirm' })).toString('base64url');
        expect(verificarToken(`${outro}.${sig}`, 'confirm')).toEqual({ ok: false, motivo: 'invalido' });
    });

    it('propósito trocado (unsub token no confirmar) → invalido', () => {
        const t = gerarToken('a@b.pt', 'unsub');
        expect(verificarToken(t, 'confirm')).toEqual({ ok: false, motivo: 'invalido' });
    });

    it('confirm expirado → expirado', () => {
        vi.useFakeTimers();
        const t = gerarToken('a@b.pt', 'confirm');
        vi.advanceTimersByTime(49 * 3600 * 1000); // 49h > 48h
        expect(verificarToken(t, 'confirm')).toEqual({ ok: false, motivo: 'expirado' });
        vi.useRealTimers();
    });

    it('formatos inválidos → invalido', () => {
        expect(verificarToken('', 'confirm')).toEqual({ ok: false, motivo: 'invalido' });
        expect(verificarToken('a.b.c', 'confirm')).toEqual({ ok: false, motivo: 'invalido' });
        expect(verificarToken('sem-ponto', 'unsub')).toEqual({ ok: false, motivo: 'invalido' });
    });
});
