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
    const { reviews, productName, platform } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Analyzing ${reviews.length} reviews for ${productName} on ${platform}`);

    const systemPrompt = `You are an expert sentiment analysis AI for e-commerce customer feedback. Analyze each review and provide:
1. sentiment: "positive", "negative", or "neutral"
2. sentiment_score: a number between -1 (very negative) to 1 (very positive)
3. keywords: array of key phrases/topics mentioned (max 5)
4. rating_estimate: estimated star rating 1-5 based on sentiment

Be accurate and consistent. Consider context, sarcasm, and nuanced opinions.`;

    const userPrompt = `Analyze the following customer reviews for "${productName}" from ${platform}:

${reviews.map((r: string, i: number) => `Review ${i + 1}: "${r}"`).join('\n\n')}

Return a JSON array with analysis for each review in order.`;

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
              name: "analyze_reviews",
              description: "Return sentiment analysis for each review",
              parameters: {
                type: "object",
                properties: {
                  analyses: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        sentiment: { type: "string", enum: ["positive", "negative", "neutral"] },
                        sentiment_score: { type: "number" },
                        keywords: { type: "array", items: { type: "string" } },
                        rating_estimate: { type: "number" }
                      },
                      required: ["sentiment", "sentiment_score", "keywords", "rating_estimate"]
                    }
                  }
                },
                required: ["analyses"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "analyze_reviews" } }
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
    console.log("AI response received:", JSON.stringify(data).substring(0, 500));
    
    let analyses;
    try {
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        const parsed = JSON.parse(toolCall.function.arguments);
        analyses = parsed.analyses;
      } else {
        throw new Error("No tool call response");
      }
    } catch (e) {
      console.error("Parse error:", e);
      // Fallback: create basic analysis
      analyses = reviews.map(() => ({
        sentiment: "neutral",
        sentiment_score: 0,
        keywords: [],
        rating_estimate: 3
      }));
    }

    return new Response(JSON.stringify({ analyses, productName, platform }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in analyze-sentiment:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
