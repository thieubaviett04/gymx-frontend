import { AuthGuard } from '@/components/shared';
import { AdminDashboardLayout } from '@/components/layout';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['ADMIN']}>
      <AdminDashboardLayout>{children}</AdminDashboardLayout>
    </AuthGuard>
  );
}
