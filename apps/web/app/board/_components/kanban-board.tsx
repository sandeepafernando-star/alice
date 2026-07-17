'use client';

import React, { useState } from 'react';
import { cn } from '@repo/ui/lib/utils';

import {
  Search,
  Trash2,
  Calendar,
  Tag,
  Filter,
  Info,
  AlertCircle,
  HelpCircle,
  FolderDot,
} from '@repo/ui/lib/icons';
import { Card, CardContent } from '@repo/ui/components/ui/card';
import { Badge } from '@repo/ui/components/ui/badge';
import { Button } from '@repo/ui/components/ui/button';
import { Input } from '@repo/ui/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@repo/ui/components/ui/dialog';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@repo/ui/components/ui/select';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@repo/ui/components/ui/tooltip';

// Define TS types for the Kanban Board
type Status = 'ToDo' | 'InProgress' | 'InReview' | 'Done';
type Priority = 'low' | 'medium' | 'high';

interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  assignee: string;
  category: string;
  dueDate: string;
}

function createTask(
  id: string,
  title: string,
  description: string,
  statusAndPriority: string,
  assignee: string,
  category: string,
  dueDate: string
): Task {
  const [status, priority] = statusAndPriority.split(':') as [Status, Priority];
  return {
    id,
    title,
    description,
    status,
    priority,
    assignee,
    category,
    dueDate,
  };
}

// Initial realistic task data
const INITIAL_TASKS: Task[] = [
  createTask(
    'ALICE-101',
    'Integrate Supabase Auth',
    'Setup Supabase SSR authentication client and middleware for secure route protection.',
    'ToDo:high',
    'Alice Smith',
    'Security',
    '2026-07-20'
  ),
  createTask(
    'ALICE-104',
    'Design Landing Page Hero Section',
    'Implement modern glassmorphism aesthetic with floating particles and grid layout.',
    'ToDo:medium',
    'Bob Jones',
    'Design',
    '2026-07-25'
  ),
  createTask(
    'ALICE-102',
    'Create Reusable Table Component',
    'Build a generic table with sorting, search filtering, and paginated pagination state.',
    'InProgress:high',
    'Charlie Brown',
    'UI Components',
    '2026-07-18'
  ),
  createTask(
    'ALICE-105',
    'Write API Integration Tests',
    'Write robust integration test suites for project services and database operations.',
    'InProgress:low',
    'David Green',
    'QA / Testing',
    '2026-07-30'
  ),
  createTask(
    'ALICE-103',
    'Setup GitHub Actions CI Pipeline',
    'Setup standard GitHub actions workflow to run linters, typechecks, and tests automatically.',
    'InReview:high',
    'Alice Smith',
    'DevOps',
    '2026-07-16'
  ),
  createTask(
    'ALICE-100',
    'Monorepo Workspace Initialization',
    'Configure pnpm-workspace and turbo pipelines for web apps and packages packages.',
    'Done:medium',
    'Eve White',
    'Infrastructure',
    '2026-07-10'
  ),
];

const COLUMNS: {
  id: Status;
  title: string;
  color: string;
  border: string;
  bg: string;
}[] = [
  {
    id: 'ToDo',
    title: 'To Do',
    color: 'text-zinc-600 dark:text-zinc-400',
    border: 'border-t-zinc-500',
    bg: 'bg-zinc-50/50 dark:bg-zinc-900/10',
  },
  {
    id: 'InProgress',
    title: 'In Progress',
    color: 'text-amber-600 dark:text-amber-400',
    border: 'border-t-amber-500',
    bg: 'bg-amber-50/20 dark:bg-amber-950/5',
  },
  {
    id: 'InReview',
    title: 'In Review',
    color: 'text-cyan-600 dark:text-cyan-400',
    border: 'border-t-cyan-500',
    bg: 'bg-cyan-50/20 dark:bg-cyan-950/5',
  },
  {
    id: 'Done',
    title: 'Done',
    color: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-t-emerald-500',
    bg: 'bg-emerald-50/20 dark:bg-emerald-950/5',
  },
];

const ASSIGNEE_COLORS: Record<string, string> = {
  'Alice Smith': 'bg-purple-500 hover:bg-purple-600',
  'Bob Jones': 'bg-emerald-500 hover:bg-emerald-600',
  'Charlie Brown': 'bg-indigo-500 hover:bg-indigo-600',
  'David Green': 'bg-orange-500 hover:bg-orange-600',
  'Eve White': 'bg-pink-500 hover:bg-pink-600',
};

const getAssigneeColorClass = (name: string) => {
  return ASSIGNEE_COLORS[name] ?? 'bg-zinc-500 hover:bg-zinc-600';
};

const PRIORITY_BORDERS: Record<Priority, string> = {
  high: 'border-l-red-500',
  medium: 'border-l-blue-500',
  low: 'border-l-zinc-300 dark:border-l-zinc-700',
};

export function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string | null>(null);

  // Drag and Drop active column state (for visual effect)
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [activeDropCol, setActiveDropCol] = useState<Status | null>(null);

  // Modals state
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedTaskId(id);
  };

  const handleDragOver = (e: React.DragEvent, colId: Status) => {
    e.preventDefault();
    if (activeDropCol !== colId) {
      setActiveDropCol(colId);
    }
  };

  const handleDragLeave = () => {
    setActiveDropCol(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: Status) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (id) {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: targetStatus } : t))
      );
    }
    setDraggedTaskId(null);
    setActiveDropCol(null);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setActiveDropCol(null);
  };

  // Move task via button click (accessiblity helper / backup)
  const moveTask = (taskId: string, targetStatus: Status) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: targetStatus } : t))
    );
    if (selectedTask?.id === taskId) {
      setSelectedTask((prev) =>
        prev ? { ...prev, status: targetStatus } : null
      );
    }
  };

  // Get unique assignees (excluding 'Unassigned')
  const uniqueAssignees = Array.from(
    new Set(
      tasks
        .map((t) => t.assignee)
        .filter((name) => name && name !== 'Unassigned')
    )
  );

  const handleAssigneeClick = (name: string) => {
    setAssigneeFilter((prev) => (prev === name ? null : name));
  };

  // Filter tasks based on Search and Priority selection
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.id.toLowerCase().includes(search.toLowerCase()) ||
      task.description.toLowerCase().includes(search.toLowerCase()) ||
      task.assignee.toLowerCase().includes(search.toLowerCase());

    const matchesPriority =
      priorityFilter === 'all' || task.priority === priorityFilter;

    const matchesAssignee = !assigneeFilter || task.assignee === assigneeFilter;

    return matchesSearch && matchesPriority && matchesAssignee;
  });

  // Handle delete task
  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setIsDetailOpen(false);
    setSelectedTask(null);
  };

  // Badge priority stylers
  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'high':
        return (
          <Badge
            variant="destructive"
            className="px-2 py-0.5 text-xs font-semibold capitalize"
          >
            <AlertCircle className="mr-1 inline h-3.5 w-3.5" />
            High
          </Badge>
        );
      case 'medium':
        return (
          <Badge
            variant="default"
            className="bg-blue-500 px-2 py-0.5 text-xs font-semibold text-white capitalize hover:bg-blue-600 dark:bg-blue-600"
          >
            <Info className="mr-1 inline h-3.5 w-3.5" />
            Medium
          </Badge>
        );
      case 'low':
        return (
          <Badge
            variant="secondary"
            className="px-2 py-0.5 text-xs font-semibold capitalize"
          >
            <HelpCircle className="mr-1 inline h-3.5 w-3.5" />
            Low
          </Badge>
        );
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="mx-auto flex h-full w-full max-w-7xl flex-col gap-6">
      {/* Kanban Board Controls */}
      <div className="bg-card/60 flex flex-col justify-between gap-4 rounded-xl border p-4 shadow-sm backdrop-blur-md md:flex-row md:items-center">
        <div className="flex w-full flex-1 flex-col items-center gap-3 sm:flex-row">
          <div className="relative w-full sm:max-w-xs">
            <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
            <Input
              placeholder="Search board tasks..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Assignee Avatars */}
          <div className="mx-1 flex shrink-0 items-center gap-1.5 border-r border-l border-zinc-200 px-1 dark:border-zinc-800">
            <span className="text-muted-foreground mr-1 hidden text-[10px] font-bold uppercase lg:inline">
              Assignees:
            </span>
            <div className="flex items-center -space-x-2 transition-all duration-300">
              {uniqueAssignees.slice(0, 3).map((assignee) => {
                const isSelected = assigneeFilter === assignee;
                const initials = getInitials(assignee);
                const colorClass = getAssigneeColorClass(assignee);

                return (
                  <Tooltip key={assignee}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => handleAssigneeClick(assignee)}
                        className={cn(
                          'border-background group/avatar relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 text-[10px] font-bold text-white shadow-sm transition-all',
                          colorClass,
                          isSelected
                            ? 'ring-primary z-20 scale-110 ring-2 ring-offset-2'
                            : 'opacity-80 hover:z-10 hover:-translate-y-0.5 hover:opacity-100',
                          assigneeFilter && !isSelected && 'opacity-40'
                        )}
                      >
                        {initials}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="px-2 py-1 text-[10px] font-medium"
                    >
                      {assignee} {isSelected ? '(Filter Active)' : ''}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
              {uniqueAssignees.length > 3 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="border-background group/more relative flex h-8 w-8 cursor-help items-center justify-center rounded-full border-2 bg-zinc-100 text-[10px] font-bold text-zinc-600 shadow-sm dark:bg-zinc-800 dark:text-zinc-400">
                      +{uniqueAssignees.length - 3}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    className="flex max-w-xs flex-col gap-0.5 border px-2.5 py-1.5 text-[10px] font-medium shadow-lg"
                  >
                    {uniqueAssignees.slice(3).map((assignee) => (
                      <span key={assignee}>{assignee}</span>
                    ))}
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            {assigneeFilter && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAssigneeFilter(null)}
                className="text-muted-foreground hover:text-foreground h-7 px-2 text-[10px]"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Priority Filter */}
        <div className="flex w-full items-center gap-2 md:w-auto">
          <Filter className="text-muted-foreground h-4 w-4 shrink-0" />
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full md:w-37.5">
              <SelectValue placeholder="Priority: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High Priority</SelectItem>
              <SelectItem value="medium">Medium Priority</SelectItem>
              <SelectItem value="low">Low Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Board Columns Grid */}
      <div className="grid min-h-125 flex-1 grid-cols-1 items-start gap-5 md:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);
          const isOver = activeDropCol === col.id;

          return (
            <div
              key={col.id}
              className={`flex h-full flex-col rounded-2xl border ${col.border} border-t-4 p-4 transition-colors duration-200 ${col.bg} ${
                isOver
                  ? 'border-2 border-dashed bg-zinc-100/50 dark:bg-zinc-800/10'
                  : ''
              }`}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              {/* Column Header */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${col.color}`}>
                    {col.title}
                  </span>
                  <Badge
                    variant="secondary"
                    className="rounded-full px-2 py-0.5 text-xs font-semibold"
                  >
                    {colTasks.length}
                  </Badge>
                </div>
              </div>

              {/* Tasks List */}
              <div className="flex max-h-150 grow flex-col gap-3 overflow-y-auto pr-1">
                {colTasks.length === 0 ? (
                  <div className="text-muted-foreground flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 px-4 py-12 text-center text-xs select-none dark:border-zinc-800">
                    <FolderDot className="mb-2 h-8 w-8 stroke-1 text-zinc-300 dark:text-zinc-700" />
                    No tasks in this stage
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <Card
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => {
                        setSelectedTask(task);
                        setIsDetailOpen(true);
                      }}
                      className={cn(
                        'group relative cursor-pointer rounded-l-none border-y-0 border-r-0 border-l-4 transition-all duration-200 hover:shadow-md',
                        PRIORITY_BORDERS[task.priority],
                        draggedTaskId === task.id
                          ? 'scale-95 opacity-40'
                          : 'hover:scale-[1.01]'
                      )}
                    >
                      <CardContent className="flex flex-col gap-2 p-4">
                        <div className="mb-1 flex items-start justify-between gap-2">
                          <span className="font-mono text-[10px] font-bold tracking-wider text-zinc-400">
                            {task.id}
                          </span>
                          {getPriorityBadge(task.priority)}
                        </div>

                        <h4 className="group-hover:text-primary text-sm leading-tight font-semibold text-zinc-800 transition-colors dark:text-zinc-100">
                          {task.title}
                        </h4>

                        <p className="text-muted-foreground mt-1 line-clamp-2 text-xs leading-relaxed">
                          {task.description}
                        </p>

                        <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-2.5 dark:border-zinc-800/80">
                          <span className="flex items-center rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800">
                            <Tag className="mr-1 h-2.5 w-2.5" />
                            {task.category}
                          </span>

                          <div
                            className="flex items-center gap-1.5"
                            title={`Assignee: ${task.assignee}`}
                          >
                            <div className="bg-primary/10 border-primary/20 text-primary flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-bold">
                              {getInitials(task.assignee)}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Details Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="border-l-primary bg-card/95 border-l-4 backdrop-blur-lg sm:max-w-xl">
          {selectedTask && (
            <>
              <DialogHeader>
                <div className="mb-2 flex items-center justify-between pr-6">
                  <span className="text-muted-foreground bg-muted rounded px-2 py-1 font-mono text-xs font-bold">
                    {selectedTask.id}
                  </span>
                  {getPriorityBadge(selectedTask.priority)}
                </div>
                <DialogTitle className="text-xl font-bold">
                  {selectedTask.title}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Manage tasks details, status movement and task parameters.
                </DialogDescription>
              </DialogHeader>

              <div className="my-4 space-y-4 text-sm leading-relaxed">
                <div>
                  <h5 className="mb-1 text-xs font-semibold tracking-wider text-zinc-400 uppercase dark:text-zinc-500">
                    Description
                  </h5>
                  <p className="bg-muted/40 rounded-xl border p-3 leading-relaxed text-zinc-700 dark:text-zinc-300">
                    {selectedTask.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      label: 'Assignee',
                      content: (
                        <div className="flex items-center gap-2">
                          <div className="bg-primary flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm">
                            {getInitials(selectedTask.assignee)}
                          </div>
                          <span className="text-xs font-medium">
                            {selectedTask.assignee}
                          </span>
                        </div>
                      ),
                    },
                    {
                      label: 'Category',
                      content: (
                        <span className="inline-flex items-center gap-1 text-xs font-medium">
                          <Tag className="text-primary h-3.5 w-3.5" />
                          {selectedTask.category}
                        </span>
                      ),
                    },
                    {
                      label: 'Due Date',
                      content: (
                        <span className="inline-flex items-center gap-1 text-xs font-medium">
                          <Calendar className="text-primary h-3.5 w-3.5" />
                          {selectedTask.dueDate}
                        </span>
                      ),
                    },
                    {
                      label: 'Current Status',
                      content: (
                        <span className="text-xs font-semibold text-zinc-700 capitalize dark:text-zinc-300">
                          {
                            COLUMNS.find((c) => c.id === selectedTask.status)
                              ?.title
                          }
                        </span>
                      ),
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="bg-muted/20 rounded-lg border p-2.5"
                    >
                      <span className="mb-1 block text-[10px] font-bold tracking-wider text-zinc-400 uppercase dark:text-zinc-500">
                        {item.label}
                      </span>
                      {item.content}
                    </div>
                  ))}
                </div>

                <div>
                  <h5 className="mb-2 text-xs font-semibold tracking-wider text-zinc-400 uppercase dark:text-zinc-500">
                    Quick Move Status
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {COLUMNS.map((col) => (
                      <Button
                        key={col.id}
                        variant={
                          selectedTask.status === col.id ? 'default' : 'outline'
                        }
                        size="sm"
                        className="px-2.5 py-1 text-xs"
                        onClick={() => moveTask(selectedTask.id, col.id)}
                      >
                        {col.title}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-4 gap-2 border-t pt-4 sm:gap-0">
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteTask(selectedTask.id)}
                  className="mr-auto text-xs"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Task
                </Button>
                <DialogClose asChild>
                  <Button variant="secondary" className="text-xs">
                    Close
                  </Button>
                </DialogClose>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
