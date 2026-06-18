import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { success, error, handleError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type");

    const navItems = await db.navigation.findMany({
      where: type ? { type } : undefined,
      orderBy: { order: "asc" },
    });
    return success(navItems);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return error("Unauthorized", 401);

    const body = await req.json();
    const { label, url, icon, order, isVisible, parentId, target, type } = body;

    if (!label) {
      return error("Label is required");
    }

    const nav = await db.navigation.create({
      data: {
        label,
        url,
        icon,
        order: order ?? 0,
        isVisible: isVisible ?? true,
        parentId,
        target: target || "_self",
        type: type || "main",
      },
    });

    return success(nav, 201);
  } catch (err) {
    return handleError(err);
  }
}
