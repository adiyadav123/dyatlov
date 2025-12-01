import { NextResponse } from 'next/server'

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/start',
  '/newspaper-1959',
  '/voices-1959',
  '/soviet-archive',
  '/soviet-archive/evidence',
  '/admin',
  '/support',
]

// Routes that are publicly accessible
const PUBLIC_ROUTES = [
  '/event-ended', // Only event-ended should be public when site is locked
]

export function middleware(request) {
  const { pathname } = request.nextUrl

  // Lock the site: allow only API/static and the `/event-ended` page
  if (
    !pathname.startsWith('/api/') &&
    !pathname.startsWith('/_next') &&
    !PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))
  ) {
    const url = new URL('/event-ended', request.url)
    return NextResponse.redirect(url)
  }

  // Allow public routes
  if (PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next()
  }

  // Allow API routes
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Check if route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some(
    route => pathname === route || pathname.startsWith(route + '/')
  )

  if (isProtectedRoute) {
    // Check for auth in cookies (new security system)
    // OR check for participantType in localStorage via cookies (existing system)
    const authToken = request.cookies.get('auth_token')?.value
    const userEmail = request.cookies.get('user_email')?.value
    const participantType = request.cookies.get('participantType')?.value
    const participantId = request.cookies.get('participantId')?.value

    // Allow if either new security system (auth_token + userEmail) 
    // OR existing system (participantType + participantId) are present
    if ((!authToken || !userEmail) && (!participantType && !participantId)) {
      // No auth found, redirect to register page
      const registerUrl = new URL('/register', request.url)
      registerUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(registerUrl)
    }

    // Auth exists (either system), allow access
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|logo.png).*)',
  ],
}
