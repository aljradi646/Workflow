import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { success, handleError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type");

    const experiences = await db.experience.findMany({
      where: {
        isVisible: true,
        type: type || undefined,
      },
      orderBy: { order: "asc" },
    });

    return success(experiences);
  } catch (err) {
    return handleError(err);
  }
}
