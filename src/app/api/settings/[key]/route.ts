import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { success, error, handleError } from "@/lib/api-response";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  try {
    const { key } = await params;
    const setting = await db.siteSetting.findUnique({ where: { key } });
    if (!setting) return error("Setting not found", 404);
    return success(setting);
  } catch (err) {
    return handleError(err);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  try {
    const session = await requireAdmin();
    if (!session) return error("Unauthorized", 401);

    const { key } = await params;
    const body = await req.json();

    const existing = await db.siteSetting.findUnique({ where: { key } });
    if (!existing) return error("Setting not found", 404);

    const setting = await db.siteSetting.update({
      where: { key },
      data: {
        value: body.value !== undefined ? String(body.value) : undefined,
        type: body.type,
        group: body.group,
        label: body.label,
        description: body.description,
      },
    });

    return success(setting);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  try {
    const session = await requireAdmin();
    if (!session) return error("Unauthorized", 401);

    const { key } = await params;
    const existing = await db.siteSetting.findUnique({ where: { key } });
    if (!existing) return error("Setting not found", 404);

    await db.siteSetting.delete({ where: { key } });
    return success({ deleted: true });
  } catch (err) {
    return handleError(err);
  }
}
