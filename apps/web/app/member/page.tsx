import { DashboardShell } from '@/components/dashboard/dashboard-shell';

export default async function MemberDashboard() {
  return (
    <DashboardShell
      title="My Work"
      description="Issues and tasks assigned to you."
    >
      <div className="text-muted-foreground flex h-40 items-center justify-center rounded-lg border border-dashed text-sm">
        Member workspace — content coming soon.
      </div>
    </DashboardShell>
  );
}
