import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { success, error, handleError } from "@/lib/api-response";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const project = await db.project.findUnique({
      where: { id },
      include: { images: { orderBy: { order: "asc" } } },
    });
    if (!project) return error("Project not found", 404);
    return success(project);
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

    const existing = await db.project.findUnique({ where: { id } });
    if (!existing) return error("Project not found", 404);

    const project = await db.project.update({
      where: { id },
      data: {
        title: body.title,
        slug: body.slug,
        description: body.description,
        content: body.content,
        category: body.category,
        status: body.status,
        featured: body.featured,
        startDate: body.startDate,
        endDate: body.endDate,
        clientName: body.clientName,
        demoUrl: body.demoUrl,
        repoUrl: body.repoUrl,
        technologies: body.technologies ? (typeof body.technologies === "string" ? body.technologies : JSON.stringify(body.technologies)) : undefined,
        order: body.order,
        isVisible: body.isVisible,
        seoTitle: body.seoTitle,
        seoDesc: body.seoDesc,
        ogImage: body.ogImage,
      },
    });

    return success(project);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    if (!session) return error("Unauthorized", 401);

    const { id } = await params;
    const existing = await db.project.findUnique({ where: { id } });
    if (!existing) return error("Project not found", 404);

    await db.project.delete({ where: { id } });
    return success({ deleted: true });
  } catch (err) {
    return handleError(err);
  }
}
