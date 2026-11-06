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

const getTodayString = () => new Date().toISOString().split('T')[0];

const resolveInitialStatus = (data?: PackageDetail | PackageSummary | null): PackageFormStatus => {
  if (!data) return 'ACTIVE';
  const todayStr = getTodayString();
  if (data.status === 'ACTIVE' && data.effectiveStartDate && data.effectiveStartDate > todayStr) {
    return 'UPCOMING';
  }
  return (data.status as PackageFormStatus) || 'ACTIVE';
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
      setFormData((prev) => {
        const todayStr = getTodayString();

        if (field === 'status') {
          const statusVal = value as PackageFormStatus;
          if (statusVal === 'UPCOMING') {
            const isFuture = prev.effectiveStartDate && prev.effectiveStartDate > todayStr;
            const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
            return {
              ...prev,
              status: 'UPCOMING',
              effectiveStartDate: isFuture ? prev.effectiveStartDate : tomorrow,
            };
          }
          if (statusVal === 'ACTIVE') {
            const isFuture = prev.effectiveStartDate && prev.effectiveStartDate > todayStr;
            return {
              ...prev,
              status: 'ACTIVE',
              effectiveStartDate: isFuture ? todayStr : prev.effectiveStartDate,
            };
          }
          return { ...prev, status: statusVal };
        }

        if (field === 'effectiveStartDate') {
          const dateVal = String(value);
          if (!isEdit) {
            if (dateVal > todayStr && prev.status === 'ACTIVE') {
              return {
                ...prev,
                effectiveStartDate: dateVal,
                status: 'UPCOMING',
              };
            }
            if (dateVal <= todayStr && prev.status === 'UPCOMING') {
              return {
                ...prev,
                effectiveStartDate: dateVal,
                status: 'ACTIVE',
              };
            }
          }
          return { ...prev, effectiveStartDate: dateVal };
        }

        return { ...prev, [field]: value };
      });

      setErrors((prev) => {
        if (!prev[field]) return prev;
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    },
    [isEdit]
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
      status: formData.status === 'UPCOMING' ? 'ACTIVE' : formData.status,
      durationMonths: Number(formData.durationMonths),
      categoryId: formData.categoryId ? formData.categoryId : null,
      description: formData.description.trim() || null,
      effectiveStartDate: formData.effectiveStartDate,
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
        status: (formData.status === 'UPCOMING' ? 'ACTIVE' : formData.status) as PackageStatus,
        effectiveStartDate: formData.effectiveStartDate,
        mode: mode || null,
      };
    },
    [formData, validate]
  );

  return {
    formData,
    errors,
    setErrors,
    handleChange,
    resetForm,
    validate,
    getCreatePayload,
    getUpdatePayload,
  };
}

export default usePackageForm;
