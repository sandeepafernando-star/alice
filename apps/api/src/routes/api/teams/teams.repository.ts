import { supabase } from '../../../lib/supabase';
import { auditCreateWithoutStatus, auditUpdate } from '../../../lib/audit';

export type TeamRow = {
  id: string;
  name: string;
  description: string | null;
  manager_id: string;
  tech_stack: string | null;
  status: 'active' | 'inactive' | 'archived' | 'deleted';
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

export type TeamRowWithManager = TeamRow & {
  manager?: {
    id: string;
    name: string;
    email: string;
  } | null;
};

function unsafeCast<T>(val: unknown): T {
  return val as T;
}

export class TeamsRepository {
  async listAll(): Promise<TeamRowWithManager[]> {
    const { data, error } = await supabase
      .from('teams')
      .select('*, manager:users!teams_manager_id_fkey(id, name, email)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('error. failed to list teams:', error.message);
      throw new Error('Failed to list teams');
    }

    return unsafeCast<TeamRowWithManager[]>(data);
  }

  async listPaginated(
    page: number,
    limit: number,
    status?: 'active' | 'inactive' | 'archived' | 'deleted',
    search?: string
  ): Promise<{ teams: TeamRowWithManager[]; totalCount: number }> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('teams')
      .select('*, manager:users!teams_manager_id_fkey(id, name, email)', { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      const sanitized = `%${search}%`;
      query = query.or(`name.ilike.${sanitized},description.ilike.${sanitized},tech_stack.ilike.${sanitized}`);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('error. failed to list teams paginated:', error.message);
      throw new Error('Failed to list teams');
    }

    return {
      teams: unsafeCast<TeamRowWithManager[]>(data ?? []),
      totalCount: count ?? 0,
    };
  }

  async findByName(name: string, excludeId?: string): Promise<TeamRow | null> {
    let query = supabase.from('teams').select('*').eq('name', name);
    if (excludeId) {
      query = query.neq('id', excludeId);
    }
    const { data, error } = await query.maybeSingle();
    if (error) {
      console.error('error. failed to find team by name:', error.message);
      throw new Error('Failed to check duplicate team name');
    }
    return data;
  }

  async findById(id: string): Promise<TeamRow | null> {
    const { data, error } = await supabase.from('teams').select('*').eq('id', id).maybeSingle();
    if (error) {
      console.error('error. failed to find team by id:', error.message);
      throw new Error('Failed to find team');
    }
    return data;
  }

  async create(data: Omit<TeamRow, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>, actorId: string): Promise<TeamRow> {
    const insertData = {
      ...data,
      ...auditCreateWithoutStatus(actorId),
    };
    const { data: created, error } = await supabase
      .from('teams')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('error. failed to create team:', error.message);
      throw new Error(`Database insertion failed: ${error.message}`);
    }

    return created;
  }

  async update(id: string, data: Partial<Omit<TeamRow, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>>, actorId: string): Promise<TeamRow> {
    const updateData = {
      ...data,
      ...auditUpdate(actorId),
    };
    const { data: updated, error } = await supabase
      .from('teams')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('error. failed to update team:', error.message);
      throw new Error(`Database update failed: ${error.message}`);
    }

    return updated;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('error. failed to delete team:', error.message);
      throw new Error(`Database delete failed: ${error.message}`);
    }
  }
}

export const teamsRepository = new TeamsRepository();
