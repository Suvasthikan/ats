import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { ApiResponse, Application, ApplicationStatus, APPLICATION_STATUSES } from "@/types";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const applicationId = parseInt(id);

        if (isNaN(applicationId)) {
            return NextResponse.json(
                { success: false, error: "Invalid application ID" },
                { status: 400 }
            );
        }

        const application = await prisma.application.findUnique({
            where: { id: applicationId },
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
                notes: {
                    orderBy: { createdAt: "desc" },
                },
            },
        });

        if (!application) {
            return NextResponse.json(
                { success: false, error: "Application not found" },
                { status: 404 }
            );
        }

        const response: ApiResponse<Application> = {
            success: true,
            data: application as any,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Error fetching application:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch application" },
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
        const applicationId = parseInt(id);
        const body = await request.json();
        const { status } = body;

        if (isNaN(applicationId)) {
            return NextResponse.json(
                { success: false, error: "Invalid application ID" },
                { status: 400 }
            );
        }

        if (!APPLICATION_STATUSES.includes(status as ApplicationStatus)) {
            return NextResponse.json(
                { success: false, error: "Invalid status" },
                { status: 400 }
            );
        }

        const application = await prisma.application.update({
            where: { id: applicationId },
            data: {
                status,
            },
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
        });

        revalidatePath('/dashboard');
        return NextResponse.json({ success: true, data: application });
    } catch (error) {
        console.error("Error updating application:", error);
        return NextResponse.json(
            { success: false, error: "Failed to update application" },
            { status: 500 }
        );
    }
}
