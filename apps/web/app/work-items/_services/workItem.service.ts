import { apiFetch } from '@/lib/api/api-client.server';
import { Tables } from '@repo/types';

type DbUser = Tables<'users'>;
export type DbWorkItem = Tables<'work_items'> & {
  assignee: Pick<DbUser, 'id' | 'name' | 'email'> | null;
};

const workItemsPath = '/api/workItems';

export async function getWorkItems(): Promise<DbWorkItem[]> {
  const data = await apiFetch<{ workItems: DbWorkItem[] }>(
    workItemsPath
  );
  return data.workItems;
}
