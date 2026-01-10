import { NextResponse } from 'next/server';
import { checkNewAvisosCompatibility } from '@/lib/email/alert-service';

// Allow Vercel Cron to invoke this without authentication if needed,
// but usually we check for CRON_SECRET header.
// For MVP/Demo P1, we'll leave it open or check basic key.

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow 60 seconds

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('authorization');

        // Simple protection: Check if running on localhost or has secret
        // In prod, check process.env.CRON_SECRET === `Bearer ${authHeader}`

        const result = await checkNewAvisosCompatibility();

        return NextResponse.json({
            success: true,
            data: result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Cron job failed:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
