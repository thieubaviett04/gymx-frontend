import React from 'react';
import { Clock, Dumbbell, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="footer" className="bg-white border-t border-[#F3F4F6] py-16 px-6 text-[#4A5565]">
      <div className="max-w-[1280px] mx-auto space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#FF6B00] flex items-center justify-center shadow-md">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-black text-[#101828] font-['Plus_Jakarta_Sans',sans-serif]">
                GYM<span className="text-[#FF6B00]">MAX</span>
              </span>
            </div>
            <p className="text-sm text-[#6A7282] max-w-sm leading-relaxed">
              Nền tảng gym thông minh — kết nối thành viên, HLV và quản lý trong một hệ sinh thái số hiện đại.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-[#101828]">Khám phá</h4>
            <ul className="space-y-2.5 text-sm text-[#6A7282]">
              <li>
                <a href="#pricing" className="hover:text-[#FF6B00] transition-colors">
                  Gói thành viên
                </a>
              </li>
              <li>
                <a href="#trainers" className="hover:text-[#FF6B00] transition-colors">
                  Huấn luyện viên
                </a>
              </li>
              <li>
                <a href="#amenities" className="hover:text-[#FF6B00] transition-colors">
                  Tiện ích
                </a>
              </li>
              <li>
                <a href="#testimonials" className="hover:text-[#FF6B00] transition-colors">
                  Đánh giá
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-[#101828]">Liên hệ</h4>
            <ul className="space-y-2.5 text-sm text-[#6A7282]">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#FF6B00] shrink-0" />
                <span>123 Nguyễn Huệ, Q.1, TP.HCM</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#FF6B00] shrink-0" />
                <span>1900 1234</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#FF6B00] shrink-0" />
                <span>hello@gymmax.vn</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#FF6B00] shrink-0" />
                <span>05:00 – 23:00 mỗi ngày</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[#F3F4F6] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#99A1AF]">
          <p>© 2025 Gym Max. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-[#4A5565]">
              Điều khoản
            </a>
            <a href="#" className="hover:text-[#4A5565]">
              Bảo mật
            </a>
            <a href="#" className="hover:text-[#4A5565]">
              Cookie
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
