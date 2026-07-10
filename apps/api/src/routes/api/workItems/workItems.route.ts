import { Router } from 'express';
import {
  requireApiAuth,
  type AuthenticatedRequest,
} from '../../../middlewares/auth';
import { workItemService } from './workItems.service';

const workItemsRouter: Router = Router();

workItemsRouter.get(
  '/',
  requireApiAuth,
  async (_req: AuthenticatedRequest, res) => {
    try {
      const workItems = await workItemService.listWorkItems();
      res.json({ workItems });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to list work-items';
      res.status(500).json({ error: message });
    }
  }
);

export default workItemsRouter;
