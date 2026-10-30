'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  type: 'member' | 'payment' | 'session' | 'alert';
}

const mockNotifications: NotificationItem[] = [
  {
    id: '1',
    title: 'Hội viên mới đăng ký',
    message: 'Trần Văn Nam vừa đăng ký gói Pro 12 tháng.',
    time: '5 phút trước',
    unread: true,
    type: 'member',
  },
  {
    id: '2',
    title: 'Thanh toán thành công',
    message: 'Hoá đơn #GYM-8924 đã được thanh toán (899.000đ).',
    time: '20 phút trước',
    unread: true,
    type: 'payment',
  },
  {
    id: '3',
    title: 'Lịch PT sắp diễn ra',
    message: 'HLV Minh Khoa có buổi hướng dẫn vào 15:00 hôm nay.',
    time: '1 giờ trước',
    unread: false,
    type: 'session',
  },
];

export function NotificationBell({ className }: { className?: string } = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative p-2 rounded-xl text-[#6A7282] hover:text-[#101828] hover:bg-[#F3F4F6] transition-colors cursor-pointer",
          className
        )}
        aria-label="Thông báo"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-primary rounded-full ring-2 ring-white" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-card rounded-2xl shadow-2xl border border-border z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="p-4 border-b border-[#F3F4F6] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-foreground text-sm font-heading">Thông báo</h4>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-primary text-primary-foreground">
                  {unreadCount} mới
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-secondary hover:underline font-bold flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                Đánh dấu đã đọc
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-[#F3F4F6]">
            {notifications.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 hover:bg-[#F9FAFB] transition-colors cursor-pointer flex gap-3 ${
                  item.unread ? 'bg-secondary/5' : ''
                }`}
              >
                <div className="mt-0.5">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      item.unread ? 'bg-primary' : 'bg-transparent'
                    }`}
                  />
                </div>
                <div className="space-y-1 flex-1">
                  <p className="text-xs font-semibold text-foreground leading-snug">
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {item.message}
                  </p>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground/80 pt-1">
                    <Clock className="w-3 h-3" />
                    <span>{item.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-[#F9FAFB] border-t border-[#F3F4F6] text-center">
            <button className="text-xs font-bold text-secondary hover:underline">
              Xem toàn bộ thông báo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
