import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { success, error, handleError } from "@/lib/api-response";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const item = await db.sectionItem.findUnique({ where: { id } });
    if (!item) return error("Section item not found", 404);
    return success(item);
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

    const existing = await db.sectionItem.findUnique({ where: { id } });
    if (!existing) return error("Section item not found", 404);

    const item = await db.sectionItem.update({
      where: { id },
      data: {
        type: body.type,
        title: body.title,
        subtitle: body.subtitle,
        description: body.description,
        content: body.content ? (typeof body.content === "string" ? body.content : JSON.stringify(body.content)) : undefined,
        imageUrl: body.imageUrl,
        icon: body.icon,
        link: body.link,
        linkText: body.linkText,
        order: body.order,
        isVisible: body.isVisible,
        config: body.config ? (typeof body.config === "string" ? body.config : JSON.stringify(body.config)) : undefined,
        tags: body.tags ? (typeof body.tags === "string" ? body.tags : JSON.stringify(body.tags)) : undefined,
        startDate: body.startDate,
        endDate: body.endDate,
        rating: body.rating,
      },
    });

    return success(item);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    if (!session) return error("Unauthorized", 401);

    const { id } = await params;
    const existing = await db.sectionItem.findUnique({ where: { id } });
    if (!existing) return error("Section item not found", 404);

    await db.sectionItem.delete({ where: { id } });
    return success({ deleted: true });
  } catch (err) {
    return handleError(err);
  }
}
