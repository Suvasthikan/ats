import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ApiResponse, Job } from "@/types";
import { getAuthenticatedRecruiter } from "@/lib/auth";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const jobId = parseInt(id);

        if (isNaN(jobId)) {
            return NextResponse.json(
                { success: false, error: "Invalid job ID" },
                { status: 400 }
            );
        }

        const job = await prisma.job.findUnique({
            where: { id: jobId },
        });

        if (!job) {
            return NextResponse.json(
                { success: false, error: "Job not found" },
                { status: 404 }
            );
        }

        const response: ApiResponse<Job> = {
            success: true,
            data: job,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Error fetching job:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch job" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const jobId = parseInt(id);
        const body = await request.json();
        const { title, description } = body;

        if (isNaN(jobId)) {
            return NextResponse.json(
                { success: false, error: "Invalid job ID" },
                { status: 400 }
            );
        }

        const recruiter = await getAuthenticatedRecruiter(request);
        if (!recruiter) {
            return NextResponse.json(
                { success: false, error: "Unauthorized: Recruiter access required" },
                { status: 401 }
            );
        }

        const existingJob = await prisma.job.findUnique({
            where: { id: jobId },
        });

        if (!existingJob) {
            return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
        }

        if (existingJob.recruiterId !== recruiter.id) {
            return NextResponse.json(
                { success: false, error: "Forbidden: You do not own this job" },
                { status: 403 }
            );
        }

        const job = await prisma.job.update({
            where: { id: jobId },
            data: {
                title,
                description,
            },
        });

        const response: ApiResponse<Job> = {
            success: true,
            data: job,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Error updating job:", error);
        return NextResponse.json(
            { success: false, error: "Failed to update job" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const jobId = parseInt(id);

        if (isNaN(jobId)) {
            return NextResponse.json(
                { success: false, error: "Invalid job ID" },
                { status: 400 }
            );
        }

        const recruiter = await getAuthenticatedRecruiter(request);
        if (!recruiter) {
            return NextResponse.json(
                { success: false, error: "Unauthorized: Recruiter access required" },
                { status: 401 }
            );
        }

        const existingJob = await prisma.job.findUnique({
            where: { id: jobId },
        });

        if (!existingJob) {
            return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
        }

        if (existingJob.recruiterId !== recruiter.id) {
            return NextResponse.json(
                { success: false, error: "Forbidden: You do not own this job" },
                { status: 403 }
            );
        }

        await prisma.job.delete({
            where: { id: jobId },
        });

        return NextResponse.json({ success: true, data: null });
    } catch (error) {
        console.error("Error deleting job:", error);
        return NextResponse.json(
            { success: false, error: "Failed to delete job" },
            { status: 500 }
        );
    }
}
