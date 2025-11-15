"use client";

import { useEffect, useState } from "react";
import { ProjectAnalytics } from "@/components/workspace/project-analytics";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

interface Project {
  id: number;
  name: string;
  status: string;
  progress: number;
  description: string | null;
}

interface Task {
  id: number;
  title: string;
  status: string;
  priority: string;
  projectId: number;
}

export default function AnalyticsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [projectsRes, tasksRes] = await Promise.all([
        fetch("/api/projects?limit=100"),
        fetch("/api/tasks?limit=100"),
      ]);

      const projectsData = await projectsRes.json();
      const tasksData = await tasksRes.json();

      setProjects(projectsData);
      setTasks(tasksData);
    } catch (error) {
      console.error("Failed to fetch analytics data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                  Comprehensive insights and statistics
                </p>
              </div>
            </div>
            <Button onClick={fetchData} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {projects.length === 0 && tasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No data available yet. Create some projects and tasks to see analytics.
            </p>
            <Link href="/projects">
              <Button>Create Your First Project</Button>
            </Link>
          </div>
        ) : (
          <ProjectAnalytics projects={projects} tasks={tasks} />
        )}
      </main>
    </div>
  );
}
