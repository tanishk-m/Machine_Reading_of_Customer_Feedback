import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reviews, analyses, productName, platform } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Generating actionable insights for ${productName}`);

    // Calculate summary stats
    const positiveCount = analyses.filter((a: any) => a.sentiment === 'positive').length;
    const negativeCount = analyses.filter((a: any) => a.sentiment === 'negative').length;
    const neutralCount = analyses.filter((a: any) => a.sentiment === 'neutral').length;
    const avgScore = analyses.reduce((sum: number, a: any) => sum + a.sentiment_score, 0) / analyses.length;

    // Collect all keywords
    const allKeywords = analyses.flatMap((a: any) => a.keywords || []);
    const keywordFreq: Record<string, number> = {};
    allKeywords.forEach((k: string) => {
      keywordFreq[k.toLowerCase()] = (keywordFreq[k.toLowerCase()] || 0) + 1;
    });
    const topKeywords = Object.entries(keywordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([k]) => k);

    const systemPrompt = `You are a business intelligence expert specializing in e-commerce customer feedback analysis. 
Generate ACTIONABLE insights that can directly improve business outcomes. Focus on:
1. Product improvements based on complaints
2. Marketing opportunities from positive feedback
3. Customer service improvements
4. Competitive advantages to leverage
5. Risk areas that need immediate attention

Each insight must be specific, measurable, and implementable.`;

    const userPrompt = `Analyze this customer feedback data for "${productName}" on ${platform}:

Summary Statistics:
- Total Reviews: ${reviews.length}
- Positive: ${positiveCount} (${((positiveCount/reviews.length)*100).toFixed(1)}%)
- Negative: ${negativeCount} (${((negativeCount/reviews.length)*100).toFixed(1)}%)
- Neutral: ${neutralCount} (${((neutralCount/reviews.length)*100).toFixed(1)}%)
- Average Sentiment Score: ${avgScore.toFixed(2)}

Top Keywords/Topics: ${topKeywords.join(', ')}

Sample Reviews (showing variety):
${reviews.slice(0, 10).map((r: string, i: number) => `${i+1}. [${analyses[i]?.sentiment}] "${r.substring(0, 200)}..."`).join('\n')}

Generate 4-6 actionable insights with specific recommendations.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_insights",
              description: "Return actionable business insights",
              parameters: {
                type: "object",
                properties: {
                  insights: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        category: { 
                          type: "string", 
                          enum: ["product", "service", "marketing", "pricing", "delivery", "quality"] 
                        },
                        title: { type: "string" },
                        description: { type: "string" },
                        priority: { type: "string", enum: ["high", "medium", "low"] },
                        impact_area: { type: "string" },
                        recommendation: { type: "string" },
                        review_count: { type: "number" }
                      },
                      required: ["category", "title", "description", "priority", "impact_area", "recommendation"]
                    }
                  }
                },
                required: ["insights"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_insights" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add more credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Insights generated:", JSON.stringify(data).substring(0, 500));
    
    let insights;
    try {
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        const parsed = JSON.parse(toolCall.function.arguments);
        insights = parsed.insights;
      } else {
        throw new Error("No tool call response");
      }
    } catch (e) {
      console.error("Parse error:", e);
      insights = [];
    }

    return new Response(JSON.stringify({ 
      insights, 
      summary: {
        total: reviews.length,
        positive: positiveCount,
        negative: negativeCount,
        neutral: neutralCount,
        avgScore,
        topKeywords
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in generate-insights:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
