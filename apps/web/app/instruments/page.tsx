import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { Skeleton } from '@repo/ui/components/ui/skeleton';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { getUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

function InstrumentsSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-48 w-48" />
    </div>
  );
}

async function InstrumentsData() {
  const supabase = await createClient();

  // 1. Log the session status to confirm the server sees your user
  const {
    data: { session },
  } = await supabase.auth.getSession();
  console.log('Is Server authenticated?', !!session);

  // 2. Fetch data and capture any hidden errors
  const { data: instruments, error } = await supabase
    .from('instruments')
    .select();

  if (error) {
    console.error('Supabase Database Error:', error.message);
    return <p>Error loading data: {error.message}</p>;
  }

  return <pre>{JSON.stringify(instruments, null, 2)}</pre>;
}

export default async function InstrumentsPage() {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <DashboardShell
      title="Instruments"
      description="Track your favourite instruments."
      user={user}
    >
      <Suspense fallback={<InstrumentsSkeleton />}>
        <InstrumentsData />
      </Suspense>
    </DashboardShell>
  );
}
