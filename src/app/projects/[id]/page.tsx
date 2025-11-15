"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TaskList } from "@/components/workspace/task-list";
import { TaskDialog } from "@/components/workspace/task-dialog";
import { InsightsPanel } from "@/components/workspace/insights-panel";
import { ArrowLeft, Plus, Pencil, Calendar } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { ProjectDialog } from "@/components/workspace/project-dialog";

interface Project {
  id: number;
  name: string;
  status: string;
  progress: number;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Task {
  id: number;
  projectId: number;
  name: string;
  status: string;
  assignedTo: number | null;
  createdAt: string;
  updatedAt: string;
}

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string | null;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = parseInt(params.id as string);

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
      fetchTeamMembers();
    }
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/projects/${projectId}/with-tasks`);
      
      if (!res.ok) {
        if (res.status === 404) {
          toast.error("Project not found");
          router.push("/projects");
          return;
        }
        throw new Error("Failed to fetch project");
      }

      const data = await res.json();
      setProject(data.project);
      setTasks(data.tasks);
    } catch (error) {
      console.error("Failed to fetch project data:", error);
      toast.error("Failed to load project");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const res = await fetch("/api/team-members?limit=100");
      const data = await res.json();
      setTeamMembers(data);
    } catch (error) {
      console.error("Failed to fetch team members:", error);
    }
  };

  const handleUpdateProject = async (projectData: Partial<Project>) => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData),
      });

      if (!res.ok) throw new Error("Failed to update project");

      toast.success("Project updated successfully");
      fetchProjectData();
    } catch (error) {
      console.error("Failed to update project:", error);
      toast.error("Failed to update project");
    }
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    try {
      if (editingTask) {
        const res = await fetch(`/api/tasks/${editingTask.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskData),
        });

        if (!res.ok) throw new Error("Failed to update task");

        toast.success("Task updated successfully");
      } else {
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...taskData, projectId }),
        });

        if (!res.ok) throw new Error("Failed to create task");

        toast.success("Task created successfully");
      }

      fetchProjectData();
      setEditingTask(null);
    } catch (error) {
      console.error("Failed to save task:", error);
      toast.error("Failed to save task");
    }
  };

  const handleToggleTaskStatus = async (task: Task) => {
    try {
      const newStatus = task.status === "complete" ? "incomplete" : "complete";
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update task");

      fetchProjectData();
    } catch (error) {
      console.error("Failed to toggle task status:", error);
      toast.error("Failed to update task");
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskDialogOpen(true);
  };

  const handleDeleteTask = async (id: number) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete task");

      toast.success("Task deleted successfully");
      fetchProjectData();
    } catch (error) {
      console.error("Failed to delete task:", error);
      toast.error("Failed to delete task");
    }
  };

  const handleCreateNewTask = () => {
    setEditingTask(null);
    setTaskDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  const completedTasks = tasks.filter((t) => t.status === "complete").length;
  const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const statusColors = {
    Planning: "bg-blue-500",
    "In Progress": "bg-yellow-500",
    Completed: "bg-green-500",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/projects">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">{project.name}</h1>
                <Badge
                  variant="secondary"
                  className={`${statusColors[project.status as keyof typeof statusColors] || "bg-gray-500"} text-white`}
                >
                  {project.status}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1">
                {project.description || "No description"}
              </p>
            </div>
            <Button variant="outline" onClick={() => setProjectDialogOpen(true)} className="gap-2">
              <Pencil className="h-4 w-4" />
              Edit Project
            </Button>
          </div>

          {/* Project Stats */}
          <div className="grid gap-4 md:grid-cols-3 mt-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Project Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">{project.progress}%</div>
                <Progress value={project.progress} className="h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Task Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">{taskCompletionRate}%</div>
                <p className="text-sm text-muted-foreground">
                  {completedTasks} of {tasks.length} tasks completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Created {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </header>

      {/* Tasks Section */}
      <main className="container mx-auto px-6 py-8 space-y-6">
        {/* AI Insights Panel */}
        {tasks.length > 0 && (
          <InsightsPanel 
            content={{
              project: {
                name: project.name,
                status: project.status,
                progress: project.progress,
                description: project.description
              },
              tasks: tasks,
              stats: {
                totalTasks: tasks.length,
                completedTasks: completedTasks,
                incompleteTasks: tasks.length - completedTasks,
                taskCompletionRate: taskCompletionRate
              }
            }}
            contentLabel="project tasks"
          />
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Tasks</CardTitle>
              <Button onClick={handleCreateNewTask} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <TaskList
              tasks={tasks}
              teamMembers={teamMembers}
              onToggleStatus={handleToggleTaskStatus}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
            />
          </CardContent>
        </Card>
      </main>

      {/* Dialogs */}
      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        task={editingTask}
        projectId={projectId}
        teamMembers={teamMembers}
        onSave={handleSaveTask}
      />

      <ProjectDialog
        open={projectDialogOpen}
        onOpenChange={setProjectDialogOpen}
        project={project}
        onSave={handleUpdateProject}
      />
    </div>
  );
}