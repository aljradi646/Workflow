import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { success, error, handleError } from "@/lib/api-response";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const skill = await db.skill.findUnique({ where: { id } });
    if (!skill) return error("Skill not found", 404);
    return success(skill);
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

    const existing = await db.skill.findUnique({ where: { id } });
    if (!existing) return error("Skill not found", 404);

    const skill = await db.skill.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug,
        category: body.category,
        level: body.level,
        icon: body.icon,
        iconUrl: body.iconUrl,
        color: body.color,
        order: body.order,
        isVisible: body.isVisible,
        featured: body.featured,
      },
    });

    return success(skill);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    if (!session) return error("Unauthorized", 401);

    const { id } = await params;
    const existing = await db.skill.findUnique({ where: { id } });
    if (!existing) return error("Skill not found", 404);

    await db.skill.delete({ where: { id } });
    return success({ deleted: true });
  } catch (err) {
    return handleError(err);
  }
}
