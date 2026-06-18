import { db } from "@/lib/db";
import { success, handleError } from "@/lib/api-response";

export async function GET() {
  try {
    const education = await db.education.findMany({
      where: { isVisible: true },
      orderBy: { order: "asc" },
    });

    return success(education);
  } catch (err) {
    return handleError(err);
  }
}
