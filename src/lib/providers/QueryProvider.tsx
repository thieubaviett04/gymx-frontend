"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";

export default function QueryProvider({ children }: { children: ReactNode }) {
  // Khởi tạo QueryClient với cấu hình cache mặc định 5 phút
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
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Công cụ debug React Query chỉ hiển thị trong môi trường lập trình */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
