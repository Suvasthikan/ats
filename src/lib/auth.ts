import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import prisma from "./prisma";
import { jwtVerify } from 'jose';

export async function getAuthenticatedRecruiter(request: NextRequest) {
    const token = request.cookies.get('token')?.value;

    if (!token) {
        return null;
    }

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key');
        const { payload } = await jwtVerify(token, secret);

        if (!payload || !payload.email || payload.role !== 'RECRUITER') {
            return null;
        }

        const recruiter = await prisma.recruiter.findUnique({
            where: { email: payload.email as string },
        });

        return recruiter;
    } catch (error) {
        console.error('Auth verification error:', error);
        return null;
    }
}

export async function getServerAuth() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        return null;
    }

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key');
        const { payload } = await jwtVerify(token, secret);
        return payload;
    } catch (error) {
        return null;
    }
}
