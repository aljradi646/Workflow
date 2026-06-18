import { db } from "@/lib/db";
import { success, error, handleError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth-guard";

export async function GET() {
  try {
    const activeTheme = await db.theme.findFirst({ where: { isActive: true } });
    if (!activeTheme) return error("No active theme found", 404);
    return success(activeTheme);
  } catch (err) {
    return handleError(err);
  }
}

export async function PUT(req: Request) {
  try {
    const session = await requireAdmin();
    if (!session) return error("Unauthorized", 401);

    const body = await req.json();
    const { id } = body;

    if (!id) return error("Theme ID is required");

    const theme = await db.theme.findUnique({ where: { id } });
    if (!theme) return error("Theme not found", 404);

    // Deactivate all themes
    await db.theme.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    // Activate the specified theme
    const activated = await db.theme.update({
      where: { id },
      data: { isActive: true },
    });

    return success(activated);
  } catch (err) {
    return handleError(err);
  }
}
