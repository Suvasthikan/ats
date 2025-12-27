import prisma from "@/lib/prisma";
import { ApplicationStatus } from "@/types";
import DashboardClient from "./DashboardClient";
import { getServerAuth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

interface DashboardPageProps {
  searchParams: Promise<{
    status?: string;
    jobId?: string;
    search?: string;
    sortBy?: string;
  }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await getServerAuth();
  
  if (!session || session.role !== 'RECRUITER') {
    redirect('/login');
  }

  const recruiterId = session.id as number;
  const params = await searchParams;
  const status = params.status as ApplicationStatus | 'ALL' | undefined;
  const jobId = params.jobId !== 'ALL' && params.jobId ? parseInt(params.jobId) : undefined;
  const search = params.search;
  const sortBy = (params.sortBy as 'appliedAt' | 'aiScore') || 'appliedAt';

  const where: any = {
    job: {
      recruiterId: recruiterId
    }
  };

  if (status && status !== 'ALL') {
    where.status = status;
  }

  if (jobId) {
    where.jobId = jobId;
  }

  if (search) {
    where.OR = [
      { candidate: { name: { contains: search } } },
      { candidate: { email: { contains: search } } },
    ];
  }

  // Fetch only jobs belonging to this recruiter
  const jobsRaw = await prisma.job.findMany({
    where: { recruiterId },
    select: { id: true, title: true, description: true, createdAt: true, recruiterId: true },
    orderBy: { createdAt: 'desc' },
  });

  // Fetch applications for this recruiter's jobs
  const applicationsRaw = await prisma.application.findMany({
    where,
    include: {
      job: true,
      candidate: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          resumeName: true,
          createdAt: true,
        }
      },
      notes: {
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: {
      [sortBy]: 'desc',
    },
  });

  // Serialize everything for safe RCC passing
  const jobs = jobsRaw.map(job => ({
    ...job,
    createdAt: job.createdAt.toISOString()
  }));

  const applications = applicationsRaw.map(app => ({
    ...app,
    appliedAt: app.appliedAt.toISOString(),
    job: {
      ...app.job,
      createdAt: app.job.createdAt.toISOString()
    },
    candidate: {
      ...app.candidate,
      createdAt: app.candidate.createdAt.toISOString()
    },
    notes: app.notes.map(note => ({
      ...note,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString()
    }))
  }));

  // Calculate stats
  const stats = {
    total: applications.length,
    byStatus: applications.reduce((acc: Record<string, number>, app: any) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  const recruiter = await prisma.recruiter.findUnique({
    where: { id: recruiterId },
    select: { name: true },
  });

  return (
    <DashboardClient 
      jobs={jobs} 
      applications={applications} 
      stats={stats} 
      recruiterName={recruiter?.name || 'Recruiter'}
    />
  );
}
