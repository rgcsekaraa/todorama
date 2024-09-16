import { NextResponse } from 'next/server';
import { auth } from '@/auth'; // Ensure you import the auth method from your auth setup

export async function middleware(req) {
  const session = await auth(req);

  // If there's no session, redirect to sign-in page
  if (!session) {
    return NextResponse.redirect(new URL('/', req.url)); // Redirect to landing page if not authenticated
  }

  return NextResponse.next(); // Allow access if authenticated
}

// Specify routes to protect (e.g., protect /dashboard)
export const config = {
  matcher: ['/dashboard'], // Protect dashboard route
};
