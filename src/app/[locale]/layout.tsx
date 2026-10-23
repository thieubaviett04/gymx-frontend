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
  preload: false, // Tắt tự động preload font không dùng đến, khắc phục triệt để warning font woff2
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
          id="suppress-extension-noise"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // 1. Chặn toàn bộ lỗi Uncaught do script bên thứ 3 (gads-scrapper, onboarding, extension) bắn vào Console
                window.addEventListener('error', function(e) {
                  var filename = (e && e.filename) ? String(e.filename) : '';
                  var message = (e && e.message) ? String(e.message) : '';
                  if (
                    filename.indexOf('gads-scrapper') !== -1 ||
                    filename.indexOf('onboarding') !== -1 ||
                    filename.indexOf('extension') !== -1 ||
                    filename.indexOf('chrome-extension') !== -1 ||
                    message.indexOf("Cannot access 'm' before initialization") !== -1 ||
                    message.indexOf('Could not establish connection') !== -1
                  ) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    return true;
                  }
                }, true);

                // 2. Chặn lỗi Uncaught (in promise) undefined từ script onboarding / extension
                window.addEventListener('unhandledrejection', function(e) {
                  var reason = e ? e.reason : null;
                  var reasonStr = reason ? (reason.stack || String(reason)) : '';
                  if (
                    !reason ||
                    reason === 'undefined' ||
                    reasonStr.indexOf('onboarding') !== -1 ||
                    reasonStr.indexOf('gads-scrapper') !== -1 ||
                    reasonStr.indexOf('extension') !== -1 ||
                    reasonStr.indexOf('chrome-extension') !== -1
                  ) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    return true;
                  }
                }, true);

                // 3. Tự động dọn dẹp các attribute do extension Cốc Cốc / Adblock tự chèn vào DOM
                var removeAttr = function(el) {
                  if (el && el.removeAttribute) {
                    el.removeAttribute('bis_skin_checked');
                    el.removeAttribute('bis_register');
                  }
                };
                document.querySelectorAll('[bis_skin_checked], [bis_register]').forEach(removeAttr);
                var observer = new MutationObserver(function(mutations) {
                  for (var i = 0; i < mutations.length; i++) {
                    var m = mutations[i];
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
