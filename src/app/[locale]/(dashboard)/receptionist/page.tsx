'use client';

import React from 'react';
import {
  Users,
  CheckSquare,
  ClipboardList,
  Sparkles,
} from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function ReceptionistDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A0A0A]">Quầy Lễ tân</h1>
          <p className="text-sm text-[#525252] mt-1">
            Hệ thống tiếp đón hội viên, hỗ trợ đăng ký thẻ tập và phục vụ khách hàng GymX.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-[12px] p-6 border border-[#E2E8F0] shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#064343]/10 text-[#064343] flex items-center justify-center">
              <CheckSquare className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h3 className="text-[16px] font-bold text-[#0A0A0A]">Check-in hội viên</h3>
            <p className="text-[13px] text-[#64748B] leading-relaxed">
              Xác thực thẻ tập của hội viên khi đến phòng tập và ghi nhận lượt vào tập.
            </p>
          </div>

          <Link
            href="/receptionist/check-in"
            className="w-full h-[40px] bg-[#064343] hover:bg-[#053737] text-white text-[13px] font-semibold rounded-[8px] transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <CheckSquare className="w-4 h-4" />
            <span>Mở quầy check-in</span>
          </Link>
        </div>

        <div className="bg-white rounded-[12px] p-6 border border-[#E2E8F0] shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h3 className="text-[16px] font-bold text-[#0A0A0A]">Danh sách hội viên</h3>
            <p className="text-[13px] text-[#64748B] leading-relaxed">
              Tra cứu thông tin cá nhân, gói tập đang kích hoạt và lịch sử đăng ký của hội viên.
            </p>
          </div>

          <Link
            href="/receptionist/members"
            className="w-full h-[40px] bg-[#F8FAFC] hover:bg-slate-100 border border-[#E2E8F0] text-[#064343] text-[13px] font-semibold rounded-[8px] transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Users className="w-4 h-4" />
            <span>Xem danh sách</span>
          </Link>
        </div>

        <div className="bg-white rounded-[12px] p-6 border border-[#E2E8F0] shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h3 className="text-[16px] font-bold text-[#0A0A0A]">Hàng đợi tiếp đón</h3>
            <p className="text-[13px] text-[#64748B] leading-relaxed">
              Quản lý danh sách khách vãng lai tham quan và hội viên đang chờ hỗ trợ dịch vụ.
            </p>
          </div>

          <Link
            href="/receptionist/queue"
            className="w-full h-[40px] bg-[#F8FAFC] hover:bg-slate-100 border border-[#E2E8F0] text-[#064343] text-[13px] font-semibold rounded-[8px] transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ClipboardList className="w-4 h-4" />
            <span>Xem hàng đợi</span>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-[12px] p-6 border border-[#E2E8F0] shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h4 className="text-[15px] font-bold text-[#0A0A0A]">Trạng thái quầy dịch vụ</h4>
            <p className="text-[13px] text-[#64748B]">Hệ thống đang hoạt động ổn định và sẵn sàng tiếp đón khách hàng.</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Đang phục vụ
        </span>
      </div>
    </div>
  );
}
