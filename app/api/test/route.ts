import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Test route received:', body);
    
    return NextResponse.json({ 
      success: true, 
      received: body,
      password: body.password,
      isCorrect: body.password === 'Lando84!*'
    });
  } catch (error) {
    console.error('Test route error:', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
}