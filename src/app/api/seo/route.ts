import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { success, error, handleError } from "@/lib/api-response";

export async function GET() {
  try {
    const seoSettings = await db.sEOSetting.findMany({ orderBy: { page: "asc" } });
    return success(seoSettings);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return error("Unauthorized", 401);

    const body = await req.json();
    const { page, title, description, keywords, ogTitle, ogDesc, ogImage, ogType, canonical, robots, structured } = body;

    if (!page) {
      return error("Page is required");
    }

    const seo = await db.sEOSetting.upsert({
      where: { page },
      update: {
        title,
        description,
        keywords: keywords ? (typeof keywords === "string" ? keywords : JSON.stringify(keywords)) : undefined,
        ogTitle,
        ogDesc,
        ogImage,
        ogType,
        canonical,
        robots,
        structured: structured ? (typeof structured === "string" ? structured : JSON.stringify(structured)) : undefined,
      },
      create: {
        page,
        title,
        description,
        keywords: keywords ? (typeof keywords === "string" ? keywords : JSON.stringify(keywords)) : undefined,
        ogTitle,
        ogDesc,
        ogImage,
        ogType,
        canonical,
        robots,
        structured: structured ? (typeof structured === "string" ? structured : JSON.stringify(structured)) : undefined,
      },
    });

    return success(seo, 201);
  } catch (err) {
    return handleError(err);
  }
}
