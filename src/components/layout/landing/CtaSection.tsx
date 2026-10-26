import React from 'react';
import { Link } from '@/i18n/routing';
import { Sparkles } from 'lucide-react';

export default function CtaSection() {
  return (
    <section className="relative bg-[#101828] text-white py-24 px-6 overflow-hidden text-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05),transparent_70%)] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary/15 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/40 text-primary text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          Ưu đãi tháng 7 — Giảm 20% tháng đầu
        </div>

        <h2 className="text-4xl sm:text-6xl font-black font-heading tracking-tight leading-tight">
          Ngày đầu tiên
          <br />
          bắt đầu từ hôm nay.
        </h2>

        <p className="text-lg sm:text-xl text-white/55 font-normal max-w-xl mx-auto">
          Đừng đợi thêm. Hàng nghìn người đã bắt đầu — và họ không hối hận.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/register"
            className="px-10 py-4 rounded-2xl bg-primary hover:bg-primary-hover text-[#011010] font-extrabold text-lg shadow-[0_10px_30px_rgba(186,253,0,0.45)] ring-1 ring-black/10 transition-all font-heading"
          >
            Đăng ký miễn phí
          </Link>
          <a
            href="#pricing"
            className="px-10 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border-2 border-white/40 text-white font-bold text-lg transition-all"
          >
            So sánh gói tập
          </a>
        </div>

        <p className="text-xs text-white/30 pt-2">Không cần thẻ tín dụng · Huỷ bất cứ lúc nào</p>
      </div>
    </section>
  );
}
