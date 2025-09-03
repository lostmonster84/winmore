// OUTPOST Trading System Middleware
// Temporarily disabled - using client-side auth checks instead

import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  // Allow all requests for now - auth handled client-side
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};