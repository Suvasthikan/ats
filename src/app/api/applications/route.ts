import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { ApiResponse, Application, ApplicationFilters } from "@/types";
import { getAuthenticatedRecruiter } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const status = searchParams.get("status");
        const jobId = searchParams.get("jobId");
        const search = searchParams.get("search");
        const sortBy = searchParams.get("sortBy") || "appliedAt";
        const sortOrder = searchParams.get("sortOrder") || "desc";

        const recruiter = await getAuthenticatedRecruiter(request);
        if (!recruiter) {
            return NextResponse.json(
                { success: false, error: "Unauthorized: Recruiter access required" },
                { status: 401 }
            );
        }

        const where: any = {
            job: {
                recruiterId: recruiter.id
            }
        };

        if (status && status !== "ALL") {
            where.status = status;
        }

        if (jobId && jobId !== "ALL") {
            where.jobId = parseInt(jobId);
        }

        if (search) {
            where.OR = [
                { candidate: { name: { contains: search } } },
                { candidate: { email: { contains: search } } },
            ];
        }

        const applications = await prisma.application.findMany({
            where,
            include: {
                job: true,
                candidate: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        resumeName: true,
                        createdAt: true,
                    }
                },
            },
            orderBy: {
                [sortBy]: sortOrder,
            },
        });

        const response: ApiResponse<Application[]> = {
            success: true,
            data: applications as any,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Error fetching applications:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch applications" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const jobId = parseInt(formData.get("jobId") as string);
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const phone = formData.get("phone") as string;
        const resumeFile = formData.get("resume") as File | null;

        if (!jobId || !name || !email || !phone) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Fetch job and recruiter to check ownership
        const job = await prisma.job.findUnique({
            where: { id: jobId },
            include: { recruiter: true },
        });

        if (!job) {
            return NextResponse.json(
                { success: false, error: "Job not found" },
                { status: 404 }
            );
        }

        // CRITICAL BUSINESS RULE: Recruiter cannot apply to their own job
        if (job.recruiter && job.recruiter.email === email) {
            return NextResponse.json(
                { success: false, error: "You cannot apply to your own job listing." },
                { status: 403 }
            );
        }

        // Check for duplicate application
        const existingApplication = await prisma.application.findFirst({
            where: {
                jobId,
                candidate: {
                    email,
                },
            },
            include: {
                job: true,
            },
        });

        if (existingApplication) {
            return NextResponse.json(
                {
                    success: false,
                    error: `You have already applied for the ${existingApplication.job.title} position.`
                },
                { status: 409 }
            );
        }

        let resumeBuffer: Buffer | undefined;
        let resumeName: string | undefined;

        if (resumeFile) {
            const bytes = await resumeFile.arrayBuffer();
            resumeBuffer = Buffer.from(bytes);
            resumeName = resumeFile.name;
        }

        // Mock AI Scoring logic
        // In a real app, this would send the resume text to an LLM
        const mockScores = [65, 72, 85, 90, 95];
        const randomScore = mockScores[Math.floor(Math.random() * mockScores.length)];
        let summary = "";

        if (randomScore >= 90) {
            summary = "Excellent match! Candidate has strong relevant experience and skills.";
        } else if (randomScore >= 75) {
            summary = "Good candidate. Meets most requirements but may need training in some areas.";
        } else {
            summary = "Potential match. Resume lacks some specific keywords for this role.";
        }

        // Transaction to ensure atomic creation of candidate and application
        const application = await prisma.$transaction(async (tx) => {
            // Find or create candidate
            let candidate = await tx.candidate.findUnique({
                where: { email },
            });

            if (!candidate) {
                candidate = await tx.candidate.create({
                    data: {
                        name,
                        email,
                        phone,
                        resume: resumeBuffer,
                        resumeName,
                    },
                });
            } else {
                // Update candidate info (including resume) if they apply again
                candidate = await tx.candidate.update({
                    where: { email },
                    data: {
                        name,
                        phone,
                        resume: resumeBuffer || candidate.resume, // Keep old resume if new one not provided
                        resumeName: resumeName || candidate.resumeName,
                    },
                });
            }

            return await tx.application.create({
                data: {
                    jobId,
                    candidateId: candidate.id,
                    aiScore: randomScore,
                    aiSummary: summary,
                },
                include: {
                    job: true,
                    candidate: true,
                },
            });
        });

        revalidatePath('/dashboard');
        return NextResponse.json({ success: true, data: application }, { status: 201 });
    } catch (error) {
        console.error("Error submitting application:", error);
        return NextResponse.json(
            { success: false, error: "Failed to submit application" },
            { status: 500 }
        );
    }
}
