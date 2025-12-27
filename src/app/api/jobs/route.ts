import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { ApiResponse, Job } from "@/types";
import { getAuthenticatedRecruiter } from "@/lib/auth";

export async function GET() {
    try {
        const jobs = await prisma.job.findMany({
            orderBy: { createdAt: "desc" },
        });

        const response: ApiResponse<Job[]> = {
            success: true,
            data: jobs,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Error fetching jobs:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch jobs" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const recruiter = await getAuthenticatedRecruiter(request);
        if (!recruiter) {
            return NextResponse.json(
                { success: false, error: "Unauthorized: Recruiter access required" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { title, description } = body;

        if (!title || !description) {
            return NextResponse.json(
                { success: false, error: "Title and description are required" },
                { status: 400 }
            );
        }

        const job = await prisma.job.create({
            data: {
                title,
                description,
                recruiterId: recruiter.id,
            },
        });

        revalidatePath('/dashboard');
        revalidatePath('/jobs');

        const response: ApiResponse<Job> = {
            success: true,
            data: job,
        };

        return NextResponse.json(response, { status: 201 });
    } catch (error) {
        console.error("Error creating job:", error);
        return NextResponse.json(
            { success: false, error: "Failed to create job" },
            { status: 500 }
        );
    }
}
