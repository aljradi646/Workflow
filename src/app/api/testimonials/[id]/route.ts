import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { success, error, handleError } from "@/lib/api-response";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const testimonial = await db.testimonial.findUnique({ where: { id } });
    if (!testimonial) return error("Testimonial not found", 404);
    return success(testimonial);
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

    const existing = await db.testimonial.findUnique({ where: { id } });
    if (!existing) return error("Testimonial not found", 404);

    const testimonial = await db.testimonial.update({
      where: { id },
      data: {
        name: body.name,
        position: body.position,
        company: body.company,
        content: body.content,
        rating: body.rating,
        avatarUrl: body.avatarUrl,
        link: body.link,
        order: body.order,
        isVisible: body.isVisible,
      },
    });

    return success(testimonial);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    if (!session) return error("Unauthorized", 401);

    const { id } = await params;
    const existing = await db.testimonial.findUnique({ where: { id } });
    if (!existing) return error("Testimonial not found", 404);

    await db.testimonial.delete({ where: { id } });
    return success({ deleted: true });
  } catch (err) {
    return handleError(err);
  }
}
