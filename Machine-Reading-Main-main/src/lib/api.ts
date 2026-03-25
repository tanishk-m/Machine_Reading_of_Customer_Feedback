import { supabase } from "@/integrations/supabase/client";

export interface SentimentAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  sentiment_score: number;
  keywords: string[];
  rating_estimate: number;
}

export interface ActionableInsight {
  id?: string;
  category: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  impact_area: string;
  recommendation: string;
  review_count?: number;
}

export interface AnalysisSummary {
  total: number;
  positive: number;
  negative: number;
  neutral: number;
  avgScore: number;
  topKeywords: string[];
}

export async function analyzeSentiment(reviews: string[], productName: string, platform: string) {
  const { data, error } = await supabase.functions.invoke('analyze-sentiment', {
    body: { reviews, productName, platform }
  });
  if (error) throw new Error(error.message || 'Failed to analyze sentiment');
  return data;
}

export async function generateInsights(reviews: string[], analyses: SentimentAnalysis[], productName: string, platform: string) {
  const { data, error } = await supabase.functions.invoke('generate-insights', {
    body: { reviews, analyses, productName, platform }
  });
  if (error) throw new Error(error.message || 'Failed to generate insights');
  return data;
}

export async function saveReview(review: { product_name: string; platform: string; review_text: string; rating?: number; sentiment: string; sentiment_score: number; keywords: string[]; }) {
  const { data, error } = await supabase.from('reviews').insert([review]).select().single();
  if (error) throw error;
  return data;
}

export async function saveInsight(insight: ActionableInsight) {
  const response = await fetch('http://localhost:3000/api/insights', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(insight),
  });
  
  if (!response.ok) {
    throw new Error('Failed to save insight');
  }
  return response.json();
}

export async function getReviews(limit = 100) {
  const { data, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false }).limit(limit);
  if (error) throw error;
  return data;
}

export async function getInsights() {
  const response = await fetch('http://localhost:3000/api/insights');
  if (!response.ok) {
    throw new Error('Failed to fetch insights');
  }
  return response.json();
}

export async function sendFeedbackEmail(
  productName: string,
  platform: string,
  reviewText: string,
  sentiment: string,
  sentimentScore: number,
  insights: ActionableInsight[]
) {
  console.log("Attempting to send feedback email to root user via local server...");
  
  // Use local server endpoint instead of Supabase function
  const response = await fetch('http://localhost:3000/api/send-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      productName,
      platform,
      reviewText,
      sentiment,
      sentimentScore,
      insights: insights.map(i => ({
        title: i.title,
        description: i.description,
        recommendation: i.recommendation,
        priority: i.priority
      }))
    })
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Failed to send email via local server:", data.error);
    throw new Error(data.error || 'Failed to send email');
  }
  
  console.log("Email sent successfully via local server");
  return data;
}
