import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key_for_build');

// Remetente dos emails. Requer o domínio VERIFICADO no Resend (Domains → Add
// Domain → aitipro.com → adicionar registos DNS → Verify). Configurável por env
// EMAIL_FROM sem tocar no código.
export const EMAIL_FROM = process.env.EMAIL_FROM || 'Eligivo <noreply@aitipro.com>';
