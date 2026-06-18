import type { Metadata } from "next";
import { Cairo, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/public/ThemeProvider";
import { AuthProvider } from "@/components/public/AuthProvider";
import { AnalyticsTracker } from "@/components/public/AnalyticsTracker";
import { LanguageInitializer } from "@/components/public/LanguageInitializer";
import { ClientLayout } from "@/components/public/ClientLayout";

const cairo = Cairo({
  variable: "--font-display",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const SITE_URL = "https://ahmed-almutairi.dev";

export const metadata: Metadata = {
  title: "أحمد المطيري | مطوّر برمجيات",
  description: "مطوّر برمجيات متخصص في بناء تطبيقات ويب حديثة وسريعة باستخدام أحدث التقنيات",
  keywords: [
    "مطور برمجيات",
    "React",
    "Next.js",
    "تطوير ويب",
    "السعودية",
    "Full-Stack",
    "Ahmed Al-Mutairi",
    "Web Developer",
    "TypeScript",
    "Node.js",
  ],
  authors: [{ name: "أحمد المطيري", url: SITE_URL }],
  creator: "أحمد المطيري",
  publisher: "أحمد المطيري",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "أحمد المطيري | مطوّر برمجيات",
    description: "مطوّر برمجيات متخصص في بناء تطبيقات ويب حديثة وسريعة",
    type: "website",
    locale: "ar_SA",
    alternateLocale: "en_US",
    url: SITE_URL,
    siteName: "أحمد المطيري",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "أحمد المطيري | مطوّر برمجيات",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "أحمد المطيري | مطوّر برمجيات",
    description: "مطوّر برمجيات متخصص في بناء تطبيقات ويب حديثة وسريعة",
    images: ["/og-image.png"],
    creator: "@ahmed_almutairi",
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#10B981" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body
        className={`${cairo.variable} ${inter.variable} antialiased bg-background text-foreground font-sans`}
      >
        <ThemeProvider>
          <AuthProvider>
            <LanguageInitializer />
            <ClientLayout />
            {children}
            <AnalyticsTracker />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
