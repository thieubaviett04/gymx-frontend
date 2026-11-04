import React from 'react';
import { EditEmployeeForm } from '@/components/dashboard/admin/employees';

export const metadata = {
  title: 'Chỉnh sửa nhân viên | GymX Admin',
  description: 'Cập nhật thông tin hồ sơ nhân viên và huấn luyện viên hệ thống GymX',
};

export default function EditEmployeePage() {
  return (
    <div className="w-full flex-1 flex flex-col">
      <EditEmployeeForm />
    </div>
  );
}

