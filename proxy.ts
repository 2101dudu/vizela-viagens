import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const mode = process.env.APP_MODE ?? 'public';
  const { pathname } = request.nextUrl;

  if (mode === 'public' && pathname.startsWith('/admin')) {
    return new NextResponse(null, { status: 404 });
  }
  if (mode === 'admin' && !pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
