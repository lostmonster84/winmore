// OUTPOST Trading System Authentication
// Simple password-based authentication for private use

import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE_NAME = 'winmore-session';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export class OutpostAuth {
  private static readonly MASTER_PASSWORD = process.env.WINMORE_PASSWORD || 'Lando84!*';
  
  static async validatePassword(password: string): Promise<boolean> {
    return password === this.MASTER_PASSWORD;
  }

  static async validateSession(request: NextRequest): Promise<boolean> {
    try {
      const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

      if (!sessionToken || !sessionToken.startsWith('winmore-')) {
        return false;
      }

      // Extract timestamp from session token
      const parts = Buffer.from(sessionToken, 'base64').toString().split('-');
      if (parts.length < 2) return false;

      const timestamp = parseInt(parts[1]);
      if (isNaN(timestamp)) return false;

      // Check if session has expired
      const sessionAge = Date.now() - timestamp;
      if (sessionAge > SESSION_DURATION) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  }

  static async requireAuth(request: NextRequest): Promise<NextResponse | null> {
    const isAuthenticated = await this.validateSession(request);
    
    if (!isAuthenticated) {
      // Redirect to login page
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    return null; // Allow the request to continue
  }

  // Middleware helper
  static async middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip auth for login page and public assets
    if (pathname === '/login' || 
        pathname.startsWith('/_next/') || 
        pathname.startsWith('/api/auth/') ||
        pathname.includes('.')) {
      return NextResponse.next();
    }

    // Check authentication for all other routes
    const authRedirect = await this.requireAuth(request);
    if (authRedirect) {
      return authRedirect;
    }

    return NextResponse.next();
  }
}

// Helper function for API route protection
export async function protectApiRoute(request: NextRequest): Promise<NextResponse | null> {
  const isAuthenticated = await OutpostAuth.validateSession(request);
  
  if (!isAuthenticated) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    );
  }

  return null; // Allow the request to continue
}

// Server-side auth helpers
export function createSessionToken(): string {
  return Buffer.from(`winmore-${Date.now()}-${Math.random()}`).toString('base64');
}

export function createSessionCookie(token: string) {
  return {
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: SESSION_DURATION / 1000, // Convert to seconds
    path: '/',
  };
}

export function clearSessionCookie() {
  return {
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 0,
    path: '/',
  };
}

// Client-side auth helpers
export const clientAuth = {
  async login(password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  },

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/login';
    }
  },

  async checkSession(): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      return data.authenticated;
    } catch (error) {
      return false;
    }
  }
};