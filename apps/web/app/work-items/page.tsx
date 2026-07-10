import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { DashboardShell } from '@/app/dashboard/_components/dashboard-shell';
import { getWorkItems } from '@/app/work-items/_services/workItem.service';
import WorkItemsWorkspace from '@/app/work-items/_components/workItems-workspace';

export default async function TasksDashboard() {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  /** Custom RBAC: load role from application database once implemented. */

  const initialWorkItems = await getWorkItems();

  return (
    <DashboardShell
      title="Work Items"
      description="Manage Work Items."
      user={user}
    >
      <WorkItemsWorkspace workItems={initialWorkItems} />
    </DashboardShell>
  );
}
