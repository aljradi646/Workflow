import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { success, error, handleError } from "@/lib/api-response";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const edu = await db.education.findUnique({ where: { id } });
    if (!edu) return error("Education not found", 404);
    return success(edu);
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

    const existing = await db.education.findUnique({ where: { id } });
    if (!existing) return error("Education not found", 404);

    const edu = await db.education.update({
      where: { id },
      data: {
        degree: body.degree,
        institution: body.institution,
        location: body.location,
        startDate: body.startDate,
        endDate: body.endDate,
        description: body.description,
        grade: body.grade,
        certificate: body.certificate,
        order: body.order,
        isVisible: body.isVisible,
      },
    });

    return success(edu);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    if (!session) return error("Unauthorized", 401);

    const { id } = await params;
    const existing = await db.education.findUnique({ where: { id } });
    if (!existing) return error("Education not found", 404);

    await db.education.delete({ where: { id } });
    return success({ deleted: true });
  } catch (err) {
    return handleError(err);
  }
}
