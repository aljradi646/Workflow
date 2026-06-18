import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { success, error, handleError } from "@/lib/api-response";

export async function GET() {
  try {
    const testimonials = await db.testimonial.findMany({ orderBy: { order: "asc" } });
    return success(testimonials);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return error("Unauthorized", 401);

    const body = await req.json();
    const { name, position, company, content, rating, avatarUrl, link, order, isVisible } = body;

    if (!name || !content) {
      return error("Name and content are required");
    }

    const testimonial = await db.testimonial.create({
      data: {
        name,
        position,
        company,
        content,
        rating: rating ?? 5,
        avatarUrl,
        link,
        order: order ?? 0,
        isVisible: isVisible ?? true,
      },
    });

    return success(testimonial, 201);
  } catch (err) {
    return handleError(err);
  }
}
