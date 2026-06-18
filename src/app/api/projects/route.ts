import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { success, error, handleError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category");
    const status = url.searchParams.get("status");
    const featured = url.searchParams.get("featured");

    const projects = await db.project.findMany({
      where: {
        category: category || undefined,
        status: status || undefined,
        featured: featured === "true" ? true : featured === "false" ? false : undefined,
      },
      orderBy: { order: "asc" },
      include: { images: { orderBy: { order: "asc" } } },
    });

    return success(projects);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return error("Unauthorized", 401);

    const body = await req.json();
    const { title, slug, description, content, category, status, featured, startDate, endDate, clientName, demoUrl, repoUrl, technologies, order, isVisible, seoTitle, seoDesc, ogImage } = body;

    if (!title || !slug || !description) {
      return error("Title, slug, and description are required");
    }

    const project = await db.project.create({
      data: {
        title,
        slug,
        description,
        content,
        category,
        status: status || "published",
        featured: featured ?? false,
        startDate,
        endDate,
        clientName,
        demoUrl,
        repoUrl,
        technologies: technologies ? (typeof technologies === "string" ? technologies : JSON.stringify(technologies)) : undefined,
        order: order ?? 0,
        isVisible: isVisible ?? true,
        seoTitle,
        seoDesc,
        ogImage,
      },
    });

    return success(project, 201);
  } catch (err) {
    return handleError(err);
  }
}
