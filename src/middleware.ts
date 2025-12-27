import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const userCookie = request.cookies.get('user')?.value;
    const path = request.nextUrl.pathname;

    let user: any = null;
    if (userCookie) {
        try {
            user = JSON.parse(decodeURIComponent(userCookie));
        } catch (err) {
            console.error('Middleware cookie parse error:', err);
        }
    }

    // Paths that don't require auth
    if (
        path.startsWith('/login') ||
        path.startsWith('/register') ||
        path.startsWith('/api/auth') ||
        path === '/'
    ) {
        if (user && (path.startsWith('/login') || path.startsWith('/register'))) {
            const redirectUrl = request.nextUrl.clone();
            redirectUrl.pathname = user.role === 'RECRUITER' ? '/dashboard' : '/jobs';
            return NextResponse.redirect(redirectUrl);
        }
        return NextResponse.next();
    }

    if (!user) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = '/login';
        return NextResponse.redirect(loginUrl);
    }

    // Role-based access control
    if (path.startsWith('/dashboard') && user.role !== 'RECRUITER') {
        const jobsUrl = request.nextUrl.clone();
        jobsUrl.pathname = '/jobs';
        return NextResponse.redirect(jobsUrl);
    }

    if (path.startsWith('/jobs') && user.role === 'RECRUITER' && !path.startsWith('/jobs/')) {
        const dashUrl = request.nextUrl.clone();
        dashUrl.pathname = '/dashboard';
        return NextResponse.redirect(dashUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
