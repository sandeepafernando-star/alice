import { Router } from 'express';
import { z } from 'zod';
import {
  requireApiAuth,
  type AuthenticatedRequest,
} from '../../../middlewares/auth';
import { teamsService } from './teams.service';
import { createTeamSchema, updateTeamSchema } from './teams.schemas';
import { parsePagination } from '../../../lib/pagination';

const teamsRouter: Router = Router();

teamsRouter.get(
  '/',
  requireApiAuth,
  async (req: AuthenticatedRequest, res) => {
    try {
      const statusQuery = req.query.status as 'active' | 'inactive' | 'archived' | 'deleted' | undefined;
      const searchQuery = req.query.search as string | undefined;

      const pagination = parsePagination(req);
      if (pagination) {
        const { page, limit } = pagination;
        const result = await teamsService.listTeams(page, limit, statusQuery, searchQuery);
        const totalPages = Math.ceil(result.totalCount / limit);
        return res.json({
          teams: result.teams,
          totalCount: result.totalCount,
          page,
          limit,
          totalPages,
        });
      }

      const teams = await teamsService.listTeams();
      res.json({ teams });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to list teams';
      res.status(500).json({ error: message });
    }
  }
);

teamsRouter.post(
  '/',
  requireApiAuth,
  async (req: AuthenticatedRequest, res) => {
    const parsed = createTeamSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: z.treeifyError(parsed.error) });
    }

    try {
      const team = await teamsService.createTeam(
        req.userId!,
        {
          name: parsed.data.name,
          description: parsed.data.description ?? null,
          manager_id: parsed.data.manager_id,
          tech_stack: parsed.data.tech_stack ?? null,
          status: parsed.data.status ?? 'active',
        }
      );
      res.status(201).json({ team });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create team';
      res.status(500).json({ error: message });
    }
  }
);

teamsRouter.put(
  '/:id',
  requireApiAuth,
  async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Team ID is required' });
    }

    const parsed = updateTeamSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: z.treeifyError(parsed.error) });
    }

    try {
      const team = await teamsService.updateTeam(
        req.userId!,
        id,
        parsed.data
      );
      res.json({ team });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update team';
      res.status(500).json({ error: message });
    }
  }
);

teamsRouter.patch(
  '/:id/soft-delete',
  requireApiAuth,
  async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Team ID is required' });
    }

    try {
      const team = await teamsService.softDeleteTeam(
        req.userId!,
        id
      );
      res.json({ team });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to soft delete team';
      res.status(500).json({ error: message });
    }
  }
);

teamsRouter.patch(
  '/:id/restore',
  requireApiAuth,
  async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Team ID is required' });
    }

    try {
      const team = await teamsService.restoreTeam(
        req.userId!,
        id
      );
      res.json({ team });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to restore team';
      res.status(500).json({ error: message });
    }
  }
);

teamsRouter.delete(
  '/:id',
  requireApiAuth,
  async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Team ID is required' });
    }

    try {
      await teamsService.hardDeleteTeam(req.userId!, id);
      res.json({ success: true });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to hard delete team';
      res.status(500).json({ error: message });
    }
  }
);

export default teamsRouter;
