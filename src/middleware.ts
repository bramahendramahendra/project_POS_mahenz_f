import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const userCookie = request.cookies.get('user')?.value;
  const allowedPathsCookie = request.cookies.get('allowedPaths')?.value;
  const { pathname } = request.nextUrl;

  // Define public routes (tidak perlu authentication)
  const publicRoutes = ['/login', '/register', '/forgot-password', '/forbidden'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Homepage redirect logic
  if (pathname === '/') {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Jika sudah login, redirect dari auth pages ke dashboard
  if (isPublicRoute && token && pathname !== '/forbidden') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Jika belum login, redirect ke login dengan intended destination
  if (!isPublicRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ✅ DYNAMIC: Role-Based Access Control dari Database
  if (token && userCookie && allowedPathsCookie && !isPublicRoute) {
    try {
      // Parse allowed paths dari cookie
      const allowedPaths: string[] = JSON.parse(allowedPathsCookie);
      const user = JSON.parse(userCookie);

      // Check apakah current path ada di allowed paths
      const canAccess = allowedPaths.some(allowedPath => {
        // Exact match
        if (pathname === allowedPath) return true;
        
        // Parent route match (e.g., /master allows /master/menu)
        if (pathname.startsWith(allowedPath + '/')) return true;
        
        return false;
      });

      // Jika tidak punya akses, redirect ke forbidden page
      if (!canAccess) {
        const forbiddenUrl = new URL('/forbidden', request.url);
        forbiddenUrl.searchParams.set('reason', 'insufficient_permissions');
        forbiddenUrl.searchParams.set('role', user.role?.nama_role || 'Unknown');
        forbiddenUrl.searchParams.set('attempted', pathname);
        return NextResponse.redirect(forbiddenUrl);
      }
    } catch (error) {
      // Jika error parse cookies, anggap invalid dan redirect ke login
      console.error('Error parsing cookies in middleware:', error);
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Allow request to proceed
  return NextResponse.next();
}

// Config: Define which routes should be checked by middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files (images, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.ico$).*)',
  ],
};