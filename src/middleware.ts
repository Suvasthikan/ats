import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const path = request.nextUrl.pathname;

    const secretStr = process.env.JWT_SECRET || 'default-secret-key';
    const secret = new TextEncoder().encode(secretStr);

    // Paths that don't require auth
    if (
        path.startsWith('/login') ||
        path.startsWith('/register') ||
        path.startsWith('/api/auth') ||
        path === '/'
    ) {
        if (token && (path.startsWith('/login') || path.startsWith('/register'))) {
            try {
                const { payload } = await jwtVerify(token, secret);
                const role = payload.role as string;
                const redirectUrl = request.nextUrl.clone();
                redirectUrl.pathname = role === 'RECRUITER' ? '/dashboard' : '/jobs';
                return NextResponse.redirect(redirectUrl);
            } catch (err) {
                console.error('Middleware token verify error (auth-less path):', err);
                return NextResponse.next();
            }
        }
        return NextResponse.next();
    }

    if (!token) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = '/login';
        return NextResponse.redirect(loginUrl);
    }

    try {
        const { payload } = await jwtVerify(token, secret);
        const role = payload.role as string;

        // Role-based access control
        if (path.startsWith('/dashboard') && role !== 'RECRUITER') {
            const jobsUrl = request.nextUrl.clone();
            jobsUrl.pathname = '/jobs';
            return NextResponse.redirect(jobsUrl);
        }

        if (path.startsWith('/jobs') && role === 'RECRUITER' && !path.startsWith('/jobs/')) {
            const dashUrl = request.nextUrl.clone();
            dashUrl.pathname = '/dashboard';
            return NextResponse.redirect(dashUrl);
        }

        return NextResponse.next();
    } catch (err) {
        console.error('Middleware token verify error:', err);
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = '/login';
        return NextResponse.redirect(loginUrl);
    }
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
