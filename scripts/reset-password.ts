/**
 * Reposição de palavra-passe pela linha de comandos (via de emergência).
 *
 * Existe porque o envio de email depende de um domínio verificado no Resend —
 * se isso falhar, ninguém deve ficar trancado fora da plataforma.
 *
 * Uso:
 *   yarn tsx scripts/reset-password.ts <email>              # gera link de reset
 *   yarn tsx scripts/reset-password.ts <email> --definir    # define password nova
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { randomBytes } from 'crypto';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import {
    generateResetToken,
    identifierForEmail,
    normalizeEmail,
    buildResetUrl,
} from '../lib/auth/password-reset';

const prisma = new PrismaClient();

async function main(): Promise<void> {
    const email = normalizeEmail(process.argv[2] || '');
    const definir = process.argv.includes('--definir');

    if (!email) {
        console.error('Uso: yarn tsx scripts/reset-password.ts <email> [--definir]');
        process.exit(1);
    }

    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true, role: true } });
    if (!user) {
        console.error(`❌ Não existe conta com o email ${email}`);
        const todos = await prisma.user.findMany({ select: { email: true }, take: 20 });
        console.error('Contas existentes:', todos.map((u) => u.email).join(', '));
        process.exit(1);
    }

    if (definir) {
        // Password legível mas forte: 4 blocos aleatórios
        const nova = `${randomBytes(9).toString('base64url')}${Math.floor(Math.random() * 90 + 10)}`;
        const hash = await bcrypt.hash(nova, 12);
        await prisma.user.update({ where: { id: user.id }, data: { password: hash } });
        console.log('═'.repeat(52));
        console.log(`  conta:    ${email} (${user.role})`);
        console.log(`  password: ${nova}`);
        console.log('═'.repeat(52));
        console.log('Muda-a depois de entrares.');
    } else {
        const identifier = identifierForEmail(email);
        const { plain, hash, expires } = generateResetToken();
        await prisma.verificationToken.deleteMany({ where: { identifier } });
        await prisma.verificationToken.create({ data: { identifier, token: hash, expires } });

        const base = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        console.log('═'.repeat(52));
        console.log(`  conta: ${email} (${user.role})`);
        console.log(`  link (válido 1h, uso único):`);
        console.log(`  ${buildResetUrl(base, plain)}`);
        console.log('═'.repeat(52));
    }

    await prisma.$disconnect();
}

main().catch((e) => {
    console.error('Fatal:', e);
    process.exit(1);
});
