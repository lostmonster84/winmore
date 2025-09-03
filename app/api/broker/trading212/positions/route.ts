// Trading 212 Positions API Route
// GET /api/broker/trading212/positions
// Returns all open positions

import { NextRequest, NextResponse } from 'next/server';
import { protectApiRoute } from '@/lib/auth';
import { getTrading212Adapter } from '@/lib/trading212-adapter';

export async function GET(request: NextRequest) {
  // Protect the API route
  const authError = await protectApiRoute(request);
  if (authError) return authError;

  try {
    const trading212 = getTrading212Adapter();
    const positionsResult = await trading212.getPositions();

    if (!positionsResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: positionsResult.error,
          rateLimited: positionsResult.rateLimited
        },
        { status: positionsResult.rateLimited ? 429 : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: positionsResult.data
    });

  } catch (error) {
    console.error('Trading 212 positions API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch positions data' 
      },
      { status: 500 }
    );
  }
}