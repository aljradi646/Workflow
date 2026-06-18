import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { success, error, handleError } from "@/lib/api-response";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const post = await db.blogPost.findUnique({ where: { id } });
    if (!post) return error("Blog post not found", 404);
    return success(post);
  } catch (err) {
    return handleError(err);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    if (!session) return error("Unauthorized", 401);

    const { id } = await params;
    const body = await req.json();

    const existing = await db.blogPost.findUnique({ where: { id } });
    if (!existing) return error("Blog post not found", 404);

    const post = await db.blogPost.update({
      where: { id },
      data: {
        title: body.title,
        slug: body.slug,
        excerpt: body.excerpt,
        content: body.content,
        coverImage: body.coverImage,
        category: body.category,
        tags: body.tags ? (typeof body.tags === "string" ? body.tags : JSON.stringify(body.tags)) : undefined,
        status: body.status,
        featured: body.featured,
        readTime: body.readTime,
        seoTitle: body.seoTitle,
        seoDesc: body.seoDesc,
        ogImage: body.ogImage,
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : (body.status === "published" && !existing.publishedAt ? new Date() : undefined),
      },
    });

    return success(post);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin();
    if (!session) return error("Unauthorized", 401);

    const { id } = await params;
    const existing = await db.blogPost.findUnique({ where: { id } });
    if (!existing) return error("Blog post not found", 404);

    await db.blogPost.delete({ where: { id } });
    return success({ deleted: true });
  } catch (err) {
    return handleError(err);
  }
}
