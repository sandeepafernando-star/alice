import { Tables } from '@repo/types';
import { supabase } from '../../../lib/supabase';

export type DbWorkItem = Tables<'work_items'>;

export class WorkItemRepository {
  async listAll(): Promise<DbWorkItem[]> {
    const { data, error } = await supabase
      .from('work_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('error. failed to list work-items:', error.message);
      throw new Error('Failed to list work-items');
    }

    return data as DbWorkItem[];
  }
}

export const workItemRepository = new WorkItemRepository();
