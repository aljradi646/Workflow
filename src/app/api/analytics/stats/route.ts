import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { success, error, handleError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return error("Unauthorized", 401);

    const url = new URL(req.url);
    const period = url.searchParams.get("period") || "7d";

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let startDate: Date;
    let days: number;
    switch (period) {
      case "1d":
        startDate = today;
        days = 1;
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        days = 30;
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        days = 90;
        break;
      default: // 7d
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        days = 7;
        break;
    }

    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalPageViews,
      pageViewsLast30Days,
      pageViewsLast7Days,
      pageViewsToday,
      uniqueVisitors7Days,
      topPages,
      topBrowsers,
      topDevices,
      topCountries,
    ] = await Promise.all([
      db.analyticsEvent.count({ where: { eventType: "page_view" } }),
      db.analyticsEvent.count({ where: { eventType: "page_view", createdAt: { gte: thirtyDaysAgo } } }),
      db.analyticsEvent.count({ where: { eventType: "page_view", createdAt: { gte: sevenDaysAgo } } }),
      db.analyticsEvent.count({ where: { eventType: "page_view", createdAt: { gte: today } } }),
      db.analyticsEvent.findMany({
        where: { eventType: "page_view", createdAt: { gte: sevenDaysAgo }, ipAddress: { not: null } },
        select: { ipAddress: true },
        distinct: ["ipAddress"],
      }).then((r) => r.length),
      db.analyticsEvent.groupBy({
        by: ["page"],
        where: { eventType: "page_view", createdAt: { gte: startDate } },
        _count: { page: true },
        orderBy: { _count: { page: "desc" } },
        take: 10,
      }),
      db.analyticsEvent.groupBy({
        by: ["browser"],
        where: { eventType: "page_view", createdAt: { gte: startDate }, browser: { not: null } },
        _count: { browser: true },
        orderBy: { _count: { browser: "desc" } },
        take: 5,
      }),
      db.analyticsEvent.groupBy({
        by: ["device"],
        where: { eventType: "page_view", createdAt: { gte: startDate }, device: { not: null } },
        _count: { device: true },
        orderBy: { _count: { device: "desc" } },
        take: 5,
      }),
      db.analyticsEvent.groupBy({
        by: ["country"],
        where: { eventType: "page_view", createdAt: { gte: startDate }, country: { not: null } },
        _count: { country: true },
        orderBy: { _count: { country: "desc" } },
        take: 5,
      }),
    ]);

    // Page views by day for the selected period
    const maxDays = Math.min(days, 30); // Cap at 30 to avoid too many queries
    const pageViewsByDay = [];
    for (let i = maxDays - 1; i >= 0; i--) {
      const dayStart = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      const count = await db.analyticsEvent.count({
        where: {
          eventType: "page_view",
          createdAt: { gte: dayStart, lt: dayEnd },
        },
      });
      const dayName = dayStart.toLocaleDateString("ar-SA", { weekday: "short" });
      const dateStr = dayStart.toLocaleDateString("ar-SA", { day: "numeric", month: "short" });
      pageViewsByDay.push({ day: dayName, date: dateStr, views: count, fullDate: dayStart.toISOString() });
    }

    // Sessions by day
    const sessionsByDay = [];
    for (let i = Math.min(maxDays - 1, 13); i >= 0; i--) {
      const dayStart = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      const uniqueSessions = await db.analyticsEvent.findMany({
        where: {
          eventType: "page_view",
          createdAt: { gte: dayStart, lt: dayEnd },
          sessionId: { not: null },
        },
        select: { sessionId: true },
        distinct: ["sessionId"],
      });
      const dayName = dayStart.toLocaleDateString("ar-SA", { weekday: "short" });
      const dateStr = dayStart.toLocaleDateString("ar-SA", { day: "numeric", month: "short" });
      sessionsByDay.push({ day: dayName, date: dateStr, sessions: uniqueSessions.length });
    }

    return success({
      totalPageViews,
      pageViewsLast30Days,
      pageViewsLast7Days,
      pageViewsToday,
      uniqueVisitors7Days,
      topPages,
      topBrowsers,
      topDevices,
      topCountries,
      pageViewsByDay,
      sessionsByDay,
    });
  } catch (err) {
    return handleError(err);
  }
}
