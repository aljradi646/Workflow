import { db } from "@/lib/db";
import { success, handleError } from "@/lib/api-response";

export async function GET() {
  try {
    // Fetch all resume data in parallel
    const [
      settings,
      skills,
      experiences,
      education,
      projects,
      socialLinks,
      resumes,
    ] = await Promise.all([
      db.siteSetting.findMany({ orderBy: { key: "asc" } }),
      db.skill.findMany({
        where: { isVisible: true },
        orderBy: { order: "asc" },
      }),
      db.experience.findMany({
        where: { isVisible: true },
        orderBy: { order: "asc" },
      }),
      db.education.findMany({
        where: { isVisible: true },
        orderBy: { order: "asc" },
      }),
      db.project.findMany({
        where: { isVisible: true, status: "published" },
        orderBy: { order: "asc" },
        include: { images: { where: { isFeatured: true }, take: 1 } },
      }),
      db.socialLink.findMany({
        where: { isVisible: true },
        orderBy: { order: "asc" },
      }),
      db.resume.findMany({
        where: { isVisible: true },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // Convert settings to key-value map
    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }

    // Group skills by category
    const skillsByCategory: Record<string, typeof skills> = {};
    for (const skill of skills) {
      const cat = skill.category || "general";
      if (!skillsByCategory[cat]) skillsByCategory[cat] = [];
      skillsByCategory[cat].push(skill);
    }

    // Build structured resume data
    const resumeData = {
      personalInfo: {
        name: settingsMap.owner_name || settingsMap.site_name || "",
        title: settingsMap.hero_title || "",
        email: settingsMap.contact_email || "",
        phone: settingsMap.contact_phone || "",
        location: settingsMap.contact_address || "",
        website: settingsMap.site_url || "",
        avatar: settingsMap.owner_avatar || "",
        bio: settingsMap.hero_subtitle || settingsMap.site_description || "",
      },
      summary:
        resumes.length > 0 && resumes[0].summary
          ? resumes[0].summary
          : settingsMap.site_description || "",
      skills: skillsByCategory,
      experience: experiences.map((exp) => ({
        id: exp.id,
        title: exp.title,
        company: exp.company,
        location: exp.location,
        startDate: exp.startDate,
        endDate: exp.endDate,
        description: exp.description,
        type: exp.type,
        technologies: exp.technologies
          ? JSON.parse(exp.technologies)
          : [],
      })),
      education: education.map((edu) => ({
        id: edu.id,
        degree: edu.degree,
        institution: edu.institution,
        location: edu.location,
        startDate: edu.startDate,
        endDate: edu.endDate,
        description: edu.description,
        grade: edu.grade,
        certificate: edu.certificate,
      })),
      projects: projects.map((proj) => ({
        id: proj.id,
        title: proj.title,
        description: proj.description,
        category: proj.category,
        startDate: proj.startDate,
        endDate: proj.endDate,
        demoUrl: proj.demoUrl,
        repoUrl: proj.repoUrl,
        technologies: proj.technologies
          ? JSON.parse(proj.technologies)
          : [],
        featured: proj.featured,
        image: proj.images[0]?.url || null,
      })),
      socialLinks: socialLinks.map((link) => ({
        platform: link.platform,
        url: link.url,
        icon: link.icon,
      })),
      resumeFile: resumes.length > 0 ? resumes[0].fileUrl : null,
    };

    return success(resumeData);
  } catch (err) {
    return handleError(err);
  }
}
