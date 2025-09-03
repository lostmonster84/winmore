import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('winmore-session')?.value;
    console.log('Session token received:', sessionToken);
    
    if (!sessionToken) {
      console.log('No session token found');
      return NextResponse.json({ authenticated: false });
    }

    // Decode the base64 token
    const decodedToken = Buffer.from(sessionToken, 'base64').toString();
    console.log('Decoded token:', decodedToken);
    
    if (!decodedToken.startsWith('winmore-')) {
      console.log('Token does not start with winmore-');
      return NextResponse.json({ authenticated: false });
    }

    // Basic token validation - in production you'd want proper JWT
    const parts = decodedToken.split('-');
    console.log('Token parts:', parts);
    
    if (parts.length < 3) {
      console.log('Token does not have enough parts');
      return NextResponse.json({ authenticated: false });
    }

    const timestamp = parseInt(parts[1]);
    console.log('Timestamp:', timestamp);
    
    if (isNaN(timestamp)) {
      console.log('Invalid timestamp');
      return NextResponse.json({ authenticated: false });
    }

    // Check if session has expired (7 days)
    const sessionAge = Date.now() - timestamp;
    console.log('Session age (ms):', sessionAge);
    
    if (sessionAge > 7 * 24 * 60 * 60 * 1000) {
      console.log('Session expired');
      return NextResponse.json({ authenticated: false });
    }
    
    console.log('Session valid');
    return NextResponse.json({ authenticated: true });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ authenticated: false });
  }
}