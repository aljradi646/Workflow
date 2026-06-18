import { db } from "@/lib/db";
import { success, handleError } from "@/lib/api-response";

export async function GET() {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalVisits,
      visitsToday,
      topPagesRaw,
      deviceBreakdownRaw,
      sessionDurations,
      totalSessions,
      singlePageSessions,
    ] = await Promise.all([
      // Total page views (all time)
      db.analyticsEvent.count({ where: { eventType: "page_view" } }),

      // Page views today
      db.analyticsEvent.count({ where: { eventType: "page_view", createdAt: { gte: today } } }),

      // Top 5 pages (last 7 days)
      db.analyticsEvent.groupBy({
        by: ["page"],
        where: { eventType: "page_view", createdAt: { gte: sevenDaysAgo }, page: { not: null } },
        _count: { page: true },
        orderBy: { _count: { page: "desc" } },
        take: 5,
      }),

      // Device breakdown (last 7 days)
      db.analyticsEvent.groupBy({
        by: ["device"],
        where: { eventType: "page_view", createdAt: { gte: sevenDaysAgo }, device: { not: null } },
        _count: { device: true },
        orderBy: { _count: { device: "desc" } },
        take: 5,
      }),

      // Session durations (last 30 days) - for avg session duration
      db.analyticsEvent.findMany({
        where: {
          eventType: "session_end",
          createdAt: { gte: thirtyDaysAgo },
          duration: { not: null },
        },
        select: { duration: true },
        take: 1000,
      }),

      // Total sessions (last 7 days) - for bounce rate
      db.analyticsEvent.findMany({
        where: { eventType: "page_view", createdAt: { gte: sevenDaysAgo }, sessionId: { not: null } },
        select: { sessionId: true },
        distinct: ["sessionId"],
      }),

      // Sessions with only one page view (bounce) - last 7 days
      db.analyticsEvent.groupBy({
        by: ["sessionId"],
        where: { eventType: "page_view", createdAt: { gte: sevenDaysAgo }, sessionId: { not: null } },
        _count: { sessionId: true },
        having: { sessionId: { _count: { equals: 1 } } },
      }),
    ]);

    // Format top pages
    const topPages = topPagesRaw.map((p) => ({
      page: p.page || "/",
      views: p._count.page,
    }));

    // Format device breakdown
    const deviceBreakdown = deviceBreakdownRaw.map((d) => ({
      device: d.device || "unknown",
      count: d._count.device,
    }));

    // Calculate average session duration
    const durations = sessionDurations
      .map((s) => s.duration)
      .filter((d): d is number => d !== null);
    const avgDuration = durations.length > 0
      ? Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length)
      : 0;

    // Calculate bounce rate
    const totalSessionCount = totalSessions.length;
    const bounceCount = singlePageSessions.length;
    const bounceRate = totalSessionCount > 0
      ? Math.round((bounceCount / totalSessionCount) * 100)
      : 0;

    return success({
      totalVisits,
      visitsToday,
      topPages,
      deviceBreakdown,
      avgDuration,
      bounceRate,
    });
  } catch (err) {
    return handleError(err);
  }
}
