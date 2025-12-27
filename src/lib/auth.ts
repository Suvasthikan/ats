import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import prisma from "./prisma";

export async function getAuthenticatedRecruiter(request: NextRequest) {
    const userCookie = request.cookies.get('user')?.value;

    if (!userCookie) {
        return null;
    }

    try {
        const payload = JSON.parse(decodeURIComponent(userCookie));

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
    const userCookie = cookieStore.get('user')?.value;

    if (!userCookie) {
        return null;
    }

    try {
        const payload = JSON.parse(decodeURIComponent(userCookie));
        return payload;
    } catch (error) {
        return null;
    }
}
