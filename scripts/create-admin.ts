/**
 * create-admin.ts
 *
 * Creates or updates an admin user in the database.
 * Reads credentials from environment variables — no hardcoded values.
 *
 * Usage:
 *   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=secret yarn tsx scripts/create-admin.ts
 *
 * Or set ADMIN_EMAIL and ADMIN_PASSWORD in your .env file and run:
 *   yarn tsx scripts/create-admin.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email) {
        console.error('Error: ADMIN_EMAIL environment variable is required.');
        process.exit(1);
    }

    if (!password) {
        console.error('Error: ADMIN_PASSWORD environment variable is required.');
        process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            role: 'admin',
        },
        create: {
            email,
            password: hashedPassword,
            name: 'Admin',
            role: 'admin',
        },
    });

    console.log(`Admin user ready: ${user.email} (id: ${user.id})`);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (error) => {
        console.error('Error creating admin user:', error);
        await prisma.$disconnect();
        process.exit(1);
    });
