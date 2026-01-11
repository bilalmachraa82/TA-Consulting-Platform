import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key_for_build');

export const EMAIL_FROM = 'TA Consulting <noreply@ta-consulting-platfo-tfdltj.abacusai.app>';
