import React from 'react';
import { CreateEmployeeForm } from '@/components/admin/employees';

export const metadata = {
  title: 'Thêm mới nhân viên | GymX Admin',
  description: 'Thêm mới hồ sơ nhân viên và huấn luyện viên hệ thống GymX',
};

export default function CreateEmployeePage() {
  return (
    <div className="w-full flex-1 flex flex-col">
      <CreateEmployeeForm />
    </div>
  );
}
