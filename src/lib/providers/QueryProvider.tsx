'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useEffect, useState, type ReactNode } from 'react';

// Bắt và lọc console.error của Dev Overlay Next.js khi extension (Cốc Cốc, Bitdefender...) chèn bis_skin_checked
if (typeof window !== 'undefined') {
  const origConsoleError = window.console.error;
  window.console.error = function (...args: unknown[]) {
    const message = args
      .map((arg) => {
        if (typeof arg === 'string') return arg;
        if (arg && typeof arg === 'object') {
          return (arg as { message?: string; stack?: string }).message || (arg as { message?: string; stack?: string }).stack || '';
        }
        return '';
      })
      .join(' ');

    if (message.includes('bis_skin_checked') || message.includes('bis_register')) {
      return;
    }
    return origConsoleError.apply(window.console, args);
  };
}

export default function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: 15 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {mounted && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
