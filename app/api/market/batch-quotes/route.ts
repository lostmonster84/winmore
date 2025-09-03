// OUTPOST Trading System - Batch Quotes API Route
import { NextRequest, NextResponse } from 'next/server';
import { protectApiRoute } from '@/lib/auth';
import MarketDataService from '@/lib/market-data';

export async function POST(request: NextRequest) {
  // Simple session check for now
  const sessionToken = request.cookies.get('winmore-session')?.value;
  if (!sessionToken) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const { symbols } = await request.json();

    if (!symbols || !Array.isArray(symbols)) {
      return NextResponse.json(
        { success: false, error: 'Symbols array required' },
        { status: 400 }
      );
    }

    if (symbols.length > 20) {
      return NextResponse.json(
        { success: false, error: 'Maximum 20 symbols per request' },
        { status: 400 }
      );
    }

    const quotes = await MarketDataService.getBatchQuotes(symbols);
    const quotesObject = Object.fromEntries(quotes);

    return NextResponse.json({
      success: true,
      data: quotesObject,
      count: quotes.size,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Batch quotes API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}