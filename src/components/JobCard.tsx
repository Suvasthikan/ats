import Link from 'next/link';
import { Job } from '@/types';

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  return (
    <div className="card hover:shadow-xl transition-all duration-300 border border-transparent hover:border-blue-500/20">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            {job.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400" suppressHydrationWarning>
            Posted {new Date(job.createdAt).toLocaleDateString()}
          </p>
        </div>
        <Link 
          href={`/apply/${job.id}`}
          className="btn btn-primary text-sm"
        >
          Apply Now
        </Link>
      </div>
      <div className="prose dark:prose-invert max-w-none">
        <p className="text-gray-600 dark:text-gray-300 line-clamp-3 whitespace-pre-line">
          {job.description}
        </p>
      </div>
    </div>
  );
}
