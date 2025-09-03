// Trading 212 Account Info API Route
// GET /api/broker/trading212/account
// Returns account cash and balance info

import { NextRequest, NextResponse } from 'next/server';
import { protectApiRoute } from '@/lib/auth';
import { getTrading212Adapter } from '@/lib/trading212-adapter';

export async function GET(request: NextRequest) {
  // Protect the API route
  const authError = await protectApiRoute(request);
  if (authError) return authError;

  try {
    const trading212 = getTrading212Adapter();
    const accountResult = await trading212.getAccount();

    if (!accountResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: accountResult.error,
          rateLimited: accountResult.rateLimited
        },
        { status: accountResult.rateLimited ? 429 : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: accountResult.data
    });

  } catch (error) {
    console.error('Trading 212 account API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch account data' 
      },
      { status: 500 }
    );
  }
}