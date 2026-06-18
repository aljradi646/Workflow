import { db } from "@/lib/db";
import { handleError } from "@/lib/api-response";

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

    const name = settingsMap.owner_name || settingsMap.site_name || "الاسم";
    const title = settingsMap.hero_title || "";
    const email = settingsMap.contact_email || "";
    const phone = settingsMap.contact_phone || "";
    const location = settingsMap.contact_address || "";
    const website = settingsMap.site_url || "";
    const bio =
      resumes.length > 0 && resumes[0].summary
        ? resumes[0].summary
        : settingsMap.site_description || settingsMap.hero_subtitle || "";

    // Group skills by category
    const categoryLabels: Record<string, string> = {
      frontend: "تطوير الواجهات",
      backend: "تطوير الخوادم",
      devops: "DevOps",
      design: "التصميم",
      mobile: "تطوير الهواتف",
      database: "قواعد البيانات",
      tools: "الأدوات",
      general: "عام",
    };

    const skillsByCategory: Record<string, { name: string; level: number }[]> = {};
    for (const skill of skills) {
      const cat = skill.category || "general";
      if (!skillsByCategory[cat]) skillsByCategory[cat] = [];
      skillsByCategory[cat].push({ name: skill.name, level: skill.level });
    }

    // Build skills HTML
    const skillsHtml = Object.entries(skillsByCategory)
      .map(
        ([category, items]) => `
      <div class="skill-category">
        <h3 class="category-title">${categoryLabels[category] || category}</h3>
        <div class="skill-items">
          ${items
            .map(
              (s) => `
            <div class="skill-item">
              <span class="skill-name">${s.name}</span>
              <div class="skill-bar">
                <div class="skill-fill" style="width: ${s.level}%"></div>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `
      )
      .join("");

    // Build experience HTML
    const experienceHtml = experiences
      .map(
        (exp) => `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <div class="timeline-header">
            <h3>${exp.title}</h3>
            <span class="company">${exp.company}</span>
          </div>
          <div class="timeline-meta">
            <span>${exp.startDate} - ${exp.endDate || "حتى الآن"}</span>
            ${exp.location ? `<span>📍 ${exp.location}</span>` : ""}
            ${exp.type && exp.type !== "work" ? `<span class="type-badge">${exp.type}</span>` : ""}
          </div>
          ${exp.description ? `<p class="timeline-desc">${exp.description}</p>` : ""}
          ${
            exp.technologies
              ? `<div class="tech-tags">${JSON.parse(exp.technologies)
                  .map((t: string) => `<span class="tech-tag">${t}</span>`)
                  .join("")}</div>`
              : ""
          }
        </div>
      </div>
    `
      )
      .join("");

    // Build education HTML
    const educationHtml = education
      .map(
        (edu) => `
      <div class="timeline-item">
        <div class="timeline-dot edu-dot"></div>
        <div class="timeline-content">
          <div class="timeline-header">
            <h3>${edu.degree}</h3>
            <span class="company">${edu.institution}</span>
          </div>
          <div class="timeline-meta">
            <span>${edu.startDate} - ${edu.endDate || "حتى الآن"}</span>
            ${edu.location ? `<span>📍 ${edu.location}</span>` : ""}
          </div>
          ${edu.description ? `<p class="timeline-desc">${edu.description}</p>` : ""}
          ${edu.grade ? `<div class="grade-badge">التقدير: ${edu.grade}</div>` : ""}
        </div>
      </div>
    `
      )
      .join("");

    // Build projects HTML
    const projectsHtml = projects
      .map(
        (proj) => `
      <div class="project-item">
        <div class="project-header">
          <h3>${proj.title}</h3>
          ${proj.featured ? '<span class="featured-badge">⭐ مميز</span>' : ""}
        </div>
        <p class="project-desc">${proj.description}</p>
        ${
          proj.technologies
            ? `<div class="tech-tags">${JSON.parse(proj.technologies)
                .map((t: string) => `<span class="tech-tag">${t}</span>`)
                .join("")}</div>`
            : ""
        }
        <div class="project-links">
          ${proj.demoUrl ? `<a href="${proj.demoUrl}" class="project-link">🔗 عرض مباشر</a>` : ""}
          ${proj.repoUrl ? `<a href="${proj.repoUrl}" class="project-link">💻 الكود المصدري</a>` : ""}
        </div>
      </div>
    `
      )
      .join("");

    // Build social links HTML
    const socialHtml = socialLinks
      .map(
        (link) =>
          `<a href="${link.url}" class="social-link">${link.platform}</a>`
      )
      .join(" ");

    // Build contact info HTML
    const contactItems: string[] = [];
    if (email) contactItems.push(`<span>📧 ${email}</span>`);
    if (phone) contactItems.push(`<span>📱 ${phone}</span>`);
    if (location) contactItems.push(`<span>📍 ${location}</span>`);
    if (website) contactItems.push(`<span>🌐 ${website}</span>`);
    const contactHtml = contactItems.join("");

    const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>السيرة الذاتية - ${name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Cairo', sans-serif;
      direction: rtl;
      color: #1a1a2e;
      background: #ffffff;
      line-height: 1.7;
      font-size: 14px;
    }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 30px;
    }

    /* Header Section */
    .header {
      text-align: center;
      padding-bottom: 30px;
      border-bottom: 3px solid #10b981;
      margin-bottom: 30px;
    }

    .header h1 {
      font-size: 32px;
      font-weight: 800;
      color: #1a1a2e;
      margin-bottom: 6px;
    }

    .header .title {
      font-size: 18px;
      color: #10b981;
      font-weight: 600;
      margin-bottom: 16px;
    }

    .contact-info {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 16px;
      font-size: 13px;
      color: #555;
    }

    .contact-info a {
      color: #10b981;
      text-decoration: none;
    }

    .social-links {
      margin-top: 10px;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 12px;
    }

    .social-link {
      color: #10b981;
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
      padding: 2px 10px;
      border: 1px solid #10b981;
      border-radius: 20px;
    }

    /* Section Styles */
    .section {
      margin-bottom: 28px;
    }

    .section-title {
      font-size: 20px;
      font-weight: 700;
      color: #1a1a2e;
      border-bottom: 2px solid #10b981;
      padding-bottom: 8px;
      margin-bottom: 18px;
      position: relative;
    }

    .section-title::after {
      content: '';
      position: absolute;
      bottom: -2px;
      right: 0;
      width: 60px;
      height: 2px;
      background: #0d9488;
    }

    /* Summary */
    .summary {
      font-size: 14px;
      color: #444;
      line-height: 1.8;
      text-align: justify;
    }

    /* Skills */
    .skills-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 18px;
    }

    .category-title {
      font-size: 15px;
      font-weight: 700;
      color: #10b981;
      margin-bottom: 10px;
    }

    .skill-item {
      margin-bottom: 8px;
    }

    .skill-name {
      font-size: 13px;
      font-weight: 500;
      color: #333;
      display: block;
      margin-bottom: 3px;
    }

    .skill-bar {
      height: 6px;
      background: #e5e7eb;
      border-radius: 3px;
      overflow: hidden;
    }

    .skill-fill {
      height: 100%;
      background: linear-gradient(90deg, #10b981, #0d9488);
      border-radius: 3px;
    }

    /* Timeline */
    .timeline {
      position: relative;
      padding-right: 28px;
    }

    .timeline::before {
      content: '';
      position: absolute;
      right: 6px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: linear-gradient(to bottom, #10b981, #0d9488, #e5e7eb);
    }

    .timeline-item {
      position: relative;
      margin-bottom: 22px;
    }

    .timeline-item:last-child {
      margin-bottom: 0;
    }

    .timeline-dot {
      position: absolute;
      right: -24px;
      top: 6px;
      width: 12px;
      height: 12px;
      background: #10b981;
      border-radius: 50%;
      border: 2px solid #fff;
      box-shadow: 0 0 0 2px #10b981;
    }

    .edu-dot {
      background: #0d9488;
      box-shadow: 0 0 0 2px #0d9488;
    }

    .timeline-content {
      background: #f8fffe;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 14px 16px;
    }

    .timeline-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 10px;
      flex-wrap: wrap;
    }

    .timeline-header h3 {
      font-size: 15px;
      font-weight: 700;
      color: #1a1a2e;
    }

    .company {
      font-size: 14px;
      color: #10b981;
      font-weight: 600;
    }

    .timeline-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      font-size: 12px;
      color: #888;
      margin-top: 4px;
    }

    .type-badge {
      background: #10b98115;
      color: #10b981;
      padding: 1px 8px;
      border-radius: 10px;
      font-size: 11px;
    }

    .timeline-desc {
      font-size: 13px;
      color: #555;
      margin-top: 8px;
      line-height: 1.7;
    }

    .tech-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 8px;
    }

    .tech-tag {
      font-size: 11px;
      padding: 2px 10px;
      background: #10b98112;
      color: #0d9488;
      border-radius: 12px;
      font-weight: 500;
    }

    /* Projects */
    .project-item {
      background: #f8fffe;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 14px 16px;
      margin-bottom: 14px;
    }

    .project-item:last-child {
      margin-bottom: 0;
    }

    .project-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .project-header h3 {
      font-size: 15px;
      font-weight: 700;
      color: #1a1a2e;
    }

    .featured-badge {
      font-size: 11px;
      background: #fbbf2420;
      color: #b45309;
      padding: 2px 10px;
      border-radius: 12px;
    }

    .project-desc {
      font-size: 13px;
      color: #555;
      margin-top: 6px;
      line-height: 1.7;
    }

    .project-links {
      margin-top: 8px;
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .project-link {
      font-size: 12px;
      color: #10b981;
      text-decoration: none;
      font-weight: 500;
    }

    /* Grade Badge */
    .grade-badge {
      display: inline-block;
      margin-top: 6px;
      font-size: 12px;
      background: #10b98115;
      color: #10b981;
      padding: 2px 10px;
      border-radius: 10px;
      font-weight: 600;
    }

    /* Print Button */
    .print-btn {
      position: fixed;
      top: 20px;
      left: 20px;
      background: #10b981;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-family: 'Cairo', sans-serif;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 12px #10b98140;
      transition: background 0.2s;
    }

    .print-btn:hover {
      background: #0d9488;
    }
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">🖨️ طباعة / حفظ PDF</button>

  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>${name}</h1>
      ${title ? `<div class="title">${title}</div>` : ""}
      <div class="contact-info">
        ${contactHtml}
      </div>
      ${socialLinks.length > 0 ? `<div class="social-links">${socialHtml}</div>` : ""}
    </div>

    ${
      bio
        ? `
    <!-- Summary -->
    <div class="section">
      <h2 class="section-title">نبذة عني</h2>
      <p class="summary">${bio}</p>
    </div>
    `
        : ""
    }

    ${
      Object.keys(skillsByCategory).length > 0
        ? `
    <!-- Skills -->
    <div class="section">
      <h2 class="section-title">المهارات</h2>
      <div class="skills-grid">
        ${skillsHtml}
      </div>
    </div>
    `
        : ""
    }

    ${
      experiences.length > 0
        ? `
    <!-- Experience -->
    <div class="section">
      <h2 class="section-title">الخبرات العملية</h2>
      <div class="timeline">
        ${experienceHtml}
      </div>
    </div>
    `
        : ""
    }

    ${
      education.length > 0
        ? `
    <!-- Education -->
    <div class="section">
      <h2 class="section-title">التعليم</h2>
      <div class="timeline">
        ${educationHtml}
      </div>
    </div>
    `
        : ""
    }

    ${
      projects.length > 0
        ? `
    <!-- Projects -->
    <div class="section">
      <h2 class="section-title">المشاريع</h2>
      ${projectsHtml}
    </div>
    `
        : ""
    }
  </div>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": 'attachment; filename="resume.html"',
      },
    });
  } catch (err) {
    return handleError(err);
  }
}
