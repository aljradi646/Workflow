import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { success, handleError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category");

    const posts = await db.blogPost.findMany({
      where: {
        status: "published",
        category: category || undefined,
        publishedAt: { lte: new Date() },
      },
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        category: true,
        tags: true,
        featured: true,
        readTime: true,
        publishedAt: true,
        createdAt: true,
      },
    });

    return success(posts);
  } catch (err) {
    return handleError(err);
  }
}
