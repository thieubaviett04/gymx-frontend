'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/routing';

export default function AdminPayrollPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/payroll/formulas');
  }, [router]);

  return null;
}
