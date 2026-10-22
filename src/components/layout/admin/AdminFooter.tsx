import React from 'react';

export function AdminFooter() {
  return (
    <footer className="h-12 border-t border-[#F3F4F6] bg-white px-6 flex items-center justify-between text-xs text-[#99A1AF]">
      <p>© 2025 Gym Max Admin System · Version 1.0.0</p>
      <div className="flex items-center gap-4">
        <a href="#" className="hover:text-[#4A5565] transition-colors">
          Tài liệu hỗ trợ
        </a>
        <a href="#" className="hover:text-[#4A5565] transition-colors">
          Báo lỗi
        </a>
      </div>
    </footer>
  );
}

export default AdminFooter;
