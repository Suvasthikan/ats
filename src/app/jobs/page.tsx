import Link from 'next/link';
import prisma from '@/lib/prisma';
import JobCard from '@/components/JobCard';
import { Job } from '@/types';

export const dynamic = 'force-dynamic';

export default async function JobsPage() {
  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
          Open Positions
        </h1>
        <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500 dark:text-gray-400">
          Join our team and help us build the future. Check out our detailed open roles below.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {jobs.length > 0 ? (
          jobs.map((job: Job) => (
            // @ts-ignore - Prisma types vs Interface mismatch on dates
            <JobCard key={job.id} job={job} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No open positions at the moment. Check back later!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
