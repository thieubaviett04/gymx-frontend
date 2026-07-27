"use client";

import { useTranslations } from "next-intl";
import { useAuthStore } from "@/lib/store/authStore";

export default function HomePage() {
  // Kích hoạt bộ dịch chữ từ từ điển common.json
  const t = useTranslations("Common");

  // Kiểm tra kết nối với kho lưu trữ trạng thái đăng nhập Zustand
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-gradient-to-b from-zinc-900 to-black text-white">
      <div className="max-w-2xl p-8 border border-zinc-800 rounded-2xl bg-zinc-900/50 backdrop-blur-xl shadow-2xl">
        {/* Hiển thị tiêu đề dịch từ file từ điển */}
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-200 mb-4">
          {t("appName")}
        </h1>

        <p className="text-lg text-zinc-400 mb-8">{t("welcome")}</p>

        {/* Khối hiển thị trạng thái hệ thống để kiểm tra Store và Query */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm font-medium">
          <div className="px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300">
            Trạng thái Store:{" "}
            {isAuthenticated ? "🟢 Đã đăng nhập" : "⚪ Khách truy cập"}
          </div>

          <div className="px-4 py-2 rounded-lg bg-emerald-950/50 border border-emerald-500/30 text-emerald-400">
            ⚡ Kiến trúc Clean Architecture 100% Ready
          </div>
        </div>
      </div>
    </main>
  );
}
