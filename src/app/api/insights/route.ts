import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content } = body;

    if (!content || Object.keys(content).length === 0) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return NextResponse.json(
        { error: "Groq API key not configured" },
        { status: 500 }
      );
    }

    // Prepare the prompt for Groq
    const systemPrompt = `You are the Smart Insights Engine for a productivity application.

You will receive a JSON payload containing user-generated content such as tasks, notes, items, or entries.

Your job:
1. Summarize the content in 3–4 crisp bullet points.
2. Identify issues, inconsistencies, or missing elements.
3. Suggest improvements.
4. Suggest next steps the user should take.
5. Generate a priority breakdown (High, Medium, Low).
6. Give 3 alternate, improved versions of the content (rewrites).
7. Output ONLY valid JSON with the following schema (no markdown, no code blocks):

{
  "summary": [],
  "issues_detected": [],
  "recommendations": [],
  "next_steps": [],
  "priority_breakdown": {
    "high": [],
    "medium": [],
    "low": []
  },
  "alternate_versions": []
}`;

    const userPrompt = `Analyze the following workspace data and provide insights:\n\n${JSON.stringify(content, null, 2)}\n\nRespond with ONLY valid JSON, no markdown formatting.`;

    // Call Groq API
    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqApiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.5,
          max_tokens: 2000,
          response_format: { type: "json_object" }
        }),
      }
    );

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error("Groq API error:", errorText);
      return NextResponse.json(
        { error: "Failed to generate insights" },
        { status: groqResponse.status }
      );
    }

    const groqData = await groqResponse.json();
    const insightsText = groqData.choices[0]?.message?.content;

    if (!insightsText) {
      return NextResponse.json(
        { error: "No insights generated" },
        { status: 500 }
      );
    }

    // Parse the JSON response from Groq
    let insights;
    try {
      // Try direct parse first
      insights = JSON.parse(insightsText);
      
      // Validate structure
      if (!insights.summary) insights.summary = [];
      if (!insights.issues_detected) insights.issues_detected = [];
      if (!insights.recommendations) insights.recommendations = [];
      if (!insights.next_steps) insights.next_steps = [];
      if (!insights.priority_breakdown) {
        insights.priority_breakdown = { high: [], medium: [], low: [] };
      }
      if (!insights.alternate_versions) insights.alternate_versions = [];
      
    } catch (parseError) {
      console.error("Failed to parse insights JSON:", parseError);
      console.error("Raw response:", insightsText);
      
      // Fallback: try to extract JSON from markdown code blocks
      const jsonMatch = insightsText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        try {
          insights = JSON.parse(jsonMatch[1]);
        } catch {
          // If still fails, return generic structure
          insights = {
            summary: ["Analysis completed. Please try again for detailed insights."],
            issues_detected: [],
            recommendations: [],
            next_steps: [],
            priority_breakdown: { high: [], medium: [], low: [] },
            alternate_versions: [],
          };
        }
      } else {
        // Last resort fallback
        insights = {
          summary: [insightsText.substring(0, 300)],
          issues_detected: [],
          recommendations: [],
          next_steps: [],
          priority_breakdown: { high: [], medium: [], low: [] },
          alternate_versions: [],
        };
      }
    }

    return NextResponse.json(insights);
  } catch (error) {
    console.error("Insights API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}