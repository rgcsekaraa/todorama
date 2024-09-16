import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  // Ensure NEXTAUTH_SECRET is defined
  if (!process.env.AUTH_SECRET) {
    throw new Error('NEXTAUTH_SECRET is not defined in environment variables');
  }

  const session = await getToken({ req, secret: process.env.AUTH_SECRET });

  // If there's no session, redirect to sign-in page
  if (!session) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard'],
};
