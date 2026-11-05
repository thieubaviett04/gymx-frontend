'use client';

import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeService } from '@/lib/api';
import type {
  EmployeeDetail,
  UpdateEmployeePayload,
  EmployeeDetailTab,
  EmployeeFormData,
  EmployeeFormErrors,
} from '@/types/employee';
import { SPECIALIZATION_OPTIONS } from '@/types/employee';
import { validateUpdateEmployee, parseEmployeeBackendError } from '@/lib/utils';

export interface ToastState {
  type: 'success' | 'error';
  message: string;
}

const INITIAL_FORM_DATA: EmployeeFormData = {
  fullName: '',
  position: '',
  gender: 'NAM',
  dateOfBirth: '',
  phoneNumber: '',
  email: '',
  baseSalaryRate: '',
  address: '',
  nationalId: '',
  hiredAt: '',
  employmentStatus: 'ACTIVE',
  specializationId: SPECIALIZATION_OPTIONS[0].id,
  experienceYears: 1,
  pricePerSession: '',
  salaryCoefficient: '1.0',
  description: '',
};

export function useEmployeeDetailForm(employeeId: string, employee?: EmployeeDetail) {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<EmployeeDetailTab>('general');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<EmployeeFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<EmployeeFormErrors>({});
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  // Kiểm tra flash message từ sessionStorage (ví dụ vừa tạo xong nhân viên và chuyển hướng đến trang này)
  useEffect(() => {
    try {
      const flashMsg = sessionStorage.getItem('gymx_employee_flash');
      if (flashMsg) {
        sessionStorage.removeItem('gymx_employee_flash');
        setTimeout(() => {
          showToast('success', flashMsg);
        }, 100);
      }
    } catch {}
  }, [showToast]);

  // Đồng bộ formData từ employee data
  const syncFormFromEmployee = useCallback((emp: EmployeeDetail) => {
    setFormData({
      fullName: emp.fullName || '',
      email: emp.email || '',
      position: (emp.position || 'RECEPTIONIST').toUpperCase(),
      employmentStatus: (emp.employmentStatus || 'ACTIVE').toUpperCase(),
      phoneNumber: emp.phoneNumber || '',
      gender: (emp.gender || 'NAM').toUpperCase(),
      dateOfBirth: emp.dateOfBirth ? emp.dateOfBirth.split('T')[0] : '',
      address: emp.address || '',
      nationalId: emp.nationalId || '',
      hiredAt: emp.hiredAt ? emp.hiredAt.split('T')[0] : '',
      baseSalaryRate:
        emp.baseSalaryRate !== undefined && emp.baseSalaryRate !== null
          ? emp.baseSalaryRate
          : '',
      pricePerSession:
        emp.trainerInfo?.pricePerSession !== undefined &&
        emp.trainerInfo?.pricePerSession !== null
          ? emp.trainerInfo.pricePerSession
          : '',
      salaryCoefficient:
        emp.trainerInfo?.salaryCoefficient !== undefined &&
        emp.trainerInfo?.salaryCoefficient !== null
          ? emp.trainerInfo.salaryCoefficient
          : '1.0',
      specializationId: emp.trainerInfo?.specializationId || SPECIALIZATION_OPTIONS[0].id,
      experienceYears:
        emp.trainerInfo?.experienceYears !== undefined &&
        emp.trainerInfo?.experienceYears !== null
          ? emp.trainerInfo.experienceYears
          : 1,
      description: emp.trainerInfo?.description || '',
    });
    setErrors({});
  }, []);

  useEffect(() => {
    if (employee) {
      syncFormFromEmployee(employee);
    }
  }, [employee, syncFormFromEmployee]);

  // Mutation cập nhật thông tin nhân viên
  const updateMutation = useMutation({
    mutationFn: (payload: UpdateEmployeePayload) => employeeService.update(employeeId, payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-employee', employeeId] });
      queryClient.invalidateQueries({ queryKey: ['admin-employees'] });
      showToast('success', res.message || 'Cập nhật thông tin nhân viên thành công!');
      setIsEditing(false);
      setErrors({});
    },
    onError: (err: unknown) => {
      const { fieldErrors, generalError } = parseEmployeeBackendError(err);
      setErrors(fieldErrors);
      showToast('error', generalError || 'Có lỗi xảy ra khi cập nhật nhân viên.');
    },
  });

  const changeField = useCallback(
    <K extends keyof EmployeeFormData>(field: K, value: EmployeeFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const clearFieldError = useCallback((field: keyof EmployeeFormData) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const startEdit = useCallback(() => {
    if (employee) {
      syncFormFromEmployee(employee);
    }
    setIsEditing(true);
  }, [employee, syncFormFromEmployee]);

  const cancelEdit = useCallback(() => {
    if (employee) {
      syncFormFromEmployee(employee);
    }
    setIsEditing(false);
    setErrors({});
  }, [employee, syncFormFromEmployee]);

  const saveEdit = useCallback(() => {
    const validationErrors = validateUpdateEmployee(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      showToast('error', 'Vui lòng kiểm tra lại các trường thông tin bắt buộc.');
      return;
    }

    const payload: UpdateEmployeePayload = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      position: formData.position.toUpperCase(),
      baseSalaryRate: Number(formData.baseSalaryRate),
      employmentStatus: formData.employmentStatus.toUpperCase(),
      phoneNumber: formData.phoneNumber.trim() || undefined,
      gender: formData.gender || undefined,
      dateOfBirth: formData.dateOfBirth || undefined,
      address: formData.address.trim() || undefined,
    };

    if (formData.position === 'TRAINER') {
      payload.specializationId = formData.specializationId;
      payload.experienceYears = Number(formData.experienceYears);
      payload.pricePerSession =
        formData.pricePerSession !== '' && formData.pricePerSession !== undefined
          ? Number(formData.pricePerSession)
          : undefined;
      payload.description = formData.description.trim() || undefined;
    } else if (formData.description.trim()) {
      payload.description = formData.description.trim();
    }

    updateMutation.mutate(payload);
  }, [formData, showToast, updateMutation]);

  const changeTab = useCallback(
    (tab: EmployeeDetailTab) => {
      if ((tab === 'history' || tab === 'notes') && isEditing) {
        cancelEdit();
      }
      setActiveTab(tab);
    },
    [isEditing, cancelEdit]
  );

  // Tự động chuyển về tab 'general' nếu vai trò không phải Trainer
  const isTrainer =
    (isEditing ? formData.position : employee?.position || '').toUpperCase() === 'TRAINER' ||
    !!employee?.trainerInfo;

  useEffect(() => {
    if (!isTrainer && activeTab === 'trainer') {
      setActiveTab('general');
    }
  }, [isTrainer, activeTab]);

  return {
    activeTab,
    isEditing,
    formData,
    errors,
    toast,
    isSaving: updateMutation.isPending,
    isTrainer,
    changeTab,
    startEdit,
    cancelEdit,
    saveEdit,
    changeField,
    clearFieldError,
    dismissToast,
    showToast,
  };
}

