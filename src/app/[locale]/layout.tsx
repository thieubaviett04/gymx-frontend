import type { Metadata } from 'next';
import { plusJakartaSans, inter } from '@/lib/fonts';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import QueryProvider from '@/lib/providers/QueryProvider';
import '../globals.css';

export const metadata: Metadata = {
  title: 'GymX Platform - Hệ thống quản lý phòng tập hiện đại',
  description: 'Nền tảng quản lý hội viên, POS, check-in và lịch tập PT chuyên nghiệp.',
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${plusJakartaSans.variable} ${inter.variable} font-sans antialiased bg-background text-foreground min-h-screen`}
      >
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>{children}</QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
