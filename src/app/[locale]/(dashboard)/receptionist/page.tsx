'use client';

import React, { useState } from 'react';
import { Scan, UserCheck, Camera, Sparkles, CheckCircle2 } from 'lucide-react';
import { EmployeeFaceEnrollmentModal } from '@/components/admin/employees/face';

export default function ReceptionistDashboardPage() {
  const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFaceSuccess = () => {
    setSuccessMessage('Đã thêm dữ liệu khuôn mặt thành công.');
    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A0A0A]">Quầy Lễ tân</h1>
          <p className="text-sm text-[#525252] mt-1">
            Check-in hội viên, điểm danh nhân viên và quét dữ liệu khuôn mặt sinh trắc học.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsFaceModalOpen(true)}
          className="h-[44px] px-5 bg-[#064343] hover:bg-[#053737] text-white text-[14px] font-medium rounded-[10px] shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2.5 active:scale-98 shrink-0"
        >
          <Scan className="w-5 h-5 stroke-[2.2]" />
          <span>Thêm dữ liệu khuôn mặt</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-4 rounded-[10px] bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-emerald-800 text-[14px] font-medium animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-[12px] p-6 border border-[#E2E8F0] shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#064343]/10 text-[#064343] flex items-center justify-center">
              <Camera className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h3 className="text-[16px] font-bold text-[#0A0A0A]">Máy quét khuôn mặt AI</h3>
            <p className="text-[13px] text-[#64748B] leading-relaxed">
              Tích hợp Face++ nhận diện khuôn mặt tự động, đăng ký khuôn mặt mới hoặc cập nhật dữ liệu
              sinh trắc học cho hội viên và nhân viên.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsFaceModalOpen(true)}
            className="w-full h-[40px] bg-[#F8FAFC] hover:bg-slate-100 border border-[#E2E8F0] text-[#064343] text-[13px] font-semibold rounded-[8px] transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Scan className="w-4 h-4" />
            <span>Đăng ký khuôn mặt ngay</span>
          </button>
        </div>

        <div className="bg-white rounded-[12px] p-6 border border-[#E2E8F0] shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h3 className="text-[16px] font-bold text-[#0A0A0A]">Điểm danh & Check-in</h3>
            <p className="text-[13px] text-[#64748B] leading-relaxed">
              Theo dõi lượt check-in hôm nay, xác thực thẻ hội viên hoặc nhận diện sinh trắc học qua
              camera quầy lễ tân.
            </p>
          </div>

          <div className="text-[12px] text-[#64748B] bg-slate-50 p-2.5 rounded-[6px]">
            Trạng thái máy quét: <span className="font-semibold text-emerald-600">Sẵn sàng</span>
          </div>
        </div>

        <div className="bg-white rounded-[12px] p-6 border border-[#E2E8F0] shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h3 className="text-[16px] font-bold text-[#0A0A0A]">Quy trình chuẩn UC 4.35</h3>
            <p className="text-[13px] text-[#64748B] leading-relaxed">
              Kiểm tra tính hợp lệ của mã người dùng, xử lý trường hợp khuôn mặt đã tồn tại (E-2) và
              bắt lỗi nhận diện với tính năng thử lại (E-3).
            </p>
          </div>

          <div className="text-[12px] text-[#64748B] bg-slate-50 p-2.5 rounded-[6px]">
            Hệ thống: <span className="font-semibold text-[#064343]">Face++ Biometrics AI</span>
          </div>
        </div>
      </div>

      <EmployeeFaceEnrollmentModal
        isOpen={isFaceModalOpen}
        onClose={() => setIsFaceModalOpen(false)}
        onSuccess={handleFaceSuccess}
      />
    </div>
  );
}
