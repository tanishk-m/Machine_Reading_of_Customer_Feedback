import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FeedbackEmailRequest {
  productName: string;
  platform: string;
  reviewText: string;
  sentiment: string;
  sentimentScore: number;
  insights: Array<{
    title: string;
    description: string;
    recommendation: string;
    priority: string;
  }>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured. Please add RESEND_API_KEY." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data: FeedbackEmailRequest = await req.json();
    const { productName, platform, reviewText, sentiment, sentimentScore, insights } = data;

    // Build sentiment badge color
    const sentimentColor = sentiment === 'positive' ? '#10b981' : sentiment === 'negative' ? '#ef4444' : '#f59e0b';
    const sentimentEmoji = sentiment === 'positive' ? '😊' : sentiment === 'negative' ? '😞' : '😐';

    // Build insights HTML
    const insightsHtml = insights.length > 0 ? insights.map(insight => `
      <div style="background: #f8fafc; border-left: 4px solid ${
        insight.priority === 'high' ? '#ef4444' : insight.priority === 'medium' ? '#f59e0b' : '#3b82f6'
      }; padding: 16px; margin-bottom: 12px; border-radius: 0 8px 8px 0;">
        <h3 style="margin: 0 0 8px 0; color: #1e293b; font-size: 16px;">${insight.title}</h3>
        <p style="margin: 0 0 12px 0; color: #64748b; font-size: 14px;">${insight.description}</p>
        <div style="background: #e0f2fe; padding: 12px; border-radius: 6px;">
          <strong style="color: #0284c7; font-size: 12px;">💡 Recommended Action:</strong>
          <p style="margin: 4px 0 0 0; color: #0369a1; font-size: 14px;">${insight.recommendation}</p>
        </div>
      </div>
    `).join('') : '<p style="color: #64748b;">No specific insights generated for this feedback.</p>';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>New Customer Feedback Alert</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f1f5f9; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">📊 New Feedback Received</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">Customer Feedback Analysis Report</p>
            </div>
            
            <!-- Product Info -->
            <div style="padding: 24px; border-bottom: 1px solid #e2e8f0;">
              <h2 style="margin: 0; color: #1e293b; font-size: 18px;">${productName}</h2>
              <p style="margin: 4px 0 0 0; color: #64748b; font-size: 14px;">Platform: ${platform.charAt(0).toUpperCase() + platform.slice(1)}</p>
            </div>
            
            <!-- Sentiment Summary -->
            <div style="padding: 24px; background: #f8fafc;">
              <h3 style="margin: 0 0 16px 0; color: #1e293b; font-size: 16px;">Sentiment Analysis</h3>
              <div style="display: inline-block; background: ${sentimentColor}20; border: 1px solid ${sentimentColor}40; padding: 8px 16px; border-radius: 24px;">
                <span style="color: ${sentimentColor}; font-weight: 600; font-size: 14px;">
                  ${sentimentEmoji} ${sentiment.charAt(0).toUpperCase() + sentiment.slice(1)} (Score: ${sentimentScore.toFixed(2)})
                </span>
              </div>
            </div>
            
            <!-- Review Content -->
            <div style="padding: 24px; border-bottom: 1px solid #e2e8f0;">
              <h3 style="margin: 0 0 12px 0; color: #1e293b; font-size: 16px;">Customer Feedback</h3>
              <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border-left: 4px solid ${sentimentColor};">
                <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.6; font-style: italic;">
                  "${reviewText}"
                </p>
              </div>
            </div>
            
            <!-- Actionable Insights -->
            <div style="padding: 24px;">
              <h3 style="margin: 0 0 16px 0; color: #1e293b; font-size: 16px;">🎯 Actionable Insights</h3>
              ${insightsHtml}
            </div>
            
            <!-- Footer -->
            <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                This email was generated by your Sentiment Analysis Platform
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    console.log('Sending feedback email to gunjansaxena735@gmail.com');

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: "Feedback Alert <onboarding@resend.dev>",
        to: ["gunjansaxena735@gmail.com"],
        subject: `${sentimentEmoji} New ${sentiment} feedback: ${productName}`,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Resend API error:', emailResponse.status, errorText);
      throw new Error(`Email sending failed: ${errorText}`);
    }

    const result = await emailResponse.json();
    console.log("Email sent successfully:", result);

    return new Response(JSON.stringify({ success: true, result }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error in send-feedback-email function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Email sending failed' }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
