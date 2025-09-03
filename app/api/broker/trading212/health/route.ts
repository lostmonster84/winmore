// Trading 212 Health Check API Route
// GET /api/broker/trading212/health
// Returns API connectivity status and latency

import { NextRequest, NextResponse } from 'next/server';
import { protectApiRoute } from '@/lib/auth';
import { getTrading212Adapter } from '@/lib/trading212-adapter';

export async function GET(request: NextRequest) {
  // Protect the API route
  const authError = await protectApiRoute(request);
  if (authError) return authError;

  try {
    const trading212 = getTrading212Adapter();
    const healthResult = await trading212.healthCheck();

    return NextResponse.json({
      success: true,
      data: {
        trading212: healthResult,
        apiKeyConfigured: !!process.env.TRADING212_API_KEY,
        cacheStats: trading212.getCacheStats(),
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Trading 212 health check error:', error);
    return NextResponse.json({
      success: true,
      data: {
        trading212: {
          healthy: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        apiKeyConfigured: !!process.env.TRADING212_API_KEY,
        timestamp: new Date().toISOString()
      }
    });
  }
}