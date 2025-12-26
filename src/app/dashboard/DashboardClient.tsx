'use client';

import { useState } from 'react';
import DashboardFilters from "@/components/DashboardFilters";
import ApplicationList from "@/components/ApplicationList";
import DashboardStats from "@/components/DashboardStats";
import PostJobModal from "@/components/PostJobModal";

export default function DashboardClient({ jobs, applications, stats, recruiterName }: any) {
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);

  // Group applications by jobId
  const applicationsByJob = jobs.reduce((acc: any, job: any) => {
    acc[job.id] = applications.filter((app: any) => app.jobId === job.id);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome, {recruiterName}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your job postings and applications</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsPostJobModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-0h6m-6 0H6" />
            </svg>
            Post New Job
          </button>
        </div>
      </div>

      <DashboardStats stats={stats} />

      <DashboardFilters jobs={jobs} />

      <div className="space-y-8">
        {jobs.length > 0 ? (
          jobs.map((job: any) => {
            const jobApplications = applicationsByJob[job.id] || [];
            if (jobApplications.length === 0 && applications.length > 0) return null; // Don't show empty jobs if filtering

            return (
              <div key={job.id} className="space-y-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{job.title}</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    {jobApplications.length} Applicants
                  </span>
                </div>
                <ApplicationList applications={jobApplications} />
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <p className="text-gray-500 dark:text-gray-400">You haven't posted any jobs yet.</p>
          </div>
        )}
      </div>

      <PostJobModal 
        isOpen={isPostJobModalOpen} 
        onClose={() => setIsPostJobModalOpen(false)} 
      />
    </div>
  );
}
