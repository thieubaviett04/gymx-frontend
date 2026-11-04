import React from 'react';
import { EmployeeDetailPage } from '@/components/dashboard/admin/employees';

export const metadata = {
  title: 'Chi tiết nhân viên | GymX Admin',
  description: 'Xem thông tin chi tiết hồ sơ nhân sự hệ thống GymX',
};

export default function EmployeeDetailRoute() {
  return (
    <div className="w-full flex-1 flex flex-col">
      <EmployeeDetailPage />
    </div>
  );
}

