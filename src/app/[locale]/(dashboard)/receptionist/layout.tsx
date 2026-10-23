import { AuthGuard } from '@/components/shared';
import { ReceptionistDashboardLayout } from '@/components/layout';

export default function ReceptionistLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['RECEPTIONIST', 'ADMIN']}>
      <ReceptionistDashboardLayout>{children}</ReceptionistDashboardLayout>
    </AuthGuard>
  );
}
