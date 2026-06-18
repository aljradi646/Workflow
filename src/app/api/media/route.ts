import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { success, error, handleError } from "@/lib/api-response";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const THUMB_DIR = path.join(UPLOAD_DIR, "thumbnails");

async function ensureUploadDirs() {
  await mkdir(UPLOAD_DIR, { recursive: true });
  await mkdir(THUMB_DIR, { recursive: true });
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return error("Unauthorized", 401);

    const url = new URL(req.url);
    const folder = url.searchParams.get("folder");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const [media, total] = await Promise.all([
      db.media.findMany({
        where: folder ? { folder } : undefined,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.media.count({ where: folder ? { folder } : undefined }),
    ]);

    return success({ media, total, page, limit });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return error("Unauthorized", 401);

    await ensureUploadDirs();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "general";
    const alt = formData.get("alt") as string | null;
    const caption = formData.get("caption") as string | null;

    if (!file) {
      return error("No file provided");
    }

    const ext = path.extname(file.name) || "";
    const filename = `${uuidv4()}${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await writeFile(filepath, buffer);

    let thumbnailUrl: string | null = null;
    let width: number | null = null;
    let height: number | null = null;

    const isImage = file.type.startsWith("image/");
    if (isImage) {
      try {
        const metadata = await sharp(buffer).metadata();
        width = metadata.width ?? null;
        height = metadata.height ?? null;

        const thumbFilename = `thumb_${filename}`;
        const thumbPath = path.join(THUMB_DIR, thumbFilename);
        await sharp(buffer)
          .resize(300, 300, { fit: "cover" })
          .toFile(thumbPath);
        thumbnailUrl = `/uploads/thumbnails/${thumbFilename}`;
      } catch {
        // Thumbnail generation failed, continue without it
      }
    }

    const media = await db.media.create({
      data: {
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url: `/uploads/${filename}`,
        thumbnailUrl,
        alt,
        caption,
        folder,
        width,
        height,
        uploadedBy: session.user.id,
      },
    });

    return success(media, 201);
  } catch (err) {
    return handleError(err);
  }
}
