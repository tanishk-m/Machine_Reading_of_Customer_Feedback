import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  MessageSquareText, 
  TrendingUp, 
  TrendingDown, 
  MinusCircle,
  Sparkles,
  ArrowRight,
  Zap,
  Target,
  BarChart3
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { SentimentChart } from "@/components/dashboard/SentimentChart";
import { KeywordsCloud } from "@/components/dashboard/KeywordsCloud";
import { InsightCard } from "@/components/insights/InsightCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getReviews, getInsights } from "@/lib/api";
import type { ActionableInsight } from "@/lib/api";

interface ReviewData {
  id: string;
  product_name: string;
  platform: string;
  review_text: string;
  sentiment: string;
  sentiment_score: number;
  keywords: string[] | null;
  created_at: string;
}

export default function Index() {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [insights, setInsights] = useState<ActionableInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [reviewData, insightData] = await Promise.all([
          getReviews(100),
          getInsights(10)
        ]);
        setReviews(reviewData || []);
        setInsights(insightData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const positiveCount = reviews.filter(r => r.sentiment === 'positive').length;
  const negativeCount = reviews.filter(r => r.sentiment === 'negative').length;
  const neutralCount = reviews.filter(r => r.sentiment === 'neutral').length;
  const avgScore = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + (r.sentiment_score || 0), 0) / reviews.length 
    : 0;
  const allKeywords = reviews.flatMap(r => r.keywords || []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8 space-y-8">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card to-secondary p-8 md:p-12">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2310b981%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
          
          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Smart Analytics</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Cognitive Feedback Intelligence System for{" "}
                <span className="gradient-text">Advanced Consumer Insight Extraction</span>
              </h1>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                Analyze e-commerce reviews from Amazon, Flipkart, and more. 
                Our AI identifies sentiment patterns and generates specific recommendations 
                to improve your products and services.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button variant="gradient" size="xl" asChild>
                  <Link to="/analyze">
                    Start Analyzing
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" size="xl" asChild>
                  <Link to="/insights">View Insights</Link>
                </Button>
              </div>
            </div>
            
            <div className="hidden md:grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <Card variant="glass" className="p-4 animate-float">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-success/20 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">87%</p>
                      <p className="text-xs text-muted-foreground">Positive Rate</p>
                    </div>
                  </div>
                </Card>
                <Card variant="glass" className="p-4 animate-float" style={{ animationDelay: '0.5s' }}>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-info/20 flex items-center justify-center">
                      <Target className="h-5 w-5 text-info" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">12</p>
                      <p className="text-xs text-muted-foreground">Key Insights</p>
                    </div>
                  </div>
                </Card>
              </div>
              <div className="space-y-4 mt-8">
                <Card variant="glass" className="p-4 animate-float" style={{ animationDelay: '0.25s' }}>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-warning/20 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">2.5s</p>
                      <p className="text-xs text-muted-foreground">Avg Analysis</p>
                    </div>
                  </div>
                </Card>
                <Card variant="glass" className="p-4 animate-float" style={{ animationDelay: '0.75s' }}>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">1.2K</p>
                      <p className="text-xs text-muted-foreground">Reviews Analyzed</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Reviews"
            value={reviews.length}
            subtitle="Analyzed reviews"
            icon={MessageSquareText}
            variant="default"
          />
          <StatsCard
            title="Positive"
            value={positiveCount}
            subtitle={`${reviews.length > 0 ? ((positiveCount / reviews.length) * 100).toFixed(1) : 0}%`}
            icon={TrendingUp}
            variant="success"
          />
          <StatsCard
            title="Negative"
            value={negativeCount}
            subtitle={`${reviews.length > 0 ? ((negativeCount / reviews.length) * 100).toFixed(1) : 0}%`}
            icon={TrendingDown}
            variant="destructive"
          />
          <StatsCard
            title="Avg Sentiment"
            value={avgScore.toFixed(2)}
            subtitle="Score range: -1 to 1"
            icon={MinusCircle}
            variant="warning"
          />
        </section>

        {/* Charts Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SentimentChart
            positive={positiveCount}
            negative={negativeCount}
            neutral={neutralCount}
          />
          <KeywordsCloud keywords={allKeywords} />
        </section>

        {/* Recent Insights */}
        {insights.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Recent Actionable Insights</h2>
              <Button variant="ghost" asChild>
                <Link to="/insights">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.slice(0, 4).map((insight, i) => (
                <InsightCard key={insight.id || i} insight={insight} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {!isLoading && reviews.length === 0 && (
          <Card variant="glass" className="p-12 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="h-16 w-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                <MessageSquareText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">No Reviews Yet</h3>
              <p className="text-muted-foreground">
                Start analyzing customer reviews to see sentiment trends and actionable insights.
              </p>
              <Button variant="gradient" asChild>
                <Link to="/analyze">
                  Analyze Your First Reviews
                </Link>
              </Button>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
