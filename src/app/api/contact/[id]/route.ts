import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { success, error, handleError } from "@/lib/api-response";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    if (!session) return error("Unauthorized", 401);

    const { id } = await params;
    const msg = await db.contactMessage.findUnique({ where: { id } });
    if (!msg) return error("Contact message not found", 404);
    return success(msg);
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

    const existing = await db.contactMessage.findUnique({ where: { id } });
    if (!existing) return error("Contact message not found", 404);

    const msg = await db.contactMessage.update({
      where: { id },
      data: {
        isRead: body.isRead,
        isReplied: body.isReplied,
        repliedAt: body.isReplied && !existing.isReplied ? new Date() : undefined,
      },
    });

    return success(msg);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    if (!session) return error("Unauthorized", 401);

    const { id } = await params;
    const existing = await db.contactMessage.findUnique({ where: { id } });
    if (!existing) return error("Contact message not found", 404);

    await db.contactMessage.delete({ where: { id } });
    return success({ deleted: true });
  } catch (err) {
    return handleError(err);
  }
}
