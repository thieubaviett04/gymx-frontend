'use client';

import { useState, useCallback, useEffect } from 'react';
import type {
  CreatePackagePayload,
  PackageDetail,
  PackageFormData,
  PackageFormErrors,
  PackageFormStatus,
  PackageStatus,
  PackageSummary,
  UpdatePackagePayload,
} from '@/types/package';
import { validatePackageForm } from '@/lib/utils/validators';

const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getTomorrowString = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const resolveInitialStatus = (data?: PackageDetail | PackageSummary | null): PackageFormStatus => {
  if (!data) return 'ACTIVE';
  const norm = (data.status || '').toUpperCase();
  if (norm === 'PENDING' || norm === 'UPCOMING') return 'PENDING';
  if (norm === 'INACTIVE') return 'INACTIVE';
  if (norm === 'DISCONTINUED') return 'DISCONTINUED';
  return 'ACTIVE';
};

const INITIAL_PACKAGE_FORM: PackageFormData = {
  name: '',
  price: '',
  durationMonths: '1',
  categoryId: '',
  description: '',
  status: 'ACTIVE',
  effectiveStartDate: getTodayString(),
};

interface UsePackageFormOptions {
  initialData?: PackageDetail | PackageSummary | null;
  isEdit?: boolean;
}

export function usePackageForm({ initialData, isEdit = false }: UsePackageFormOptions = {}) {
  const [formData, setFormData] = useState<PackageFormData>(() => {
    if (initialData) {
      return {
        name: initialData.name || '',
        price: initialData.price !== undefined ? String(initialData.price) : '',
        durationMonths: initialData.durationMonths ? String(initialData.durationMonths) : '1',
        categoryId: initialData.categoryId || '',
        description: initialData.description || '',
        status: resolveInitialStatus(initialData),
        effectiveStartDate: initialData.effectiveStartDate || getTodayString(),
      };
    }
    return INITIAL_PACKAGE_FORM;
  });

  const [errors, setErrors] = useState<PackageFormErrors>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        price: initialData.price !== undefined ? String(initialData.price) : '',
        durationMonths: initialData.durationMonths ? String(initialData.durationMonths) : '1',
        categoryId: initialData.categoryId || '',
        description: initialData.description || '',
        status: resolveInitialStatus(initialData),
        effectiveStartDate: initialData.effectiveStartDate || getTodayString(),
      });
      setErrors({});
    } else {
      setFormData(INITIAL_PACKAGE_FORM);
      setErrors({});
    }
  }, [initialData]);

  const handleChange = useCallback(
    <K extends keyof PackageFormData>(field: K, value: PackageFormData[K]) => {
      const todayStr = getTodayString();
      let nextStatus = formData.status;
      let nextDate = formData.effectiveStartDate;

      if (field === 'status') {
        const statusVal = value as PackageFormStatus;
        nextStatus = statusVal;
        if (statusVal === 'PENDING') {
          const isFuture = formData.effectiveStartDate && formData.effectiveStartDate > todayStr;
          nextDate = isFuture ? formData.effectiveStartDate : getTomorrowString();
        } else if (statusVal === 'ACTIVE') {
          const isFuture = formData.effectiveStartDate && formData.effectiveStartDate > todayStr;
          nextDate = isFuture ? todayStr : formData.effectiveStartDate;
        } else if (statusVal === 'INACTIVE' || statusVal === 'DISCONTINUED') {
          nextDate = formData.effectiveStartDate;
        }
      } else if (field === 'effectiveStartDate') {
        nextDate = String(value || '');
      }

      setFormData((prev) => {
        if (field === 'status') {
          return { ...prev, status: nextStatus, effectiveStartDate: nextDate };
        }
        if (field === 'effectiveStartDate') {
          return { ...prev, effectiveStartDate: nextDate };
        }
        return { ...prev, [field]: value };
      });

      setErrors((prev) => {
        const updated = {
          ...prev,
          [field]: undefined,
        };

        if (field === 'status' || field === 'effectiveStartDate') {
          if (nextStatus === 'INACTIVE' || nextStatus === 'DISCONTINUED') {
            updated.effectiveStartDate = undefined;
          } else if (!nextDate) {
            updated.effectiveStartDate = 'Vui lòng chọn ngày bắt đầu áp dụng.';
          } else if (!isEdit && nextDate < todayStr) {
            updated.effectiveStartDate = 'Ngày bắt đầu áp dụng không được chọn ngày ở quá khứ.';
          } else if (nextStatus === 'PENDING' && nextDate <= todayStr) {
            updated.effectiveStartDate = 'Trạng thái chưa áp dụng không thể chọn ngày hiện tại, quá khứ';
          } else if (nextStatus === 'ACTIVE' && nextDate > todayStr) {
            updated.effectiveStartDate = 'Trạng thái đang áp dụng không thể chọn ngày tương lai';
          } else {
            updated.effectiveStartDate = undefined;
          }
        }

        return updated;
      });
    },
    [formData.effectiveStartDate, formData.status, isEdit]
  );

  const resetForm = useCallback(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        price: initialData.price !== undefined ? String(initialData.price) : '',
        durationMonths: initialData.durationMonths ? String(initialData.durationMonths) : '1',
        categoryId: initialData.categoryId || '',
        description: initialData.description || '',
        status: resolveInitialStatus(initialData),
        effectiveStartDate: initialData.effectiveStartDate || getTodayString(),
      });
    } else {
      setFormData(INITIAL_PACKAGE_FORM);
    }
    setErrors({});
  }, [initialData]);

  const validate = useCallback((): boolean => {
    const errs = validatePackageForm(formData, isEdit);
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [formData, isEdit]);

  const getCreatePayload = useCallback((): CreatePackagePayload | null => {
    if (!validate()) return null;
    return {
      name: formData.name.trim(),
      price: Number(formData.price),
      status: formData.status,
      durationMonths: Number(formData.durationMonths),
      categoryId: formData.categoryId ? formData.categoryId : null,
      description: formData.description.trim() || null,
      effectiveStartDate: formData.effectiveStartDate.split('T')[0],
    };
  }, [formData, validate]);

  const getUpdatePayload = useCallback(
    (mode?: 'DISCONTINUE_ONLY' | 'DISCONTINUE_AND_CREATE' | null): UpdatePackagePayload | null => {
      if (!validate()) return null;
      return {
        name: formData.name.trim(),
        price: Number(formData.price),
        durationMonths: Number(formData.durationMonths),
        categoryId: formData.categoryId ? formData.categoryId : null,
        description: formData.description.trim() || null,
        status: formData.status,
        effectiveStartDate: formData.effectiveStartDate.split('T')[0],
        mode: mode || null,
      };
    },
    [formData, validate]
  );

  const clearError = useCallback((field: keyof PackageFormData) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  }, []);

  return {
    formData,
    errors,
    setErrors,
    clearError,
    handleChange,
    resetForm,
    validate,
    getCreatePayload,
    getUpdatePayload,
  };
}

export default usePackageForm;
