import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { ReviewInput } from "@/components/analyze/ReviewInput";
import { ReviewCard } from "@/components/analyze/ReviewCard";
import { InsightCard } from "@/components/insights/InsightCard";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { SentimentChart } from "@/components/dashboard/SentimentChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  analyzeSentiment, 
  generateInsights, 
  saveReview, 
  saveInsight,
  sendFeedbackEmail,
  type SentimentAnalysis,
  type ActionableInsight,
  type AnalysisSummary
} from "@/lib/api";
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Lightbulb,
  Download,
  RefreshCw,
  CheckCircle2
} from "lucide-react";

export default function Analyze() {
  const [isLoading, setIsLoading] = useState(false);
  const [reviews, setReviews] = useState<string[]>([]);
  const [analyses, setAnalyses] = useState<SentimentAnalysis[]>([]);
  const [insights, setInsights] = useState<ActionableInsight[]>([]);
  const [summary, setSummary] = useState<AnalysisSummary | null>(null);
  const [productInfo, setProductInfo] = useState({ name: '', platform: '' });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async (reviewTexts: string[], productName: string, platform: string) => {
    setIsLoading(true);
    setReviews([]);
    setAnalyses([]);
    setInsights([]);
    setSummary(null);

    try {
      toast({
        title: "Analyzing reviews...",
        description: `Processing ${reviewTexts.length} reviews`,
      });

      // Step 1: Sentiment Analysis
      const sentimentResult = await analyzeSentiment(reviewTexts, productName, platform);
      setReviews(reviewTexts);
      setAnalyses(sentimentResult.analyses);
      setProductInfo({ name: productName, platform });

      toast({
        title: "Sentiment analysis complete",
        description: "Generating actionable insights...",
      });

      // Step 2: Generate Insights
      const insightsResult = await generateInsights(
        reviewTexts, 
        sentimentResult.analyses, 
        productName, 
        platform
      );
      
      setInsights(insightsResult.insights);
      setSummary(insightsResult.summary);

      // Step 3: Auto-send email notification with summary
      try {
        const avgScore = sentimentResult.analyses.reduce((sum: number, a: SentimentAnalysis) => sum + a.sentiment_score, 0) / sentimentResult.analyses.length;
        const dominantSentiment = sentimentResult.analyses.filter((a: SentimentAnalysis) => a.sentiment === 'positive').length > sentimentResult.analyses.length / 2 
          ? 'positive' 
          : sentimentResult.analyses.filter((a: SentimentAnalysis) => a.sentiment === 'negative').length > sentimentResult.analyses.length / 2 
            ? 'negative' 
            : 'neutral';
        
        await sendFeedbackEmail(
          productName,
          platform,
          `Summary of ${reviewTexts.length} reviews analyzed. Sample: "${reviewTexts[0].substring(0, 200)}..."`,
          dominantSentiment,
          avgScore,
          insightsResult.insights
        );
        
        toast({
          title: "Analysis Complete! 📧",
          description: `Generated ${insightsResult.insights.length} insights and sent summary to your email`,
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        toast({
          title: "Analysis Complete!",
          description: `Generated ${insightsResult.insights.length} actionable insights (email notification failed)`,
        });
      }

    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "An error occurred during analysis",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveResults = async () => {
    if (reviews.length === 0 || analyses.length === 0) return;
    
    setIsSaving(true);
    try {
      // Save reviews
      for (let i = 0; i < reviews.length; i++) {
        await saveReview({
          product_name: productInfo.name,
          platform: productInfo.platform,
          review_text: reviews[i],
          sentiment: analyses[i].sentiment,
          sentiment_score: analyses[i].sentiment_score,
          keywords: analyses[i].keywords,
          rating: analyses[i].rating_estimate,
        });
      }

      // Save insights
      for (const insight of insights) {
        await saveInsight(insight);
      }

      // Send email notification with summary
      try {
        const avgScore = analyses.reduce((sum, a) => sum + a.sentiment_score, 0) / analyses.length;
        const dominantSentiment = analyses.filter(a => a.sentiment === 'positive').length > analyses.length / 2 
          ? 'positive' 
          : analyses.filter(a => a.sentiment === 'negative').length > analyses.length / 2 
            ? 'negative' 
            : 'neutral';
        
        await sendFeedbackEmail(
          productInfo.name,
          productInfo.platform,
          `Summary of ${reviews.length} reviews analyzed. Sample: "${reviews[0].substring(0, 200)}..."`,
          dominantSentiment,
          avgScore,
          insights
        );
        
        toast({
          title: "Results Saved & Email Sent!",
          description: `Saved ${reviews.length} reviews and sent summary to your email`,
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        toast({
          title: "Results Saved!",
          description: `Saved ${reviews.length} reviews and ${insights.length} insights (email notification unavailable)`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportCSV = () => {
    if (reviews.length === 0) return;

    const csvContent = [
      ['Review', 'Sentiment', 'Score', 'Rating', 'Keywords'].join(','),
      ...reviews.map((review, i) => {
        const a = analyses[i];
        return [
          `"${review.replace(/"/g, '""')}"`,
          a.sentiment,
          a.sentiment_score,
          a.rating_estimate,
          `"${a.keywords.join(', ')}"`
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sentiment-analysis-${productInfo.name}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const positiveCount = analyses.filter(a => a.sentiment === 'positive').length;
  const negativeCount = analyses.filter(a => a.sentiment === 'negative').length;
  const neutralCount = analyses.filter(a => a.sentiment === 'neutral').length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Analyze Reviews</h1>
          <p className="text-muted-foreground">
            Paste customer reviews to analyze sentiment and generate actionable insights
          </p>
        </div>

        <ReviewInput onAnalyze={handleAnalyze} isLoading={isLoading} />

        {/* Results Section */}
        {analyses.length > 0 && (
          <div className="space-y-8 animate-fade-in">
            {/* Action Bar */}
            <Card variant="glass" className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-sm py-1">
                    {productInfo.name}
                  </Badge>
                  <Badge variant="outline" className="text-sm py-1 capitalize">
                    {productInfo.platform}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {reviews.length} reviews analyzed
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleExportCSV}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button 
                    variant="success" 
                    size="sm" 
                    onClick={handleSaveResults}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                    )}
                    Save Results
                  </Button>
                </div>
              </div>
            </Card>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                title="Total Analyzed"
                value={reviews.length}
                icon={BarChart3}
              />
              <StatsCard
                title="Positive Reviews"
                value={positiveCount}
                subtitle={`${((positiveCount / reviews.length) * 100).toFixed(1)}%`}
                icon={TrendingUp}
                variant="success"
              />
              <StatsCard
                title="Negative Reviews"
                value={negativeCount}
                subtitle={`${((negativeCount / reviews.length) * 100).toFixed(1)}%`}
                icon={TrendingDown}
                variant="destructive"
              />
              <StatsCard
                title="Insights Generated"
                value={insights.length}
                icon={Lightbulb}
                variant="warning"
              />
            </div>

            {/* Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SentimentChart
                positive={positiveCount}
                negative={negativeCount}
                neutral={neutralCount}
              />

              {/* Top Keywords */}
              <Card variant="glass">
                <CardHeader>
                  <CardTitle className="text-lg">Extracted Topics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {summary?.topKeywords.map((keyword, i) => (
                      <Badge 
                        key={i} 
                        variant="outline"
                        className="text-sm py-1.5 px-3"
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Actionable Insights */}
            {insights.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Lightbulb className="h-6 w-6 text-primary" />
                  Actionable Insights
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {insights.map((insight, i) => (
                    <InsightCard key={i} insight={insight} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* Individual Reviews */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Review Analysis</h2>
              <div className="grid grid-cols-1 gap-3">
                {reviews.map((review, i) => (
                  <ReviewCard
                    key={i}
                    review={review}
                    analysis={analyses[i]}
                    index={i}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
