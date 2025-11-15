"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, UserCircle } from "lucide-react";

interface Task {
  id: number;
  projectId: number;
  name: string;
  status: string;
  assignedTo: number | null;
  createdAt: string;
  updatedAt: string;
}

interface TaskListProps {
  tasks: Task[];
  teamMembers?: Array<{ id: number; name: string }>;
  onToggleStatus: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
}

export const TaskList = ({ tasks, teamMembers = [], onToggleStatus, onEdit, onDelete }: TaskListProps) => {
  const getAssigneeName = (assignedTo: number | null) => {
    if (!assignedTo) return null;
    const member = teamMembers.find(m => m.id === assignedTo);
    return member?.name || "Unknown";
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No tasks yet. Create your first task to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
        >
          <Checkbox
            checked={task.status === "complete"}
            onCheckedChange={() => onToggleStatus(task)}
            className="mt-0.5"
          />
          
          <div className="flex-1 min-w-0">
            <p className={`font-medium ${task.status === "complete" ? "line-through text-muted-foreground" : ""}`}>
              {task.name}
            </p>
            {task.assignedTo && (
              <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                <UserCircle className="h-3.5 w-3.5" />
                <span>{getAssigneeName(task.assignedTo)}</span>
              </div>
            )}
          </div>

          <Badge variant={task.status === "complete" ? "default" : "secondary"}>
            {task.status === "complete" ? "Complete" : "Incomplete"}
          </Badge>

          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(task)}
              className="h-8 w-8"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(task.id)}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
