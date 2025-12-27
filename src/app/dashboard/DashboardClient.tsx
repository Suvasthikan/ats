'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardFilters from "@/components/DashboardFilters";
import ApplicationList from "@/components/ApplicationList";
import DashboardStats from "@/components/DashboardStats";
import JobModal from "@/components/JobModal";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import SuccessModal from "@/components/SuccessModal";

export default function DashboardClient({ jobs, applications, stats, recruiterName }: any) {
  const router = useRouter();
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [deletingJob, setDeletingJob] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Group applications by jobId
  const applicationsByJob = jobs.reduce((acc: any, job: any) => {
    acc[job.id] = applications.filter((app: any) => app.jobId === job.id);
    return acc;
  }, {});

  const handleEditJob = (job: any) => {
    setEditingJob(job);
    setIsJobModalOpen(true);
  };

  const handleJobModalSuccess = () => {
    setIsJobModalOpen(false);
    setSuccessMessage(editingJob ? 'Job updated successfully!' : 'Job posted successfully!');
    router.refresh();
  };

  const handleDeleteJob = async () => {
    if (!deletingJob) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/jobs/${deletingJob.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete job');
      setDeletingJob(null);
      setSuccessMessage('Job deleted successfully!');
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Error deleting job');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-4 duration-300">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome, {recruiterName}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your job postings and applications</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setEditingJob(null);
              setIsJobModalOpen(true);
            }}
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
              <div key={job.id} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{job.title}</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                      {jobApplications.length} Applicants
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditJob(job)}
                      className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all border border-transparent hover:border-blue-100 dark:hover:border-blue-900"
                      title="Edit Job"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeletingJob(job)}
                      className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all border border-transparent hover:border-red-100 dark:hover:border-red-900"
                      title="Delete Job"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
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

      <JobModal 
        isOpen={isJobModalOpen} 
        onClose={() => setIsJobModalOpen(false)} 
        onSuccess={handleJobModalSuccess}
        job={editingJob}
      />

      <DeleteConfirmationModal
        isOpen={!!deletingJob}
        onClose={() => setDeletingJob(null)}
        onConfirm={handleDeleteJob}
        title="Delete Job Posting?"
        message={`Are you sure you want to delete "${deletingJob?.title}"? This will also remove all associated applications. This action cannot be undone.`}
        loading={isDeleting}
      />

      <SuccessModal
        isOpen={!!successMessage}
        onClose={() => setSuccessMessage(null)}
        title="Success!"
        message={successMessage || ''}
      />
    </div>
  );
}

