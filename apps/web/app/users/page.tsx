import { redirect } from 'next/navigation';
import { getDbUser, getUser } from '../../lib/auth';
import type { Tables } from '@repo/types';
import { DashboardShell } from '@/app/dashboard/_components/dashboard-shell';
import { UserRegistry } from '@/app/users/_components/user-registry';
import { getUsersList } from '@/app/users/_services/users.service';

type DbUser = Tables<'users'>;

export default async function UsersDashboard() {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  const dbUser = await getDbUser();
  const currentUserRole = dbUser?.role ?? 'member';

  let usersList: DbUser[] = [];
  try {
    usersList = await getUsersList();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('error. failed to fetch users list via API:', message);
  }

  return (
    <DashboardShell
      title="Users"
      description="Manage application users, assign workspace roles, and control access."
      user={user}
    >
      <div className="w-full">
        <UserRegistry
          users={usersList}
          currentUserId={user.id}
          currentUserRole={currentUserRole}
        />
      </div>
    </DashboardShell>
  );
}
