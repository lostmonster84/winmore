// Trading 212 Orders History API Route
// GET /api/broker/trading212/orders?limit=50
// Returns order history

import { NextRequest, NextResponse } from 'next/server';
import { protectApiRoute } from '@/lib/auth';
import { getTrading212Adapter } from '@/lib/trading212-adapter';

export async function GET(request: NextRequest) {
  // Protect the API route
  const authError = await protectApiRoute(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    if (limit > 100) {
      return NextResponse.json(
        { success: false, error: 'Limit cannot exceed 100' },
        { status: 400 }
      );
    }

    const trading212 = getTrading212Adapter();
    const ordersResult = await trading212.getOrders(limit);

    if (!ordersResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: ordersResult.error,
          rateLimited: ordersResult.rateLimited
        },
        { status: ordersResult.rateLimited ? 429 : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: ordersResult.data
    });

  } catch (error) {
    console.error('Trading 212 orders API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch orders data' 
      },
      { status: 500 }
    );
  }
}