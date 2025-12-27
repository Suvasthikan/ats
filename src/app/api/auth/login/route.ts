import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Missing credentials' },
                { status: 400 }
            );
        }

        // Try to find as Recruiter first
        let user: any = await prisma.recruiter.findUnique({ where: { email } });
        let role = 'RECRUITER';

        if (!user) {
            // Try as Candidate
            user = await prisma.candidate.findUnique({ where: { email } });
            role = 'CANDIDATE';
        }

        if (!user || !user.password) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        const sessionUser = { id: user.id, name: user.name, email: user.email, role };

        const response = NextResponse.json(
            { success: true, user: sessionUser },
            { status: 200 }
        );

        response.cookies.set('user', encodeURIComponent(JSON.stringify(sessionUser)), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 86400, // 24 hours
            path: '/',
        });

        return response;

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
