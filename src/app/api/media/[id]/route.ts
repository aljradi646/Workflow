import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { success, error, handleError } from "@/lib/api-response";
import { unlink } from "fs/promises";
import path from "path";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const media = await db.media.findUnique({ where: { id } });
    if (!media) return error("Media not found", 404);
    return success(media);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    if (!session) return error("Unauthorized", 401);

    const { id } = await params;
    const media = await db.media.findUnique({ where: { id } });
    if (!media) return error("Media not found", 404);

    // Delete files from disk
    try {
      const filepath = path.join(process.cwd(), "public", media.url);
      await unlink(filepath);
    } catch {
      // File may not exist on disk
    }

    if (media.thumbnailUrl) {
      try {
        const thumbpath = path.join(process.cwd(), "public", media.thumbnailUrl);
        await unlink(thumbpath);
      } catch {
        // Thumbnail may not exist on disk
      }
    }

    await db.media.delete({ where: { id } });
    return success({ deleted: true });
  } catch (err) {
    return handleError(err);
  }
}
