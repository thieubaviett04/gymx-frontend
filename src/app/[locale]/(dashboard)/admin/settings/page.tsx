'use client';

import React from 'react';
import { Breadcrumbs, Button } from '@/components/ui';
import { useAuthStore } from '@/lib/store/authStore';
import { Settings, User, Bell, Shield, Building2 } from 'lucide-react';

export default function AdminSettingsPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Breadcrumb & Header */}
      <div>
        <Breadcrumbs
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Quản trị viên', href: '/admin' },
            { label: 'Cài đặt hệ thống' },
          ]}
          className="mb-2 text-xs"
        />
        <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1">
          <Settings className="w-4 h-4 text-[#064343]" />
          <span>Hệ thống</span>
        </div>
        <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">
          Cài đặt hệ thống
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
          Quản lý thông tin tài khoản quản trị, tùy chọn thông báo và cấu hình hệ thống GymX.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[#064343]/10 flex items-center justify-center text-[#064343]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#0F172A]">Tài khoản cá nhân</h2>
              <p className="text-xs text-[#64748B]">Thông tin người dùng đang đăng nhập</p>
            </div>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-[#64748B]">Họ và tên</label>
              <p className="text-sm font-bold text-[#0F172A] mt-0.5">
                {user?.fullName || 'Quản trị viên GymX'}
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#64748B]">Email</label>
              <p className="text-sm font-medium text-[#0F172A] mt-0.5">
                {user?.email || 'admin@gymx.vn'}
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#64748B]">Vai trò</label>
              <div className="mt-1">
                <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-[#064343] text-white">
                  {user?.roles?.[0] || 'ADMIN'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* System Settings Card */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-xs lg:col-span-2">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-[#064343]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#0F172A]">Thông tin trung tâm GymX</h2>
              <p className="text-xs text-[#64748B]">Cấu hình thương hiệu và chi nhánh</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[#64748B] font-medium">Tên thương hiệu</span>
              <p className="text-sm font-bold text-[#0F172A] mt-1">Gym Max Fitness CRM</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[#64748B] font-medium">Phiên bản hệ thống</span>
              <p className="text-sm font-bold text-[#0F172A] mt-1">v1.0.0 (Release 2025)</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[#64748B] font-medium">Trạng thái API</span>
              <p className="text-sm font-bold text-emerald-600 mt-1">Hoạt động bình thường</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[#64748B] font-medium">Chế độ bảo mật</span>
              <p className="text-sm font-bold text-[#064343] mt-1">BFF HttpOnly + JWT Token</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
