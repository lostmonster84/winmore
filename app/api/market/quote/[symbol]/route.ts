// OUTPOST Trading System - Stock Quote API Route
import { NextRequest, NextResponse } from 'next/server';
import { protectApiRoute } from '@/lib/auth';
import MarketDataService from '@/lib/market-data';

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  // Protect API route
  const authError = await protectApiRoute(request);
  if (authError) return authError;

  try {
    const symbol = params.symbol?.toUpperCase();
    
    if (!symbol) {
      return NextResponse.json(
        { success: false, error: 'Symbol required' },
        { status: 400 }
      );
    }

    const quote = await MarketDataService.getStockQuote(symbol);

    if (!quote) {
      return NextResponse.json(
        { success: false, error: `No data found for ${symbol}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: quote,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Quote API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}