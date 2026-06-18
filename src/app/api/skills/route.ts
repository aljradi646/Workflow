import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { success, error, handleError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category");

    const skills = await db.skill.findMany({
      where: category ? { category } : undefined,
      orderBy: { order: "asc" },
    });
    return success(skills);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return error("Unauthorized", 401);

    const body = await req.json();
    const { name, slug, category, level, icon, iconUrl, color, order, isVisible, featured } = body;

    if (!name || !slug) {
      return error("Name and slug are required");
    }

    const skill = await db.skill.create({
      data: {
        name,
        slug,
        category: category || "general",
        level: level ?? 50,
        icon,
        iconUrl,
        color,
        order: order ?? 0,
        isVisible: isVisible ?? true,
        featured: featured ?? false,
      },
    });

    return success(skill, 201);
  } catch (err) {
    return handleError(err);
  }
}
