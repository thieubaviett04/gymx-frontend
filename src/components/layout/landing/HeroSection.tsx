'use client';

import React, { useState } from 'react';
import { Link } from '@/i18n/routing';
import {
  ArrowRight,
  Check,
  ChevronDown,
  Dumbbell,
  Sparkles,
  Star,
} from 'lucide-react';
import { heroPlanDetails, PlanType } from './data';

export default function HeroSection() {
  const [selectedHeroPlan, setSelectedHeroPlan] = useState<PlanType>('Pro');

  return (
    <section className="relative min-h-[903px] flex items-center justify-center bg-black overflow-hidden px-6 py-20">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1800&q=80')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[350px] bg-primary/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-[1280px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-8 text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              GYM HÀNG ĐẦU VIỆT NAM 2025
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl sm:text-6xl xl:text-[80px] font-extrabold text-white tracking-tight leading-[1.08] font-heading">
              Biến hình{' '}
              <span className="relative inline-block">
                cơ thể
                <span className="absolute left-0 -bottom-1 w-full h-1.5 bg-gradient-to-r from-primary to-primary-light rounded-full" />
              </span>
              .<br />
              Nâng cấp
              <br />
              cuộc sống.
            </h1>
          </div>

          <p className="text-lg sm:text-xl text-white/70 max-w-xl font-normal leading-relaxed">
            Gym Max kết hợp thiết bị hiện đại, HLV đẳng cấp quốc tế và hệ thống quản lý thông minh — để bạn đạt mục
            tiêu nhanh hơn, dễ hơn.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/register"
              className="px-8 py-4 rounded-2xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-base shadow-[0_10px_25px_rgba(186,253,0,0.35)] transition-all flex items-center gap-2.5"
            >
              Đăng ký gói tập
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#pricing"
              className="px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/25 backdrop-blur-md text-white font-semibold text-base transition-all"
            >
              Xem các gói tập
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-4 text-sm text-white/50">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span>Không ràng buộc</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span>Hoàn tiền 7 ngày</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span>Kích hoạt ngay hôm nay</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 relative">
          <div className="absolute -top-4 right-4 z-20 px-4 py-3 rounded-2xl bg-secondary text-white shadow-xl border border-secondary-light/30">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-secondary-light">Thành viên mới</span>
            <span className="block text-2xl font-black font-heading leading-tight">+240</span>
            <span className="block text-[11px] font-medium text-white/70">tháng này</span>
          </div>

          <div className="bg-white rounded-3xl p-7 shadow-2xl relative z-10 border border-white/20 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Đăng ký nhanh</span>
                <h3 className="text-2xl font-bold text-foreground font-heading">
                  Chọn gói tập
                </h3>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
                <Dumbbell className="w-5 h-5" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-[#E5E7EB] p-1.5 rounded-xl border border-gray-200">
              {(['Basic', 'Pro', 'Elite'] as const).map((plan) => (
                <button
                  key={plan}
                  type="button"
                  onClick={() => setSelectedHeroPlan(plan)}
                  className={`py-2 px-3 text-sm font-bold rounded-lg transition-all ${
                    selectedHeroPlan === plan
                      ? 'bg-primary text-[#011010] shadow-[0_2px_8px_rgba(186,253,0,0.4)] ring-1 ring-black/10'
                      : 'bg-white text-[#1F2937] hover:bg-white/90 hover:text-black border border-gray-200/80 shadow-2xs'
                  }`}
                >
                  {plan}
                </button>
              ))}
            </div>

            <div className="p-5 rounded-2xl bg-[#F4FFD0]/60 border-2 border-[#D8FF5C] space-y-1">
              <span className="text-xs text-muted-foreground">Chỉ từ</span>
              <div className="text-3xl font-black text-foreground font-heading">
                {heroPlanDetails[selectedHeroPlan].price}
                <span className="text-base font-normal text-muted-foreground">đ/tháng</span>
              </div>
              <div className="text-xs font-bold text-secondary">
                {heroPlanDetails[selectedHeroPlan].save}
              </div>
            </div>

            <div className="space-y-3 pt-1">
              {heroPlanDetails[selectedHeroPlan].perks.map((perk, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm text-[#1F2937] font-medium">
                  <div className="w-5 h-5 rounded-full bg-secondary/15 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-secondary stroke-[2.5]" />
                  </div>
                  <span>{perk}</span>
                </div>
              ))}
            </div>

            <Link
              href="/register"
              className="w-full py-3.5 rounded-2xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-center block shadow-[0_6px_20px_rgba(186,253,0,0.3)] transition-all"
            >
              Bắt đầu ngay hôm nay
            </Link>
          </div>

          <div className="absolute -bottom-4 -left-4 z-20 px-4 py-3 rounded-2xl bg-white border border-[#E5E7EB] shadow-xl flex items-center gap-3">
            <div className="flex text-[#FFB800]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <div>
              <span className="block text-sm font-bold text-[#101828]">4.9 / 5.0</span>
              <span className="block text-xs text-[#99A1AF]">1,200+ đánh giá</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/50 animate-bounce">
        <span className="text-xs uppercase tracking-widest font-medium">Khám phá</span>
        <ChevronDown className="w-4 h-4" />
      </div>
    </section>
  );
}
