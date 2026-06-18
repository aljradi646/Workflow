import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { success, error, handleError } from "@/lib/api-response";

export async function GET() {
  try {
    const links = await db.socialLink.findMany({ orderBy: { order: "asc" } });
    return success(links);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return error("Unauthorized", 401);

    const body = await req.json();
    const { platform, url, icon, order, isVisible } = body;

    if (!platform || !url) {
      return error("Platform and URL are required");
    }

    const link = await db.socialLink.create({
      data: {
        platform,
        url,
        icon,
        order: order ?? 0,
        isVisible: isVisible ?? true,
      },
    });

    return success(link, 201);
  } catch (err) {
    return handleError(err);
  }
}
