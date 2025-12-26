import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const path = request.nextUrl.pathname;

    // Paths that don't require auth
    if (
        path.startsWith('/login') ||
        path.startsWith('/register') ||
        path.startsWith('/api/auth') ||
        path === '/'
    ) {
        if (token && (path.startsWith('/login') || path.startsWith('/register'))) {
            try {
                const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key');
                const { payload } = await jwtVerify(token, secret);
                const role = payload.role as string;
                return NextResponse.redirect(new URL(role === 'RECRUITER' ? '/dashboard' : '/jobs', request.url));
            } catch (err) {
                return NextResponse.next();
            }
        }
        return NextResponse.next();
    }

    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key');
        const { payload } = await jwtVerify(token, secret);
        const role = payload.role as string;

        // Role-based access control
        if (path.startsWith('/dashboard') && role !== 'RECRUITER') {
            return NextResponse.redirect(new URL('/jobs', request.url));
        }

        if (path.startsWith('/jobs') && role === 'RECRUITER' && !path.startsWith('/jobs/')) {
            // Recruiters see dashboard, not the portal
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }

        return NextResponse.next();
    } catch (err) {
        return NextResponse.redirect(new URL('/login', request.url));
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
