'use client';

import { useState, useCallback } from 'react';
import { useRouter } from '@/i18n/routing';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeService } from '@/lib/api';
import type {
  CreateEmployeePayload,
  EmployeeFormData,
  EmployeeFormErrors,
  CreateEmployeeFormProps,
} from '@/types/employee';
import { validateCreateEmployee, parseEmployeeBackendError } from '@/lib/utils';
import type { ToastState } from './useEmployeeDetailForm';

const INITIAL_CREATE_FORM: EmployeeFormData = {
  fullName: '',
  position: '',
  gender: 'NAM',
  dateOfBirth: '',
  phoneNumber: '',
  email: '',
  baseSalaryRate: '',
  address: '',
  nationalId: '',
  hiredAt: new Date().toISOString().split('T')[0],
  employmentStatus: 'ACTIVE',
  specializationId: '',
  experienceYears: '1',
  pricePerSession: '',
  salaryCoefficient: '1.0',
  description: '',
};

export function useCreateEmployeeForm(options: CreateEmployeeFormProps = {}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<EmployeeFormData>(INITIAL_CREATE_FORM);
  const [errors, setErrors] = useState<EmployeeFormErrors>({});
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

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

  const clearAllErrors = useCallback(() => {
    if (Object.keys(errors).length > 0) {
      setErrors({});
    }
    if (toast && toast.type === 'error') {
      setToast(null);
    }
  }, [errors, toast]);

  const handleCancel = useCallback(() => {
    if (options.onCancel) {
      options.onCancel();
    } else {
      router.push('/admin/employees');
    }
  }, [options, router]);

  const createMutation = useMutation({
    mutationFn: (payload: CreateEmployeePayload) => employeeService.create(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-employees'] });
      const newEmployeeId = res?.data?.id || (res?.data as any)?.Id || (res as any)?.id;
      const msg =
        res.message || 'Thêm mới nhân viên thành công! Mật khẩu tạm thời đã gửi qua email.';
      showToast('success', msg);
      try {
        sessionStorage.setItem('gymx_employee_flash', msg);
      } catch {}

      setTimeout(() => {
        if (newEmployeeId) {
          router.push(`/admin/employees/${newEmployeeId}`);
        } else if (options.onSuccess) {
          options.onSuccess(newEmployeeId);
        } else {
          router.push('/admin/employees');
        }
      }, 700);
    },
    onError: (err: unknown) => {
      const { fieldErrors, generalError } = parseEmployeeBackendError(err);

      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
        const firstKey = Object.keys(fieldErrors)[0];
        setTimeout(() => {
          const el =
            document.getElementById(firstKey) ||
            document.querySelector(`[name="${firstKey}"]`);
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      } else {
        showToast(
          'error',
          generalError || 'Có lỗi xảy ra khi tạo nhân viên. Vui lòng kiểm tra lại.'
        );
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
  });

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      setToast(null);

      const validationErrors = validateCreateEmployee(formData);
      setErrors(validationErrors);

      if (Object.keys(validationErrors).length > 0) {
        const firstKey = Object.keys(validationErrors)[0];
        setTimeout(() => {
          const el =
            document.getElementById(firstKey) ||
            document.querySelector(`[name="${firstKey}"]`);
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
        return;
      }

      const payload: CreateEmployeePayload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        nationalId: formData.nationalId.trim(),
        position: formData.position.toUpperCase(),
        baseSalaryRate: Number(formData.baseSalaryRate),
        phoneNumber: formData.phoneNumber.trim() || undefined,
        gender: formData.gender || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        address: formData.address.trim() || undefined,
        hiredAt: formData.hiredAt || undefined,
      };

      if (formData.position === 'TRAINER') {
        payload.specializationId = formData.specializationId;
        payload.experienceYears = Number(formData.experienceYears);
        payload.pricePerSession =
          formData.pricePerSession !== '' ? Number(formData.pricePerSession) : 0;
        payload.description = formData.description.trim() || undefined;
      }

      createMutation.mutate(payload);
    },
    [formData, createMutation]
  );

  const isTrainer = formData.position === 'TRAINER';
  const isReceptionist = formData.position === 'RECEPTIONIST';

  return {
    formData,
    errors,
    toast,
    isSubmitting: createMutation.isPending,
    isTrainer,
    isReceptionist,
    changeField,
    clearFieldError,
    clearAllErrors,
    handleCancel,
    handleSubmit,
    dismissToast,
  };
}

