import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { hashPassword } from "@/lib/auth-guard";
import { success, error, handleError } from "@/lib/api-response";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    if (!session) return error("Unauthorized", 401);

    const { id } = await params;
    const user = await db.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true, avatar: true, isActive: true, lastLoginAt: true, createdAt: true, updatedAt: true },
    });

    if (!user) return error("User not found", 404);
    return success(user);
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

    const existing = await db.user.findUnique({ where: { id } });
    if (!existing) return error("User not found", 404);

    const updateData: Record<string, unknown> = {
      email: body.email,
      name: body.name,
      role: body.role,
      avatar: body.avatar,
      isActive: body.isActive,
    };

    if (body.password) {
      updateData.password = await hashPassword(body.password);
    }

    const user = await db.user.update({
      where: { id },
      data: updateData,
    });

    const { password: _password, ...userWithoutPassword } = user;
    return success(userWithoutPassword);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    if (!session) return error("Unauthorized", 401);

    const { id } = await params;
    const existing = await db.user.findUnique({ where: { id } });
    if (!existing) return error("User not found", 404);

    await db.user.delete({ where: { id } });
    return success({ deleted: true });
  } catch (err) {
    return handleError(err);
  }
}
