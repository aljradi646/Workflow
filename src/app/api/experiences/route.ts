import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { success, error, handleError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type");

    const experiences = await db.experience.findMany({
      where: type ? { type } : undefined,
      orderBy: { order: "asc" },
    });
    return success(experiences);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return error("Unauthorized", 401);

    const body = await req.json();
    const { title, company, location, startDate, endDate, description, content, type, order, isVisible, technologies } = body;

    if (!title || !company || !startDate) {
      return error("Title, company, and start date are required");
    }

    const experience = await db.experience.create({
      data: {
        title,
        company,
        location,
        startDate,
        endDate,
        description,
        content,
        type: type || "work",
        order: order ?? 0,
        isVisible: isVisible ?? true,
        technologies: technologies ? (typeof technologies === "string" ? technologies : JSON.stringify(technologies)) : undefined,
      },
    });

    return success(experience, 201);
  } catch (err) {
    return handleError(err);
  }
}
