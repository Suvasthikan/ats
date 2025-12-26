import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerAuth } from '@/lib/auth';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerAuth();
        if (!session || session.role !== 'RECRUITER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const applicationId = parseInt(id);

        const application = await prisma.application.findUnique({
            where: { id: applicationId },
            include: {
                candidate: true,
                job: true,
            },
        });

        if (!application || !application.candidate.resume) {
            return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
        }

        // Security check: Only the recruiter who posted the job can download the resume
        const job = application.job as any;
        if (job.recruiterId !== session.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const resume = application.candidate.resume as Buffer;
        const resumeName = application.candidate.resumeName || `resume_${application.candidate.name}.pdf`;

        return new Response(new Uint8Array(resume), {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${resumeName}"`,
            },
        });
    } catch (error) {
        console.error('Resume download error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
