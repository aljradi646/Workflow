import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { success, error, handleError } from "@/lib/api-response";

export async function GET() {
  try {
    const services = await db.service.findMany({ orderBy: { order: "asc" } });
    return success(services);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return error("Unauthorized", 401);

    const body = await req.json();
    const { title, slug, description, content, icon, imageUrl, features, price, order, isVisible } = body;

    if (!title || !slug || !description) {
      return error("Title, slug, and description are required");
    }

    const service = await db.service.create({
      data: {
        title,
        slug,
        description,
        content,
        icon,
        imageUrl,
        features: features ? (typeof features === "string" ? features : JSON.stringify(features)) : undefined,
        price,
        order: order ?? 0,
        isVisible: isVisible ?? true,
      },
    });

    return success(service, 201);
  } catch (err) {
    return handleError(err);
  }
}
