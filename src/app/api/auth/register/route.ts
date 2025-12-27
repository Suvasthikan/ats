import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { name, email, password, role } = await request.json();

        if (!email || !password || !name || !role) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let user;
        if (role === 'RECRUITER') {
            const existingUser = await prisma.recruiter.findUnique({ where: { email } });
            if (existingUser) return NextResponse.json({ error: 'User already exists' }, { status: 400 });
            user = await prisma.recruiter.create({
                data: { name, email, password: hashedPassword },
            });
        } else if (role === 'CANDIDATE') {
            const existingUser = await prisma.candidate.findUnique({ where: { email } });
            if (existingUser) return NextResponse.json({ error: 'User already exists' }, { status: 400 });
            user = await prisma.candidate.create({
                data: { name, email, password: hashedPassword, phone: '' },
            });
        } else {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }

        const sessionUser = { id: user.id, name: user.name, email: user.email, role };

        const response = NextResponse.json(
            { success: true, user: sessionUser },
            { status: 201 }
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
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
