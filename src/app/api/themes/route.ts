import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { success, error, handleError } from "@/lib/api-response";

export async function GET() {
  try {
    const themes = await db.theme.findMany({ orderBy: { createdAt: "desc" } });
    return success(themes);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return error("Unauthorized", 401);

    const body = await req.json();
    const { name, isDefault, isActive, mode, colors, fonts, spacing, borderRadius, customCSS } = body;

    if (!name) {
      return error("Name is required");
    }

    const theme = await db.theme.create({
      data: {
        name,
        isDefault: isDefault ?? false,
        isActive: isActive ?? false,
        mode: mode || "light",
        colors: colors ? (typeof colors === "string" ? colors : JSON.stringify(colors)) : "{}",
        fonts: fonts ? (typeof fonts === "string" ? fonts : JSON.stringify(fonts)) : "{}",
        spacing: spacing ? (typeof spacing === "string" ? spacing : JSON.stringify(spacing)) : "{}",
        borderRadius: borderRadius || "0.625rem",
        customCSS,
      },
    });

    // If this is set as active, deactivate others
    if (theme.isActive) {
      await db.theme.updateMany({
        where: { id: { not: theme.id }, isActive: true },
        data: { isActive: false },
      });
    }

    return success(theme, 201);
  } catch (err) {
    return handleError(err);
  }
}
