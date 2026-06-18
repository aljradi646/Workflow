import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { success, error, handleError } from "@/lib/api-response";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const faq = await db.fAQ.findUnique({ where: { id } });
    if (!faq) return error("FAQ not found", 404);
    return success(faq);
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

    const existing = await db.fAQ.findUnique({ where: { id } });
    if (!existing) return error("FAQ not found", 404);

    const faq = await db.fAQ.update({
      where: { id },
      data: {
        question: body.question,
        answer: body.answer,
        category: body.category,
        order: body.order,
        isVisible: body.isVisible,
      },
    });

    return success(faq);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    if (!session) return error("Unauthorized", 401);

    const { id } = await params;
    const existing = await db.fAQ.findUnique({ where: { id } });
    if (!existing) return error("FAQ not found", 404);

    await db.fAQ.delete({ where: { id } });
    return success({ deleted: true });
  } catch (err) {
    return handleError(err);
  }
}
