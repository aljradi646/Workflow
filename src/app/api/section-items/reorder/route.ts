import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { success, error, handleError } from "@/lib/api-response";

export async function PUT(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return error("Unauthorized", 401);

    const body = await req.json();
    const { items }: { items: { id: string; order: number }[] } = body;

    if (!Array.isArray(items)) {
      return error("Items array is required");
    }

    await db.$transaction(
      items.map((item) =>
        db.sectionItem.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );

    return success({ reordered: true });
  } catch (err) {
    return handleError(err);
  }
}
