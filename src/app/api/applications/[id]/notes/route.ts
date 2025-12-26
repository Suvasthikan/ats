import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ApiResponse, Note } from "@/types";

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

        const notes = await prisma.note.findMany({
            where: { applicationId },
            orderBy: { createdAt: "desc" },
        });

        const response: ApiResponse<Note[]> = {
            success: true,
            data: notes,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Error fetching notes:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch notes" },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const applicationId = parseInt(id);
        const body = await request.json();
        const { content } = body;

        if (isNaN(applicationId)) {
            return NextResponse.json(
                { success: false, error: "Invalid application ID" },
                { status: 400 }
            );
        }

        if (!content || !content.trim()) {
            return NextResponse.json(
                { success: false, error: "Note content is required" },
                { status: 400 }
            );
        }

        const note = await prisma.note.create({
            data: {
                applicationId,
                content,
            },
        });

        const response: ApiResponse<Note> = {
            success: true,
            data: note,
        };

        return NextResponse.json(response, { status: 201 });
    } catch (error) {
        console.error("Error creating note:", error);
        return NextResponse.json(
            { success: false, error: "Failed to create note" },
            { status: 500 }
        );
    }
}
