'use client';

import { DbWorkItem } from '@/app/work-items/_services/workItem.service';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/ui/card';
import {
  AlertTriangle,
  Calendar,
  ClipboardPenLine,
  Code,
  Search,
  Shield,
} from 'lucide-react';
import { useState } from 'react';

interface WorkItemTableProps {
  readonly workItems: DbWorkItem[];
  //   readonly users: DbUser[];
  readonly currentUserId?: string | null;
  readonly currentUserRole?: string | null;
}

export default function WorkItemsTable({
  currentUserId,
  workItems,
  currentUserRole,
}: Readonly<WorkItemTableProps>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'draft' | 'published'>('draft');
  console.log(currentUserRole);

  //   const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  //   const [projectToEdit, setProjectToEdit] = useState<DbProject | null>(null);
  //   const [projectToDelete, setProjectToDelete] = useState<DbProject | null>(
  //     null
  //   );
  //   const [deleteMode, setDeleteMode] = useState<'soft' | 'hard'>('soft');
  const [error, setError] = useState<string | null>(null);
  //   const [isPending, startTransition] = useTransition();

  // const isManagerOrAdmin =
  //   currentUserRole === 'admin' || currentUserRole === 'manager';
  // const isAdmin = currentUserRole === 'admin';

  // Info if already used then remove the association first

  // Filter work-items based on search query and soft-delete status
  const filteredWorkItems = workItems.filter((workItem) => {
    const matchesSearch = workItem.title.toLowerCase().includes(
      searchQuery.toLowerCase() //)
      // ||
      // workItem.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      // workItem.description?toLowerCase().includes(searchQuery.toLowerCase()
    );

    const isDraft = workItem.status === 'Draft';

    if (filterTab === 'draft') {
      return matchesSearch && !isDraft;
    } else {
      return matchesSearch && isDraft;
    }
  });

  return (
    <div className="space-y-6">
      {error && (
        <div className="text-destructive bg-destructive/10 border-destructive/20 relative flex items-center gap-2 rounded-lg border p-3 text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto cursor-pointer text-xs hover:underline focus:outline-none"
          >
            Dismiss
          </button>
        </div>
      )}

      {/*Control Bar*/}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search workitems by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-input bg-background/50 placeholder:text-muted-foreground focus-visible:ring-primary flex h-10 w-full rounded-md border py-2 pr-4 pl-10 text-sm transition-all focus-visible:ring-2 focus-visible:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Tabs */}
          <div className="bg-muted/50 border-border text-muted-foreground inline-flex h-10 items-center justify-center rounded-md border p-1">
            <button
              onClick={() => setFilterTab('draft')}
              className={`ring-offset-background inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 ${
                filterTab === 'draft'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'hover:text-foreground'
              }`}
            >
              Draft
            </button>
            <button
              onClick={() => setFilterTab('published')}
              className={`ring-offset-background inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 ${
                filterTab === 'published'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'hover:text-foreground'
              }`}
            >
              Published
            </button>
          </div>
        </div>
      </div>

      {/* Work-Items list */}
      <Card className="border-border bg-card/50 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Code className="text-primary h-5 w-5" />
            Work-Items Table
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            {filterTab === 'draft'
              ? 'View and manage drafted work-items for use in projects.'
              : 'Publish drafted work-items, or delete them from the database.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredWorkItems.length === 0 ? (
            <div className="text-muted-foreground flex h-60 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-sm">
              <ClipboardPenLine className="text-muted-foreground/50 h-8 w-8 animate-bounce stroke-1" />
              <p>No work-items found matching the criteria.</p>
            </div>
          ) : (
            <div className="divide-border divide-y">
              {filteredWorkItems.map((workItem) => {
                const assigneeName =
                  workItem.assignee?.name ?? 'Unknown Assignee';
                const assigneeEmail = workItem.assignee?.email ?? '';
                const isAssignedToSelf = workItem.assignee_id === currentUserId;

                return (
                  <div
                    key={workItem.id}
                    className="group flex flex-col justify-between gap-4 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 text-primary border-primary/20 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border text-sm font-bold shadow-sm transition-all duration-300 group-hover:scale-105">
                        {workItem.title.slice(0, 2)}
                      </div>
                      <div className="min-w-0 space-y-1">
                        <h4 className="text-foreground group-hover:text-primary flex items-center gap-2 text-sm leading-none font-semibold transition-colors">
                          {workItem.title}
                          {workItem.status !== 'Draft' && (
                            <span className="py-0.2 rounded-full border border-amber-500/20 bg-amber-500/10 px-1.5 text-[10px] font-semibold tracking-normal text-amber-600 uppercase">
                              Published
                            </span>
                          )}
                        </h4>
                        {workItem.description && (
                          <p className="text-muted-foreground line-clamp-1 text-xs">
                            {JSON.stringify(workItem.description, null, 2)}
                          </p>
                        )}
                        <span className="text-muted-foreground flex items-center gap-1 text-xs">
                          <Shield className="h-3 w-3" />
                          <span>
                            Assignee:{' '}
                            <strong className="text-foreground">
                              {assigneeName}
                            </strong>
                            {assigneeEmail && ` (${assigneeEmail})`}
                            {isAssignedToSelf && (
                              <span className="bg-primary/25 border-primary/30 text-primary py-0.2 ml-1.5 rounded-full border px-1.5 text-[9px] font-semibold tracking-normal uppercase">
                                You
                              </span>
                            )}
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pl-13 sm:gap-4 sm:pl-0">
                      <span className="text-muted-foreground flex items-center gap-1 text-xs">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {workItem.created_at || workItem.due_date ? (
                            <>
                              {workItem.created_at
                                ? new Date(
                                    workItem.created_at
                                  ).toLocaleDateString(undefined, {
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : 'Start'}
                              {' — '}
                              {workItem.due_date
                                ? new Date(
                                    workItem.due_date
                                  ).toLocaleDateString(undefined, {
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : 'End'}
                            </>
                          ) : (
                            'No timeline configured'
                          )}
                        </span>
                      </span>

                      {/* Actions */}
                      {/* <div className="flex items-center gap-1">
                        {filterTab === 'draft' ? (
                          <>
                            {isManagerOrAdmin && (
                              <button
                                onClick={() => {
                                  setProjectToEdit(proj);
                                }}
                                className="border-input hover:bg-accent text-foreground focus-visible:ring-ring flex h-8 cursor-pointer items-center justify-center rounded-md border px-3 text-xs font-semibold shadow-sm transition-all focus-visible:ring-2 focus-visible:outline-none"
                              >
                                Edit
                              </button>
                            )}
                            {isManagerOrAdmin && (
                              <button
                                disabled={isPending}
                                onClick={() => handleSoftDelete(proj)}
                                className="focus-visible:ring-ring flex h-8 cursor-pointer items-center justify-center rounded-md border border-rose-500/20 bg-rose-500/10 px-3 text-xs font-semibold text-rose-600 shadow-sm transition-all hover:bg-rose-600 hover:text-white focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
                              >
                                Delete
                              </button>
                            )}
                          </>
                        ) : (
                          <>
                            {isManagerOrAdmin && (
                              <button
                                disabled={isPending}
                                onClick={() => handleRestore(proj)}
                                className="focus-visible:ring-ring flex h-8 cursor-pointer items-center justify-center rounded-md border border-emerald-500/20 bg-emerald-500/10 px-3 text-xs font-semibold text-emerald-600 shadow-sm transition-all hover:bg-emerald-600 hover:text-white focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
                              >
                                <RefreshCw className="mr-1 h-3 w-3" />
                                Restore
                              </button>
                            )}
                            {isAdmin && (
                              <button
                                disabled={isPending}
                                onClick={() => handleHardDelete(proj)}
                                className="focus-visible:ring-ring flex h-9 cursor-pointer items-center justify-center rounded-md border border-rose-500/20 bg-rose-500/10 px-3 text-xs font-semibold text-rose-600 shadow-sm transition-all hover:bg-rose-600 hover:text-white focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
                              >
                                <Trash2 className="mr-1 h-3 w-3" />
                                Purge
                              </button>
                            )}
                          </>
                        )}
                      </div> */}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      {/* {isAddProjectOpen && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm duration-200">
          <div className="animate-in fade-in zoom-in-95 w-full max-w-lg overflow-hidden duration-200">
            <ProjectForm
              users={users}
              onClose={() => setIsAddProjectOpen(false)}
              onSuccess={() => setIsAddProjectOpen(false)}
            />
          </div>
        </div>
      )}

      {projectToEdit && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm duration-200">
          <div className="animate-in fade-in zoom-in-95 w-full max-w-lg overflow-hidden duration-200">
            <ProjectForm
              users={users}
              projectToEdit={projectToEdit}
              onClose={() => setProjectToEdit(null)}
              onSuccess={() => setProjectToEdit(null)}
            />
          </div>
        </div>
      )} */}

      {/* Delete Confirmation Modal */}
      {/* {projectToDelete && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm duration-200">
          <dialog
            open
            className="bg-card border-border animate-in fade-in zoom-in-95 relative block w-full max-w-md overflow-hidden rounded-xl border shadow-2xl duration-200"
            aria-modal="true"
          >
            <div className="p-6">
              <div className="mb-3 flex items-center gap-3 text-rose-500">
                <div className="rounded-full border border-rose-500/20 bg-rose-500/10 p-2">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <h3 className="text-foreground text-lg font-bold">
                  {deleteMode === 'soft'
                    ? 'Archive Project'
                    : 'Permanently Delete Project'}
                </h3>
              </div>

              <p className="text-muted-foreground text-sm leading-relaxed">
                Are you sure you want to
                {deleteMode === 'soft' ? ' archive ' : ' permanently delete '}
                <strong className="text-foreground">
                  {projectToDelete.name} ({projectToDelete.key})
                </strong>
                {' ?'}
              </p>
              <p className="text-muted-foreground/80 bg-muted/50 border-border/40 mt-2 rounded-lg border p-2.5 text-xs">
                {deleteMode === 'soft'
                  ? 'It will be hidden from the active projects list, but can be restored later from the Archived tab.'
                  : 'Warning: This action is irreversible. All issues, sprints, and comments associated with this project will be permanently destroyed.'}
              </p>
            </div>

            <div className="bg-muted/40 border-border flex justify-end gap-3 border-t px-6 py-4">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setProjectToDelete(null)}
                className="border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-9 cursor-pointer items-center justify-center rounded-md border px-4 text-xs font-semibold shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={confirmDelete}
                className="focus-visible:ring-ring inline-flex h-9 cursor-pointer items-center justify-center rounded-md bg-rose-600 px-4 text-xs font-semibold text-white shadow-sm transition-all hover:bg-rose-700 focus-visible:ring-2 focus-visible:outline-none"
              >
                {deleteButtonText}
              </button>
            </div>
          </dialog>
        </div>
      )} */}
    </div>
  );
}
