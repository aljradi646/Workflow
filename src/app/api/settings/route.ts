import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { success, error, handleError } from "@/lib/api-response";

export async function GET() {
  try {
    const settings = await db.siteSetting.findMany({ orderBy: { key: "asc" } });
    return success(settings);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return error("Unauthorized", 401);

    const body = await req.json();
    const { key, value, type, group, label, description } = body;

    if (!key || value === undefined) {
      return error("Key and value are required");
    }

    const setting = await db.siteSetting.upsert({
      where: { key },
      update: { value: String(value), type, group, label, description },
      create: { key, value: String(value), type: type || "text", group: group || "general", label, description },
    });

    return success(setting, 201);
  } catch (err) {
    return handleError(err);
  }
}
