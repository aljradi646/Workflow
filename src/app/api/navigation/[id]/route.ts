import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { success, error, handleError } from "@/lib/api-response";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const nav = await db.navigation.findUnique({ where: { id }, include: { children: { orderBy: { order: "asc" } } } });
    if (!nav) return error("Navigation item not found", 404);
    return success(nav);
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

    const existing = await db.navigation.findUnique({ where: { id } });
    if (!existing) return error("Navigation item not found", 404);

    const nav = await db.navigation.update({
      where: { id },
      data: {
        label: body.label,
        url: body.url,
        icon: body.icon,
        order: body.order,
        isVisible: body.isVisible,
        parentId: body.parentId,
        target: body.target,
        type: body.type,
      },
    });

    return success(nav);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    if (!session) return error("Unauthorized", 401);

    const { id } = await params;
    const existing = await db.navigation.findUnique({ where: { id } });
    if (!existing) return error("Navigation item not found", 404);

    await db.navigation.delete({ where: { id } });
    return success({ deleted: true });
  } catch (err) {
    return handleError(err);
  }
}
