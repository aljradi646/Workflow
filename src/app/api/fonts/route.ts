import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { success, error, handleError } from "@/lib/api-response";

export async function GET() {
  try {
    const fonts = await db.font.findMany({ orderBy: { createdAt: "asc" } });
    return success(fonts);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return error("Unauthorized", 401);

    const body = await req.json();
    const { name, family, source, url, weights, subsets, category, isActive, usage } = body;

    if (!name || !family) {
      return error("Name and family are required");
    }

    const font = await db.font.create({
      data: {
        name,
        family,
        source: source || "google",
        url,
        weights: weights ? (typeof weights === "string" ? weights : JSON.stringify(weights)) : undefined,
        subsets: subsets ? (typeof subsets === "string" ? subsets : JSON.stringify(subsets)) : undefined,
        category: category || "sans",
        isActive: isActive ?? true,
        usage: usage || "body",
      },
    });

    return success(font, 201);
  } catch (err) {
    return handleError(err);
  }
}
