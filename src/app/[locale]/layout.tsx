import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import QueryProvider from "@/lib/providers/QueryProvider";
import "../globals.css";

// Cấu hình font chữ hiện đại Geist tối ưu hiệu năng
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

// Cấu hình thông tin SEO và tiêu đề mặc định cho nền tảng GymX
export const metadata: Metadata = {
  title: "GymX Platform - Hệ thống quản lý phòng tập hiện đại",
  description:
    "Nền tảng quản lý hội viên, POS, check-in và lịch tập PT chuyên nghiệp.",
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Tải từ điển ngôn ngữ từ máy chủ theo đúng locale hiện tại
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geist.variable} font-sans antialiased bg-background text-foreground min-h-screen`}
      >
        {/* Bọc nhà máy cung cấp từ điển đa ngôn ngữ */}
        <NextIntlClientProvider messages={messages}>
          {/* Bọc nhà máy quản lý bộ nhớ đệm React Query */}
          <QueryProvider>{children}</QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
