// OUTPOST Trading System - VIX Data API Route
import { NextRequest, NextResponse } from 'next/server';
import { protectApiRoute } from '@/lib/auth';
import MarketDataService from '@/lib/market-data';

export async function GET(request: NextRequest) {
  // Simple session check for now
  const sessionToken = request.cookies.get('winmore-session')?.value;
  if (!sessionToken) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const vixData = await MarketDataService.fetchVIXData();

    if (!vixData) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch VIX data' },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      data: vixData,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('VIX API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}