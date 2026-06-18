import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { success, error, handleError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const sectionId = url.searchParams.get("sectionId");

    const items = await db.sectionItem.findMany({
      where: sectionId ? { sectionId } : undefined,
      orderBy: { order: "asc" },
    });
    return success(items);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return error("Unauthorized", 401);

    const body = await req.json();
    const { sectionId, type, title, subtitle, description, content, imageUrl, icon, link, linkText, order, isVisible, config, tags, startDate, endDate, rating } = body;

    if (!sectionId || !type) {
      return error("Section ID and type are required");
    }

    const section = await db.section.findUnique({ where: { id: sectionId } });
    if (!section) return error("Section not found", 404);

    const maxOrder = await db.sectionItem.aggregate({ where: { sectionId }, _max: { order: true } });

    const item = await db.sectionItem.create({
      data: {
        sectionId,
        type,
        title,
        subtitle,
        description,
        content: content ? (typeof content === "string" ? content : JSON.stringify(content)) : "{}",
        imageUrl,
        icon,
        link,
        linkText,
        order: order ?? (maxOrder._max.order ?? 0) + 1,
        isVisible: isVisible ?? true,
        config: config ? (typeof config === "string" ? config : JSON.stringify(config)) : "{}",
        tags: tags ? (typeof tags === "string" ? tags : JSON.stringify(tags)) : undefined,
        startDate,
        endDate,
        rating,
      },
    });

    return success(item, 201);
  } catch (err) {
    return handleError(err);
  }
}
