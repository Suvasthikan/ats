import { ApplicationStatus } from "@/types";

interface DashboardStatsProps {
  stats: {
    total: number;
    byStatus: Record<string, number>;
  };
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  const statusColors = {
    APPLIED: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-200 dark:border-blue-800",
    SCREENING: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-200 dark:border-yellow-800",
    INTERVIEW: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-200 dark:border-purple-800",
    REJECTED: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-200 dark:border-red-800",
    HIRED: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-200 dark:border-green-800",
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Applications</dt>
        <dd className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{stats.total}</dd>
      </div>
      
      {Object.entries(stats.byStatus).map(([status, count]) => (
        <div 
          key={status} 
          className={`p-4 rounded-lg border ${statusColors[status as ApplicationStatus] || 'bg-gray-50'}`}
        >
          <dt className="text-xs font-bold uppercase tracking-wide opacity-80">{status}</dt>
          <dd className="mt-1 text-2xl font-semibold">{count}</dd>
        </div>
      ))}
    </div>
  );
}
