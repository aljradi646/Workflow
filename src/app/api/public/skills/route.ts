import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { success, handleError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category");

    const skills = await db.skill.findMany({
      where: {
        isVisible: true,
        category: category || undefined,
      },
      orderBy: { order: "asc" },
    });

    return success(skills);
  } catch (err) {
    return handleError(err);
  }
}
