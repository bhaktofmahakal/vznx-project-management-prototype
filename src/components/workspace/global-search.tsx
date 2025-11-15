"use client";

import { useState, useEffect } from "react";
import { Search, FolderKanban, ListTodo, Users, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface Project {
  id: number;
  name: string;
  status: string;
  description: string | null;
}

interface Task {
  id: number;
  title: string;
  status: string;
  priority: string;
  projectId: number;
}

interface TeamMember {
  id: number;
  name: string;
  role: string;
  email: string;
}

interface SearchResults {
  projects: Project[];
  tasks: Task[];
  teamMembers: TeamMember[];
}

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>({
    projects: [],
    tasks: [],
    teamMembers: [],
  });
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults({ projects: [], tasks: [], teamMembers: [] });
      setShowResults(false);
      return;
    }

    const debounce = setTimeout(async () => {
      setIsSearching(true);
      try {
        const [projectsRes, tasksRes, membersRes] = await Promise.all([
          fetch(`/api/projects?search=${encodeURIComponent(query)}&limit=5`),
          fetch(`/api/tasks?search=${encodeURIComponent(query)}&limit=5`),
          fetch(`/api/team-members?search=${encodeURIComponent(query)}&limit=5`),
        ]);

        const projects = await projectsRes.json();
        const tasks = await tasksRes.json();
        const teamMembers = await membersRes.json();

        setResults({ projects, tasks, teamMembers });
        setShowResults(true);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [query]);

  const totalResults = results.projects.length + results.tasks.length + results.teamMembers.length;

  const handleClear = () => {
    setQuery("");
    setResults({ projects: [], tasks: [], teamMembers: [] });
    setShowResults(false);
  };

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search projects, tasks, team members..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showResults && query.trim().length >= 2 && (
        <Card className="absolute top-full mt-2 w-full z-50 max-h-[500px] overflow-y-auto">
          <CardContent className="p-4">
            {isSearching ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                Searching...
              </div>
            ) : totalResults === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No results found for "{query}"</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Projects */}
                {results.projects.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <FolderKanban className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-semibold text-sm">Projects ({results.projects.length})</h3>
                    </div>
                    <div className="space-y-2">
                      {results.projects.map((project) => (
                        <Link
                          key={project.id}
                          href={`/projects/${project.id}`}
                          onClick={() => setShowResults(false)}
                        >
                          <div className="p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate">{project.name}</h4>
                                <p className="text-sm text-muted-foreground truncate">
                                  {project.description || "No description"}
                                </p>
                              </div>
                              <Badge variant="secondary" className="ml-2">
                                {project.status}
                              </Badge>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tasks */}
                {results.tasks.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <ListTodo className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-semibold text-sm">Tasks ({results.tasks.length})</h3>
                    </div>
                    <div className="space-y-2">
                      {results.tasks.map((task) => (
                        <Link
                          key={task.id}
                          href={`/projects/${task.projectId}`}
                          onClick={() => setShowResults(false)}
                        >
                          <div className="p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate">{task.title}</h4>
                                <div className="flex gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {task.status}
                                  </Badge>
                                  <Badge
                                    variant={
                                      task.priority === "High"
                                        ? "destructive"
                                        : task.priority === "Medium"
                                        ? "default"
                                        : "secondary"
                                    }
                                    className="text-xs"
                                  >
                                    {task.priority}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Team Members */}
                {results.teamMembers.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-semibold text-sm">Team Members ({results.teamMembers.length})</h3>
                    </div>
                    <div className="space-y-2">
                      {results.teamMembers.map((member) => (
                        <Link
                          key={member.id}
                          href="/team"
                          onClick={() => setShowResults(false)}
                        >
                          <div className="p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate">{member.name}</h4>
                                <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                              </div>
                              <Badge variant="secondary" className="ml-2">
                                {member.role}
                              </Badge>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
