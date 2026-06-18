import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { success, error, handleError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category");

    const faqs = await db.fAQ.findMany({
      where: category ? { category } : undefined,
      orderBy: { order: "asc" },
    });
    return success(faqs);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return error("Unauthorized", 401);

    const body = await req.json();
    const { question, answer, category, order, isVisible } = body;

    if (!question || !answer) {
      return error("Question and answer are required");
    }

    const faq = await db.fAQ.create({
      data: {
        question,
        answer,
        category,
        order: order ?? 0,
        isVisible: isVisible ?? true,
      },
    });

    return success(faq, 201);
  } catch (err) {
    return handleError(err);
  }
}
