import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { success, error, handleError } from "@/lib/api-response";

export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) return error("Unauthorized", 401);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    const [
      projectCount,
      blogCount,
      serviceCount,
      skillCount,
      testimonialCount,
      experienceCount,
      educationCount,
      contactMessageCount,
      unreadMessages,
      mediaCount,
      pageCountViews,
      todayPageViews,
      yesterdayPageViews,
      weekPageViews,
    ] = await Promise.all([
      db.project.count(),
      db.blogPost.count(),
      db.service.count(),
      db.skill.count(),
      db.testimonial.count(),
      db.experience.count(),
      db.education.count(),
      db.contactMessage.count(),
      db.contactMessage.count({ where: { isRead: false } }),
      db.media.count(),
      db.analyticsEvent.count({ where: { eventType: "page_view" } }),
      db.analyticsEvent.count({
        where: {
          eventType: "page_view",
          createdAt: { gte: today },
        },
      }),
      db.analyticsEvent.count({
        where: {
          eventType: "page_view",
          createdAt: { gte: yesterday, lt: today },
        },
      }),
      db.analyticsEvent.count({
        where: {
          eventType: "page_view",
          createdAt: { gte: sevenDaysAgo },
        },
      }),
    ]);

    // Page views over last 7 days (by day)
    const pageViewsByDay = [];
    for (let i = 6; i >= 0; i--) {
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
      pageViewsByDay.push({ day: dayName, date: dateStr, views: count });
    }

    // Recent activity
    const recentActivity = await db.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    });

    // Recent messages
    const recentMessages = await db.contactMessage.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    // Recent projects
    const recentProjects = await db.project.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      include: { images: { where: { isFeatured: true }, take: 1 } },
    });

    return success({
      counts: {
        projects: projectCount,
        blogPosts: blogCount,
        services: serviceCount,
        skills: skillCount,
        testimonials: testimonialCount,
        experiences: experienceCount,
        education: educationCount,
        contactMessages: contactMessageCount,
        unreadMessages,
        media: mediaCount,
      },
      analytics: {
        totalPageViews: pageCountViews,
        todayPageViews,
        yesterdayPageViews,
        weekPageViews,
        pageViewsByDay,
      },
      recentActivity,
      recentMessages,
      recentProjects,
    });
  } catch (err) {
    return handleError(err);
  }
}
