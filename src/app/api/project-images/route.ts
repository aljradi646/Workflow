import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { success, error, handleError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return error("Unauthorized", 401);

    const body = await req.json();
    const { projectId, url, alt, caption, order, isFeatured } = body;

    if (!projectId || !url) {
      return error("Project ID and URL are required");
    }

    const project = await db.project.findUnique({ where: { id: projectId } });
    if (!project) return error("Project not found", 404);

    const maxOrder = await db.projectImage.aggregate({ where: { projectId }, _max: { order: true } });

    const image = await db.projectImage.create({
      data: {
        projectId,
        url,
        alt,
        caption,
        order: order ?? (maxOrder._max.order ?? 0) + 1,
        isFeatured: isFeatured ?? false,
      },
    });

    return success(image, 201);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return error("Unauthorized", 401);

    const body = await req.json();
    const { id } = body;

    if (!id) return error("Image ID is required");

    const existing = await db.projectImage.findUnique({ where: { id } });
    if (!existing) return error("Image not found", 404);

    await db.projectImage.delete({ where: { id } });
    return success({ deleted: true });
  } catch (err) {
    return handleError(err);
  }
}
