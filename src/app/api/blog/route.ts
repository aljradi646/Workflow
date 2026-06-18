import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { success, error, handleError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category");
    const status = url.searchParams.get("status");

    const posts = await db.blogPost.findMany({
      where: {
        category: category || undefined,
        status: status || undefined,
      },
      orderBy: { createdAt: "desc" },
    });

    return success(posts);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return error("Unauthorized", 401);

    const body = await req.json();
    const { title, slug, excerpt, content, coverImage, category, tags, status, featured, readTime, seoTitle, seoDesc, ogImage, publishedAt } = body;

    if (!title || !slug || !content) {
      return error("Title, slug, and content are required");
    }

    const post = await db.blogPost.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        coverImage,
        category,
        tags: tags ? (typeof tags === "string" ? tags : JSON.stringify(tags)) : undefined,
        status: status || "draft",
        featured: featured ?? false,
        readTime,
        seoTitle,
        seoDesc,
        ogImage,
        publishedAt: publishedAt ? new Date(publishedAt) : (status === "published" ? new Date() : undefined),
      },
    });

    return success(post, 201);
  } catch (err) {
    return handleError(err);
  }
}
