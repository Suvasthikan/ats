export const APPLICATION_STATUSES = [
    'APPLIED',
    'SCREENING',
    'INTERVIEW',
    'REJECTED',
    'HIRED',
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export interface Job {
    id: number;
    title: string;
    description: string;
    createdAt: Date;
    recruiterId: number;
}

export interface Candidate {
    id: number;
    name: string;
    email: string;
    phone: string;
    resume: Buffer | null;
    resumeName: string | null;
    createdAt: Date;
}

export interface Note {
    id: number;
    applicationId: number;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Application {
    id: number;
    jobId: number;
    candidateId: number;
    status: ApplicationStatus;
    aiSummary: string | null;
    aiScore: number | null;
    appliedAt: Date;
    job?: Job;
    candidate?: Candidate;
    notes?: Note[];
}

export interface ApplicationWithDetails extends Application {
    job: Job;
    candidate: Candidate;
    notes: Note[];
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface ApplicationFilters {
    status?: ApplicationStatus;
    jobId?: number;
    search?: string;
    sortBy?: 'appliedAt' | 'aiScore';
    sortOrder?: 'asc' | 'desc';
}

export interface AnalyticsData {
    totalApplications: number;
    applicationsByStatus: Record<ApplicationStatus, number>;
    applicationsByJob: { jobId: number; jobTitle: string; count: number }[];
}
