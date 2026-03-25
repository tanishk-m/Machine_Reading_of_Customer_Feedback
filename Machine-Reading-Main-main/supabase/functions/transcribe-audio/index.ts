import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function normalizeBase64Audio(input: unknown): string {
  if (typeof input !== "string") return "";
  const trimmed = input.trim();

  // In case a data URL is accidentally sent, strip the prefix.
  if (trimmed.startsWith("data:")) {
    const commaIndex = trimmed.indexOf(",");
    if (commaIndex !== -1) return trimmed.slice(commaIndex + 1).trim();
  }

  return trimmed;
}

function extractTextFromMessageContent(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object" && "text" in part && typeof (part as any).text === "string") {
          return (part as any).text;
        }
        return "";
      })
      .join("");
  }
  return "";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audio, format } = await req.json();

    const audioBase64 = normalizeBase64Audio(audio);
    if (!audioBase64) {
      throw new Error("No audio data provided");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const rawFormat = typeof format === "string" && format ? format.toLowerCase() : "wav";
    const allowed = new Set(["wav", "mp3", "m4a", "webm", "ogg", "mp4", "flac"]);
    const audioFormat = allowed.has(rawFormat) ? rawFormat : "wav";

    console.log("Transcribe request", { format: audioFormat, audioLength: audioBase64.length });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text:
                  "Transcribe this customer feedback audio exactly. Return only the transcription text.",
              },
              {
                type: "input_audio",
                input_audio: {
                  data: audioBase64,
                  format: audioFormat,
                },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      throw new Error(`AI transcription failed: ${response.status}`);
    }

    const result = await response.json();
    const rawContent = result?.choices?.[0]?.message?.content;
    let transcribedText = extractTextFromMessageContent(rawContent).trim();

    // Strip accidental quotes/code fences
    if ((transcribedText.startsWith('"') && transcribedText.endsWith('"')) || (transcribedText.startsWith("'") && transcribedText.endsWith("'"))) {
      transcribedText = transcribedText.slice(1, -1).trim();
    }
    if (transcribedText.startsWith("```")) {
      transcribedText = transcribedText.replace(/^```[a-zA-Z0-9]*\n?/, "").replace(/```$/, "").trim();
    }

    console.log("Transcription preview:", transcribedText.slice(0, 120));

    return new Response(JSON.stringify({ text: transcribedText }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Transcription error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Transcription failed",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
