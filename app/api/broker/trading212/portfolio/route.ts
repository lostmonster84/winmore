// Trading 212 Portfolio API Route
// GET /api/broker/trading212/portfolio
// Returns portfolio summary with positions and account info

import { NextRequest, NextResponse } from 'next/server';
import { protectApiRoute } from '@/lib/auth';
import { getTrading212Adapter } from '@/lib/trading212-adapter';

export async function GET(request: NextRequest) {
  // Protect the API route
  const authError = await protectApiRoute(request);
  if (authError) return authError;

  try {
    const trading212 = getTrading212Adapter();
    const portfolioResult = await trading212.getPortfolioSummary();

    if (!portfolioResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: portfolioResult.error,
          rateLimited: portfolioResult.rateLimited
        },
        { status: portfolioResult.rateLimited ? 429 : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: portfolioResult.data
    });

  } catch (error) {
    console.error('Trading 212 portfolio API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch portfolio data' 
      },
      { status: 500 }
    );
  }
}