import { DashboardShell } from '@/components/dashboard/dashboard-shell';

export default async function ManagerDashboard() {
  return (
    <DashboardShell
      title="Team"
      description="Manage your team's workload and sprints."
    >
      <div className="text-muted-foreground flex h-40 items-center justify-center rounded-lg border border-dashed text-sm">
        Manager workspace — content coming soon.
      </div>
    </DashboardShell>
  );
}
