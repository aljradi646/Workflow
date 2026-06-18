import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "لوحة التحكم | إدارة الموقع",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Dashboard has its own isolated layout - no public header/footer
  return <>{children}</>;
}
