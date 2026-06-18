import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('admin-token')?.value;

    if (token) {
      // Delete session from database
      try {
        await db.session.deleteMany({ where: { token } });
      } catch {
        // Ignore
      }
    }
  } catch {
    // Ignore
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set('admin-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return response;
}
