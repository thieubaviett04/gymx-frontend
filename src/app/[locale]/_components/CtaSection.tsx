import React from 'react';
import { Link } from '@/i18n/routing';
import { Sparkles } from 'lucide-react';

export default function CtaSection() {
  return (
    <section className="relative bg-[#101828] text-white py-24 px-6 overflow-hidden text-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05),transparent_70%)] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#FF6B00]/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF6B00]/15 border border-[#FF6B00]/30 text-[#FF6B00] text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          Ưu đãi tháng 7 — Giảm 20% tháng đầu
        </div>

        <h2 className="text-4xl sm:text-6xl font-black font-['Plus_Jakarta_Sans',sans-serif] tracking-tight leading-tight">
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
            className="px-10 py-4 rounded-2xl bg-[#FF6B00] hover:bg-[#E05E00] text-white font-extrabold text-lg shadow-[0_10px_30px_rgba(255,107,0,0.4)] transition-all font-['Plus_Jakarta_Sans',sans-serif]"
          >
            Đăng ký miễn phí
          </Link>
          <a
            href="#pricing"
            className="px-10 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-lg transition-all"
          >
            So sánh gói tập
          </a>
        </div>

        <p className="text-xs text-white/30 pt-2">Không cần thẻ tín dụng · Huỷ bất cứ lúc nào</p>
      </div>
    </section>
  );
}
