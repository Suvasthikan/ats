import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

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

        // Create JWT
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key');
        const token = await new SignJWT({ id: user.id, email: user.email, role })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('24h')
            .sign(secret);

        const response = NextResponse.json(
            { success: true, user: { id: user.id, name: user.name, email: user.email, role } },
            { status: 201 }
        );

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: true, // Mandatory for Vercel (HTTPS)
            sameSite: 'none', // Required for reliable cross-site/production redirects
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
