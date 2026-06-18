import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { success, error, handleError } from "@/lib/api-response";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const service = await db.service.findUnique({ where: { id } });
    if (!service) return error("Service not found", 404);
    return success(service);
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

    const existing = await db.service.findUnique({ where: { id } });
    if (!existing) return error("Service not found", 404);

    const service = await db.service.update({
      where: { id },
      data: {
        title: body.title,
        slug: body.slug,
        description: body.description,
        content: body.content,
        icon: body.icon,
        imageUrl: body.imageUrl,
        features: body.features ? (typeof body.features === "string" ? body.features : JSON.stringify(body.features)) : undefined,
        price: body.price,
        order: body.order,
        isVisible: body.isVisible,
      },
    });

    return success(service);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    if (!session) return error("Unauthorized", 401);

    const { id } = await params;
    const existing = await db.service.findUnique({ where: { id } });
    if (!existing) return error("Service not found", 404);

    await db.service.delete({ where: { id } });
    return success({ deleted: true });
  } catch (err) {
    return handleError(err);
  }
}
