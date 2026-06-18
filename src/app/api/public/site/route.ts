import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { success, handleError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const [settings, sections, navigation, socialLinks, theme, seoSettings, fonts] = await Promise.all([
      db.siteSetting.findMany({ orderBy: { key: "asc" } }),
      db.section.findMany({
        where: { isVisible: true },
        orderBy: { order: "asc" },
        include: { items: { where: { isVisible: true }, orderBy: { order: "asc" } } },
      }),
      db.navigation.findMany({
        where: { isVisible: true, type: "main" },
        orderBy: { order: "asc" },
      }),
      db.socialLink.findMany({
        where: { isVisible: true },
        orderBy: { order: "asc" },
      }),
      db.theme.findFirst({ where: { isActive: true } }),
      db.sEOSetting.findMany(),
      db.font.findMany({ where: { isActive: true } }),
    ]);

    // Convert settings array to key-value object
    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }

    // Return raw data with En fields — client-side components handle localization
    return success({
      settings: settingsMap,
      sections,
      navigation,
      socialLinks,
      theme,
      seoSettings,
      fonts,
    });
  } catch (err) {
    return handleError(err);
  }
}
