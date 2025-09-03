import { NextRequest, NextResponse } from 'next/server';

const MASTER_PASSWORD = process.env.WINMORE_PASSWORD || 'Lando84';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    console.log('Login attempt with password:', password);

    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Password is required' },
        { status: 400 }
      );
    }

    const isValid = password === MASTER_PASSWORD;
    console.log('Password validation result:', isValid);
    
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Create session token
    const sessionToken = Buffer.from(`winmore-${Date.now()}-${Math.random()}`).toString('base64');

    const response = NextResponse.json({ success: true });
    
    // Set the session cookie
    response.cookies.set({
      name: 'winmore-session',
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}