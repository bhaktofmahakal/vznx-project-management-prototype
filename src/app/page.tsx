"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderKanban, ListTodo, Users, Plus, TrendingUp, BarChart3 } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { InsightsPanel } from "@/components/workspace/insights-panel";
import { GlobalSearch } from "@/components/workspace/global-search";

interface Project {
  id: number;
  name: string;
  status: string;
  progress: number;
  description: string | null;
}

interface Stats {
  totalProjects: number;
  totalTasks: number;
  totalTeamMembers: number;
  averageProgress: number;
  recentProjects: Project[];
}

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    
    // Refresh dashboard data when user returns to this page
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchDashboardData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [projectsRes, tasksRes, membersRes] = await Promise.all([
        fetch("/api/projects?limit=100"),
        fetch("/api/tasks?limit=100"),
        fetch("/api/team-members?limit=100"),
      ]);

      const projects = await projectsRes.json();
      const tasks = await tasksRes.json();
      const members = await membersRes.json();

      const avgProgress = projects.length > 0
        ? Math.round(projects.reduce((sum: number, p: Project) => sum + p.progress, 0) / projects.length)
        : 0;

      setStats({
        totalProjects: projects.length,
        totalTasks: tasks.length,
        totalTeamMembers: members.length,
        averageProgress: avgProgress,
        recentProjects: projects.slice(0, 5),
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Workspace Dashboard</h1>
                <p className="text-muted-foreground mt-1">Manage your projects, tasks, and team</p>
              </div>
              <div className="flex gap-2">
                <Link href="/analytics">
                  <Button variant="outline" size="lg" className="gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Analytics
                  </Button>
                </Link>
                <Link href="/projects">
                  <Button size="lg" className="gap-2">
                    <Plus className="h-5 w-5" />
                    New Project
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Global Search */}
            <div className="flex justify-center">
              <GlobalSearch />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.totalProjects || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Active projects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <ListTodo className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.totalTasks || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Across all projects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.totalTeamMembers || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Active members</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.averageProgress || 0}%</div>
              <p className="text-xs text-muted-foreground mt-1">Overall completion</p>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights Panel */}
        {stats && stats.recentProjects.length > 0 && (
          <div className="mb-8">
            <InsightsPanel 
              content={{
                projects: stats.recentProjects,
                stats: {
                  totalProjects: stats.totalProjects,
                  totalTasks: stats.totalTasks,
                  totalTeamMembers: stats.totalTeamMembers,
                  averageProgress: stats.averageProgress
                }
              }}
              contentLabel="workspace data"
            />
          </div>
        )}

        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Projects</CardTitle>
              <Link href="/projects">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {stats?.recentProjects && stats.recentProjects.length > 0 ? (
              <div className="space-y-4">
                {stats.recentProjects.map((project) => (
                  <Link key={project.id} href={`/projects/${project.id}`}>
                    <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer">
                      <div className="flex-1 min-w-0 mr-4">
                        <h3 className="font-semibold truncate">{project.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {project.description || "No description"}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right min-w-[100px]">
                          <div className="text-sm font-medium">{project.progress}%</div>
                          <Progress value={project.progress} className="h-1.5 w-[100px] mt-1" />
                        </div>
                        <div className="text-sm font-medium text-muted-foreground min-w-[100px] text-right">
                          {project.status}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FolderKanban className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="mb-4">No projects yet</p>
                <Link href="/projects">
                  <Button>Create Your First Project</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="grid gap-6 md:grid-cols-3 mt-8">
          <Link href="/projects">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FolderKanban className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Projects</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  View and manage all your projects
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/team">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Team</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Manage your team members
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/analytics">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Analytics</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  View detailed charts and insights
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
}