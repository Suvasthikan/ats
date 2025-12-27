import { memo } from 'react';
import { ApplicationWithDetails } from "@/types";
import ApplicationRow from "./ApplicationRow";

interface ApplicationListProps {
  applications: ApplicationWithDetails[];
}

export default memo(function ApplicationList({ applications }: ApplicationListProps) {
  if (applications.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
        <p className="text-gray-500 dark:text-gray-400">No applications found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Candidate
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Job
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                AI Insight
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {applications.map((app) => (
              <ApplicationRow key={app.id} application={app} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});
