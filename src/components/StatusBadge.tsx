import { ApplicationStatus } from "@/types";

interface StatusBadgeProps {
  status: ApplicationStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    APPLIED: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    SCREENING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    INTERVIEW: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    REJECTED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    HIRED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}
