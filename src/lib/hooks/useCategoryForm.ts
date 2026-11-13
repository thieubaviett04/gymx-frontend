'use client';

import { useState, useCallback, useEffect } from 'react';
import type {
  CreatePackageCategoryPayload,
  PackageCategoryDetail,
  PackageCategoryFormData,
  PackageCategoryFormErrors,
  PackageCategoryStatus,
  PackageCategorySummary,
  UpdatePackageCategoryPayload,
} from '@/types/packageCategory';

const INITIAL_CATEGORY_FORM: PackageCategoryFormData = {
  code: '',
  name: '',
  description: '',
  status: 'ACTIVE',
};

interface UseCategoryFormOptions {
  initialData?: PackageCategoryDetail | PackageCategorySummary | null;
  isEdit?: boolean;
}

export function useCategoryForm({ initialData, isEdit = false }: UseCategoryFormOptions = {}) {
  const [formData, setFormData] = useState<PackageCategoryFormData>(() => {
    if (initialData) {
      return {
        code: initialData.code || '',
        name: initialData.name || '',
        description: initialData.description || '',
        status: initialData.status || 'ACTIVE',
      };
    }
    return INITIAL_CATEGORY_FORM;
  });

  const [errors, setErrors] = useState<PackageCategoryFormErrors>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        code: initialData.code || '',
        name: initialData.name || '',
        description: initialData.description || '',
        status: initialData.status || 'ACTIVE',
      });
      setErrors({});
    } else {
      setFormData(INITIAL_CATEGORY_FORM);
      setErrors({});
    }
  }, [initialData]);

  const handleChange = useCallback(
    <K extends keyof PackageCategoryFormData>(field: K, value: PackageCategoryFormData[K]) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    },
    []
  );

  const clearError = useCallback((field: keyof PackageCategoryFormErrors) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      return {
        ...prev,
        [field]: undefined,
      };
    });
  }, []);

  const resetForm = useCallback(() => {
    if (initialData) {
      setFormData({
        code: initialData.code || '',
        name: initialData.name || '',
        description: initialData.description || '',
        status: initialData.status || 'ACTIVE',
      });
    } else {
      setFormData(INITIAL_CATEGORY_FORM);
    }
    setErrors({});
  }, [initialData]);

  const validate = useCallback(() => {
    const newErrors: PackageCategoryFormErrors = {};

    if (!isEdit) {
      const trimmedCode = formData.code.trim();
      if (!trimmedCode) {
        newErrors.code = 'Vui lòng nhập mã danh mục.';
      } else if (!/^[A-Z0-9_]{3,20}$/.test(trimmedCode)) {
        newErrors.code = 'Mã danh mục chỉ gồm chữ in hoa, số và dấu gạch dưới (3–20 ký tự).';
      }
    }

    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      newErrors.name = 'Vui lòng nhập tên danh mục.';
    } else if (trimmedName.length > 100) {
      newErrors.name = 'Tên danh mục không được vượt quá 100 ký tự.';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Mô tả không được vượt quá 500 ký tự.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, isEdit]);

  const getCreatePayload = useCallback((): CreatePackageCategoryPayload | null => {
    if (!validate()) return null;
    return {
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim(),
      description: formData.description.trim() || null,
    };
  }, [formData, validate]);

  const getUpdatePayload = useCallback((): UpdatePackageCategoryPayload | null => {
    if (!validate()) return null;
    return {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      status: formData.status,
    };
  }, [formData, validate]);

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

export default useCategoryForm;

