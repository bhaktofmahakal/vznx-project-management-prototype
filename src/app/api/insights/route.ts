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
7. Output everything in clean JSON with the following schema:

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

    const userPrompt = `Analyze the following workspace data and provide insights:\n\n${JSON.stringify(content, null, 2)}`;

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
          temperature: 0.7,
          max_tokens: 2000,
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
      // Extract JSON from markdown code blocks if present
      const jsonMatch = insightsText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonText = jsonMatch ? jsonMatch[1] : insightsText;
      insights = JSON.parse(jsonText);
    } catch (parseError) {
      console.error("Failed to parse insights JSON:", parseError);
      // Return a fallback structure
      insights = {
        summary: [insightsText.substring(0, 200)],
        issues_detected: [],
        recommendations: [],
        next_steps: [],
        priority_breakdown: { high: [], medium: [], low: [] },
        alternate_versions: [],
      };
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
