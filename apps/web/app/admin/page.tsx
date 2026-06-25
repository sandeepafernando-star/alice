import { DashboardShell } from '@/components/dashboard/dashboard-shell';

export default async function AdminPage() {
  return (
    <DashboardShell
      title="Admin"
      description="Organization settings and project administration."
    >
      <div className="text-muted-foreground flex h-40 items-center justify-center rounded-lg border border-dashed text-sm">
        Admin workspace — content coming soon.
      </div>
    </DashboardShell>
  );
}
