"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { TrendingUp, Target, Clock, CheckCircle2 } from "lucide-react";

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

interface ProjectAnalyticsProps {
  projects: Project[];
  tasks: Task[];
}

const STATUS_COLORS: Record<string, string> = {
  "In Progress": "#3b82f6",
  "Completed": "#10b981",
  "Planning": "#f59e0b",
  "Pending": "#6b7280",
};

const PRIORITY_COLORS: Record<string, string> = {
  "High": "#ef4444",
  "Medium": "#f59e0b",
  "Low": "#10b981",
};

export function ProjectAnalytics({ projects, tasks }: ProjectAnalyticsProps) {
  // Calculate status distribution
  const statusData = Object.entries(
    projects.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({
    name,
    value,
    color: STATUS_COLORS[name] || "#6b7280",
  }));

  // Calculate task priority distribution
  const priorityData = Object.entries(
    tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({
    name,
    value,
    color: PRIORITY_COLORS[name] || "#6b7280",
  }));

  // Calculate task status distribution
  const taskStatusData = Object.entries(
    tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({
    name,
    value,
  }));

  // Calculate progress distribution
  const progressRanges = [
    { range: "0-25%", min: 0, max: 25 },
    { range: "26-50%", min: 26, max: 50 },
    { range: "51-75%", min: 51, max: 75 },
    { range: "76-100%", min: 76, max: 100 },
  ];

  const progressData = progressRanges.map(({ range, min, max }) => ({
    name: range,
    count: projects.filter((p) => p.progress >= min && p.progress <= max).length,
  }));

  // Calculate completion stats
  const completedProjects = projects.filter((p) => p.status === "Completed").length;
  const inProgressProjects = projects.filter((p) => p.status === "In Progress").length;
  const completedTasks = tasks.filter((t) => t.status === "Completed").length;
  const highPriorityTasks = tasks.filter((t) => t.priority === "High").length;

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedProjects}</div>
            <p className="text-xs text-muted-foreground">
              {projects.length > 0 ? Math.round((completedProjects / projects.length) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressProjects}</div>
            <p className="text-xs text-muted-foreground">Active projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tasks Done</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks}</div>
            <p className="text-xs text-muted-foreground">
              {tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0}% completion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <Clock className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highPriorityTasks}</div>
            <p className="text-xs text-muted-foreground">Urgent tasks</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Project Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Project Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No project data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progress Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Progress Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {progressData.some((d) => d.count > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={progressData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No progress data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Task Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Task Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {priorityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No task data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Task Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Task Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {taskStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={taskStatusData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No task data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
