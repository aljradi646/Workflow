import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { success, error, handleError } from "@/lib/api-response";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const font = await db.font.findUnique({ where: { id } });
    if (!font) return error("Font not found", 404);
    return success(font);
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

    const existing = await db.font.findUnique({ where: { id } });
    if (!existing) return error("Font not found", 404);

    const font = await db.font.update({
      where: { id },
      data: {
        name: body.name,
        family: body.family,
        source: body.source,
        url: body.url,
        weights: body.weights ? (typeof body.weights === "string" ? body.weights : JSON.stringify(body.weights)) : undefined,
        subsets: body.subsets ? (typeof body.subsets === "string" ? body.subsets : JSON.stringify(body.subsets)) : undefined,
        category: body.category,
        isActive: body.isActive,
        usage: body.usage,
      },
    });

    return success(font);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    if (!session) return error("Unauthorized", 401);

    const { id } = await params;
    const existing = await db.font.findUnique({ where: { id } });
    if (!existing) return error("Font not found", 404);

    await db.font.delete({ where: { id } });
    return success({ deleted: true });
  } catch (err) {
    return handleError(err);
  }
}
