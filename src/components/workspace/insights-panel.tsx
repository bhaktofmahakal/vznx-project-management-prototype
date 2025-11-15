"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

interface Insights {
  summary: string[];
  issues_detected: string[];
  recommendations: string[];
  next_steps: string[];
  priority_breakdown: {
    high: string[];
    medium: string[];
    low: string[];
  };
  alternate_versions: any[];
}

interface InsightsPanelProps {
  content: any;
  contentLabel?: string;
}

export const InsightsPanel = ({ content, contentLabel = "content" }: InsightsPanelProps) => {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const generateInsights = async () => {
    if (!content || (Array.isArray(content) && content.length === 0)) {
      toast.error(`No ${contentLabel} to analyze`);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate insights");
      }

      const data = await response.json();
      setInsights(data);
      setIsExpanded(true);
      toast.success("Insights generated successfully!");
    } catch (error) {
      console.error("Failed to generate insights:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate insights");
    } finally {
      setIsLoading(false);
    }
  };

  const renderAlternateVersion = (version: any, index: number) => {
    if (typeof version === 'string') {
      return <div key={index} className="p-3 rounded-lg bg-muted/50 text-sm">{version}</div>;
    }
    
    // Handle object versions (like task lists)
    return (
      <div key={index} className="p-3 rounded-lg bg-muted/50 text-sm space-y-2">
        <div className="font-medium text-purple-600">Version {index + 1}:</div>
        <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
          {JSON.stringify(version, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Generate Button */}
      <Button
        onClick={generateInsights}
        disabled={isLoading}
        size="lg"
        className="w-full gap-2"
        variant="outline"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Analyzing your {contentLabel}...
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5" />
            Generate AI Insights
          </>
        )}
      </Button>

      {/* Insights Panel */}
      {insights && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle>Smart Insights</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>

          {isExpanded && (
            <CardContent className="space-y-6">
              {/* Summary */}
              {insights.summary && insights.summary.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="text-primary">📊</span> Summary
                  </h3>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    {insights.summary.map((item, index) => (
                      <li key={index} className="flex gap-2">
                        <span className="text-primary">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Issues Detected */}
              {insights.issues_detected && insights.issues_detected.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="text-destructive">⚠️</span> Issues Detected
                  </h3>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    {insights.issues_detected.map((item, index) => (
                      <li key={index} className="flex gap-2">
                        <span className="text-destructive">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {insights.recommendations && insights.recommendations.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="text-green-600">💡</span> Recommendations
                  </h3>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    {insights.recommendations.map((item, index) => (
                      <li key={index} className="flex gap-2">
                        <span className="text-green-600">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Next Steps */}
              {insights.next_steps && insights.next_steps.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="text-blue-600">🎯</span> Next Steps
                  </h3>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    {insights.next_steps.map((item, index) => (
                      <li key={index} className="flex gap-2">
                        <span className="text-blue-600">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Priority Breakdown */}
              {insights.priority_breakdown && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <span>🎲</span> Priority Breakdown
                  </h3>
                  <div className="space-y-3">
                    {insights.priority_breakdown.high.length > 0 && (
                      <div>
                        <Badge variant="destructive" className="mb-2">High Priority</Badge>
                        <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                          {insights.priority_breakdown.high.map((item, index) => (
                            <li key={index}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {insights.priority_breakdown.medium.length > 0 && (
                      <div>
                        <Badge variant="secondary" className="mb-2">Medium Priority</Badge>
                        <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                          {insights.priority_breakdown.medium.map((item, index) => (
                            <li key={index}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {insights.priority_breakdown.low.length > 0 && (
                      <div>
                        <Badge variant="outline" className="mb-2">Low Priority</Badge>
                        <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                          {insights.priority_breakdown.low.map((item, index) => (
                            <li key={index}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Alternate Versions */}
              {insights.alternate_versions && insights.alternate_versions.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="text-purple-600">✨</span> Alternate Versions
                  </h3>
                  <div className="space-y-2">
                    {insights.alternate_versions.map((version, index) => renderAlternateVersion(version, index))}
                  </div>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
};