/**
 * API Route: /api/bitrix/stats
 * Returns Bitrix24 statistics (read-only)
 */

import { NextResponse } from 'next/server';
import { testConnection, getStats } from '@/lib/bitrix/client';

export async function GET() {
    try {
        // Test connection first
        const connectionTest = await testConnection();

        if (!connectionTest.success) {
            return NextResponse.json(
                { error: 'Bitrix connection failed', details: connectionTest.error },
                { status: 503 }
            );
        }

        // Get stats
        const stats = await getStats();

        return NextResponse.json({
            success: true,
            user: connectionTest.user,
            stats,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Bitrix stats error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch Bitrix stats', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
