import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { success, error, handleError } from "@/lib/api-response";

export async function GET() {
  try {
    const education = await db.education.findMany({ orderBy: { order: "asc" } });
    return success(education);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return error("Unauthorized", 401);

    const body = await req.json();
    const { degree, institution, location, startDate, endDate, description, grade, certificate, order, isVisible } = body;

    if (!degree || !institution || !startDate) {
      return error("Degree, institution, and start date are required");
    }

    const edu = await db.education.create({
      data: {
        degree,
        institution,
        location,
        startDate,
        endDate,
        description,
        grade,
        certificate,
        order: order ?? 0,
        isVisible: isVisible ?? true,
      },
    });

    return success(edu, 201);
  } catch (err) {
    return handleError(err);
  }
}
