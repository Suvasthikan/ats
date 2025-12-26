import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import ApplicationForm from '@/components/ApplicationForm';

interface ApplyPageProps {
  params: Promise<{
    jobId: string;
  }>;
}

export default async function ApplyPage({ params }: ApplyPageProps) {
  const { jobId } = await params;
  const id = parseInt(jobId);

  if (isNaN(id)) {
    notFound();
  }

  const job = await prisma.job.findUnique({
    where: { id },
  });

  if (!job) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {job.title}
        </h1>
        <div className="prose dark:prose-invert mx-auto text-left bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-2">Job Description</h3>
          <p className="whitespace-pre-line text-gray-600 dark:text-gray-300">
            {job.description}
          </p>
        </div>
      </div>

      <ApplicationForm jobId={job.id} jobTitle={job.title} />
    </div>
  );
}
