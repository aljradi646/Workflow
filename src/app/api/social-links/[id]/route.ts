import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { success, error, handleError } from "@/lib/api-response";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const link = await db.socialLink.findUnique({ where: { id } });
    if (!link) return error("Social link not found", 404);
    return success(link);
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

    const existing = await db.socialLink.findUnique({ where: { id } });
    if (!existing) return error("Social link not found", 404);

    const link = await db.socialLink.update({
      where: { id },
      data: {
        platform: body.platform,
        url: body.url,
        icon: body.icon,
        order: body.order,
        isVisible: body.isVisible,
      },
    });

    return success(link);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    if (!session) return error("Unauthorized", 401);

    const { id } = await params;
    const existing = await db.socialLink.findUnique({ where: { id } });
    if (!existing) return error("Social link not found", 404);

    await db.socialLink.delete({ where: { id } });
    return success({ deleted: true });
  } catch (err) {
    return handleError(err);
  }
}
