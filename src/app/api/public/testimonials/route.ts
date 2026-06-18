import { db } from "@/lib/db";
import { success, handleError } from "@/lib/api-response";

export async function GET() {
  try {
    const testimonials = await db.testimonial.findMany({
      where: { isVisible: true },
      orderBy: { order: "asc" },
    });

    return success(testimonials);
  } catch (err) {
    return handleError(err);
  }
}
