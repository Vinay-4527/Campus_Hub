import Layout from '@/components/layout/Layout';
import RequireAuth from '@/components/auth/RequireAuth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <Layout>{children}</Layout>
    </RequireAuth>
  );
}



