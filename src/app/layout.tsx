import type { Metadata } from "next";
import "./globals.css";
import LogoutButton from "@/components/LogoutButton";
import { getServerAuth } from "@/lib/auth";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ATS Demo - Applicant Tracking System",
  description: "A modern applicant tracking system for recruiters and candidates",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerAuth();
  const token = !!session;
  const role = session?.role as string | undefined;

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  ATS Demo
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                {role === 'CANDIDATE' && (
                  <Link
                    href="/jobs"
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Jobs
                  </Link>
                )}
                {role === 'RECRUITER' && (
                  <Link
                    href="/dashboard"
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                )}
                {token && (
                  <div className="flex items-center pl-4 border-l border-gray-200 dark:border-gray-700">
                    <LogoutButton />
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
