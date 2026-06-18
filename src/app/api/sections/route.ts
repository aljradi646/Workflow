import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { success, error, handleError } from "@/lib/api-response";

export async function GET() {
  try {
    const sections = await db.section.findMany({
      orderBy: { order: "asc" },
      include: { items: { orderBy: { order: "asc" } } },
    });
    return success(sections);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return error("Unauthorized", 401);

    const body = await req.json();
    const { type, title, subtitle, description, config, content, order, isVisible, layout, animation, bgType, bgValue, customClass, parentId } = body;

    if (!type || !title) {
      return error("Type and title are required");
    }

    const maxOrder = await db.section.aggregate({ _max: { order: true } });
    const section = await db.section.create({
      data: {
        type,
        title,
        subtitle,
        description,
        config: config ? JSON.stringify(config) : "{}",
        content: content ? JSON.stringify(content) : "{}",
        order: order ?? (maxOrder._max.order ?? 0) + 1,
        isVisible: isVisible ?? true,
        layout: layout || "default",
        animation: animation || "fade",
        bgType: bgType || "default",
        bgValue,
        customClass,
        parentId,
      },
    });

    return success(section, 201);
  } catch (err) {
    return handleError(err);
  }
}
