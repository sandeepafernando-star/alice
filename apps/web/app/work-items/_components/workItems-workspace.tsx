import AttributesTable from '@/app/work-items/_components/workItems-table';
import { DbWorkItem } from '@/app/work-items/_services/workItem.service';

interface WorkItemWorkspaceProps {
  workItems: DbWorkItem[];
}

export default function WorkItemsWorkspace({
  workItems,
}: Readonly<WorkItemWorkspaceProps>) {
  return (
    <div className="w-full">
      <AttributesTable workItems={workItems} />
    </div>
  );
}
