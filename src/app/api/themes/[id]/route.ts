import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { success, error, handleError } from "@/lib/api-response";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const theme = await db.theme.findUnique({ where: { id } });
    if (!theme) return error("Theme not found", 404);
    return success(theme);
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

    const existing = await db.theme.findUnique({ where: { id } });
    if (!existing) return error("Theme not found", 404);

    const theme = await db.theme.update({
      where: { id },
      data: {
        name: body.name,
        isDefault: body.isDefault,
        isActive: body.isActive,
        mode: body.mode,
        colors: body.colors ? (typeof body.colors === "string" ? body.colors : JSON.stringify(body.colors)) : undefined,
        fonts: body.fonts ? (typeof body.fonts === "string" ? body.fonts : JSON.stringify(body.fonts)) : undefined,
        spacing: body.spacing ? (typeof body.spacing === "string" ? body.spacing : JSON.stringify(body.spacing)) : undefined,
        borderRadius: body.borderRadius,
        customCSS: body.customCSS,
      },
    });

    // If set as active, deactivate others
    if (body.isActive) {
      await db.theme.updateMany({
        where: { id: { not: id }, isActive: true },
        data: { isActive: false },
      });
    }

    return success(theme);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    if (!session) return error("Unauthorized", 401);

    const { id } = await params;
    const existing = await db.theme.findUnique({ where: { id } });
    if (!existing) return error("Theme not found", 404);

    await db.theme.delete({ where: { id } });
    return success({ deleted: true });
  } catch (err) {
    return handleError(err);
  }
}
