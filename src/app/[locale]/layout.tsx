import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import Script from 'next/script';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import QueryProvider from '@/lib/providers/QueryProvider';
import '../globals.css';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
});

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
        className={`${geist.variable} font-sans antialiased bg-background text-foreground min-h-screen`}
      >
        <Script
          id="remove-extension-attributes"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const removeAttr = function(el) {
                  if (el && el.removeAttribute) {
                    el.removeAttribute('bis_skin_checked');
                    el.removeAttribute('bis_register');
                  }
                };
                document.querySelectorAll('[bis_skin_checked], [bis_register]').forEach(removeAttr);
                const observer = new MutationObserver(function(mutations) {
                  for (let i = 0; i < mutations.length; i++) {
                    const m = mutations[i];
                    if (m.type === 'attributes' && (m.attributeName === 'bis_skin_checked' || m.attributeName === 'bis_register')) {
                      removeAttr(m.target);
                    }
                  }
                });
                observer.observe(document.documentElement, {
                  attributes: true,
                  subtree: true,
                  attributeFilter: ['bis_skin_checked', 'bis_register']
                });
              })();
            `,
          }}
        />
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>{children}</QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
