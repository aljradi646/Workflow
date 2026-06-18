import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin-token')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Verify token against database session
    const session = await db.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || !session.user || !session.user.isActive) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      // Clean up expired session
      try { await db.session.delete({ where: { id: session.id } }); } catch {}
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        avatar: session.user.avatar,
      },
    });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
