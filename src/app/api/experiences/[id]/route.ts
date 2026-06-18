import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { success, error, handleError } from "@/lib/api-response";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const experience = await db.experience.findUnique({ where: { id } });
    if (!experience) return error("Experience not found", 404);
    return success(experience);
  } catch (err) {
    return handleError(err);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    if (!session) return error("Unauthorized", 401);

    const { id } = await params;
    const body = await req.json();

    const existing = await db.experience.findUnique({ where: { id } });
    if (!existing) return error("Experience not found", 404);

    const experience = await db.experience.update({
      where: { id },
      data: {
        title: body.title,
        company: body.company,
        location: body.location,
        startDate: body.startDate,
        endDate: body.endDate,
        description: body.description,
        content: body.content,
        type: body.type,
        order: body.order,
        isVisible: body.isVisible,
        technologies: body.technologies ? (typeof body.technologies === "string" ? body.technologies : JSON.stringify(body.technologies)) : undefined,
      },
    });

    return success(experience);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    if (!session) return error("Unauthorized", 401);

    const { id } = await params;
    const existing = await db.experience.findUnique({ where: { id } });
    if (!existing) return error("Experience not found", 404);

    await db.experience.delete({ where: { id } });
    return success({ deleted: true });
  } catch (err) {
    return handleError(err);
  }
}
