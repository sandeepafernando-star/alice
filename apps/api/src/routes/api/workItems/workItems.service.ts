import { DbWorkItem, workItemRepository } from "./workItems.repository";

export class WorkItemService {
  async listWorkItems(): Promise<DbWorkItem[]> {
    return await workItemRepository.listAll();
  }
}

export const workItemService = new WorkItemService();
