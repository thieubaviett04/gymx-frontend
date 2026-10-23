import { AuthGuard } from '@/components/shared';
import { MemberPortalLayout } from '@/components/layout';

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['MEMBER']}>
      <MemberPortalLayout>{children}</MemberPortalLayout>
    </AuthGuard>
  );
}
