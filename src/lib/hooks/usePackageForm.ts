'use client';

import { useState, useCallback, useEffect } from 'react';
import type {
  CreatePackagePayload,
  PackageDetail,
  PackageFormData,
  PackageFormErrors,
  PackageSummary,
  UpdatePackagePayload,
} from '@/types/package';
import { validatePackageForm } from '@/lib/utils/validators';

const getTodayString = () => new Date().toISOString().split('T')[0];

const INITIAL_PACKAGE_FORM: PackageFormData = {
  name: '',
  price: '',
  durationMonths: '1',
  maxCheckins: '',
  description: '',
  status: 'ACTIVE',
  effectiveStartDate: getTodayString(),
  effectiveEndDate: '',
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
        maxCheckins: initialData.maxCheckins != null ? String(initialData.maxCheckins) : '',
        description: initialData.description || '',
        status: initialData.status || 'ACTIVE',
        effectiveStartDate: initialData.effectiveStartDate || getTodayString(),
        effectiveEndDate: initialData.effectiveEndDate || '',
      };
    }
    return INITIAL_PACKAGE_FORM;
  });

  const [errors, setErrors] = useState<PackageFormErrors>({});

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        price: initialData.price !== undefined ? String(initialData.price) : '',
        durationMonths: initialData.durationMonths ? String(initialData.durationMonths) : '1',
        maxCheckins: initialData.maxCheckins != null ? String(initialData.maxCheckins) : '',
        description: initialData.description || '',
        status: initialData.status || 'ACTIVE',
        effectiveStartDate: initialData.effectiveStartDate || getTodayString(),
        effectiveEndDate: initialData.effectiveEndDate || '',
      });
      setErrors({});
    } else {
      setFormData(INITIAL_PACKAGE_FORM);
      setErrors({});
    }
  }, [initialData]);

  const handleChange = useCallback((field: keyof PackageFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  }, []);

  const resetForm = useCallback(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        price: initialData.price !== undefined ? String(initialData.price) : '',
        durationMonths: initialData.durationMonths ? String(initialData.durationMonths) : '1',
        maxCheckins: initialData.maxCheckins != null ? String(initialData.maxCheckins) : '',
        description: initialData.description || '',
        status: initialData.status || 'ACTIVE',
        effectiveStartDate: initialData.effectiveStartDate || getTodayString(),
        effectiveEndDate: initialData.effectiveEndDate || '',
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
      durationMonths: Number(formData.durationMonths),
      maxCheckins: formData.maxCheckins !== '' ? Number(formData.maxCheckins) : null,
      description: formData.description.trim() || null,
      effectiveStartDate: formData.effectiveStartDate,
      effectiveEndDate: formData.effectiveEndDate || null,
    };
  }, [formData, validate]);

  const getUpdatePayload = useCallback(
    (mode?: 'DISCONTINUE_ONLY' | 'DISCONTINUE_AND_CREATE' | null): UpdatePackagePayload | null => {
      if (!validate()) return null;
      return {
        name: formData.name.trim(),
        price: Number(formData.price),
        durationMonths: Number(formData.durationMonths),
        maxCheckins: formData.maxCheckins !== '' ? Number(formData.maxCheckins) : null,
        description: formData.description.trim() || null,
        status: formData.status,
        effectiveStartDate: formData.effectiveStartDate,
        effectiveEndDate: formData.effectiveEndDate || null,
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

