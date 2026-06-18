import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { success, error, handleError } from "@/lib/api-response";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ page: string }> }) {
  try {
    const { page } = await params;
    const seo = await db.sEOSetting.findUnique({ where: { page } });
    if (!seo) return error("SEO settings not found for this page", 404);
    return success(seo);
  } catch (err) {
    return handleError(err);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ page: string }> }) {
  try {
    const session = await requireAdmin();
    if (!session) return error("Unauthorized", 401);

    const { page } = await params;
    const body = await req.json();

    const existing = await db.sEOSetting.findUnique({ where: { page } });
    if (!existing) return error("SEO settings not found for this page", 404);

    const seo = await db.sEOSetting.update({
      where: { page },
      data: {
        title: body.title,
        description: body.description,
        keywords: body.keywords ? (typeof body.keywords === "string" ? body.keywords : JSON.stringify(body.keywords)) : undefined,
        ogTitle: body.ogTitle,
        ogDesc: body.ogDesc,
        ogImage: body.ogImage,
        ogType: body.ogType,
        canonical: body.canonical,
        robots: body.robots,
        structured: body.structured ? (typeof body.structured === "string" ? body.structured : JSON.stringify(body.structured)) : undefined,
      },
    });

    return success(seo);
  } catch (err) {
    return handleError(err);
  }
}
