import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { success, error, handleError } from "@/lib/api-response";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const section = await db.section.findUnique({
      where: { id },
      include: { items: { orderBy: { order: "asc" } } },
    });
    if (!section) return error("Section not found", 404);
    return success(section);
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

    const existing = await db.section.findUnique({ where: { id } });
    if (!existing) return error("Section not found", 404);

    const section = await db.section.update({
      where: { id },
      data: {
        type: body.type,
        title: body.title,
        subtitle: body.subtitle,
        description: body.description,
        config: body.config ? (typeof body.config === "string" ? body.config : JSON.stringify(body.config)) : undefined,
        content: body.content ? (typeof body.content === "string" ? body.content : JSON.stringify(body.content)) : undefined,
        order: body.order,
        isVisible: body.isVisible,
        layout: body.layout,
        animation: body.animation,
        bgType: body.bgType,
        bgValue: body.bgValue,
        customClass: body.customClass,
        parentId: body.parentId,
      },
    });

    return success(section);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    if (!session) return error("Unauthorized", 401);

    const { id } = await params;
    const existing = await db.section.findUnique({ where: { id } });
    if (!existing) return error("Section not found", 404);

    await db.section.delete({ where: { id } });
    return success({ deleted: true });
  } catch (err) {
    return handleError(err);
  }
}
