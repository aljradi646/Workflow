import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { success, handleError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category");

    const projects = await db.project.findMany({
      where: {
        status: "published",
        isVisible: true,
        category: category || undefined,
      },
      orderBy: { order: "asc" },
      include: {
        images: {
          orderBy: { order: "asc" },
        },
      },
    });

    // Return raw data with En fields — client-side components handle localization
    return success(projects);
  } catch (err) {
    return handleError(err);
  }
}
