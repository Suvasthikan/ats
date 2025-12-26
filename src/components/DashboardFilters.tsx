'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { APPLICATION_STATUSES, Job } from '@/types';

interface DashboardFiltersProps {
  jobs: Job[];
}

export default function DashboardFilters({ jobs }: DashboardFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get('status') || 'ALL';
  const currentJob = searchParams.get('jobId') || 'ALL';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sortBy') || 'appliedAt';

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'ALL') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/dashboard?${params.toString()}`);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4">
      <div className="flex-1">
        <input
          type="text"
          placeholder="Search candidates..."
          className="input"
          defaultValue={currentSearch}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />
      </div>
      
      <div className="flex space-x-2">
        <select
          className="input w-40"
          value={currentStatus}
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          {APPLICATION_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <select
          className="input w-48"
          value={currentJob}
          onChange={(e) => handleFilterChange('jobId', e.target.value)}
        >
          <option value="ALL">All Jobs</option>
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
        </select>

        <select
          className="input w-40"
          value={currentSort}
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
        >
          <option value="appliedAt">Newest First</option>
          <option value="aiScore">Highest Score</option>
        </select>
      </div>
    </div>
  );
}
