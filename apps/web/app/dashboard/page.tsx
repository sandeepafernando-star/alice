import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { DashboardOverview } from '@/components/dashboard/dashboard-overview';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/');
  }

  return (
    <DashboardShell
      title="Dashboard"
      description="Track your work and team activity at a glance."
    >
      <DashboardOverview />
    </DashboardShell>
  );
}
