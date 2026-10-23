import { AuthGuard } from '@/components/shared';
import { TrainerPortalLayout } from '@/components/layout';

export default function TrainerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['TRAINER']}>
      <TrainerPortalLayout>{children}</TrainerPortalLayout>
    </AuthGuard>
  );
}
