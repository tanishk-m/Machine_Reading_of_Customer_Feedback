import { ThumbsUp, ThumbsDown, Minus, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SentimentAnalysis } from "@/lib/api";

interface ReviewCardProps {
  review: string;
  analysis: SentimentAnalysis;
  index: number;
}

const sentimentConfig = {
  positive: {
    icon: ThumbsUp,
    color: 'text-success',
    bg: 'bg-success/10',
    border: 'border-success/30',
    badge: 'bg-success/20 text-success border-success/30',
  },
  negative: {
    icon: ThumbsDown,
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/30',
    badge: 'bg-destructive/20 text-destructive border-destructive/30',
  },
  neutral: {
    icon: Minus,
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/30',
    badge: 'bg-warning/20 text-warning border-warning/30',
  },
};

export function ReviewCard({ review, analysis, index }: ReviewCardProps) {
  const config = sentimentConfig[analysis.sentiment];
  const Icon = config.icon;

  const scorePercent = ((analysis.sentiment_score + 1) / 2) * 100;

  return (
    <Card 
      variant="default"
      className={cn(
        "border-l-4 animate-fade-in transition-all hover:shadow-lg",
        config.border
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            config.bg
          )}>
            <Icon className={cn("h-5 w-5", config.color)} />
          </div>

          <div className="flex-1 min-w-0 space-y-3">
            <p className="text-sm text-foreground leading-relaxed line-clamp-3">
              "{review}"
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={config.badge}>
                {analysis.sentiment}
              </Badge>

              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>Score:</span>
                <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full", config.bg.replace('/10', ''))}
                    style={{ width: `${scorePercent}%` }}
                  />
                </div>
                <span>{analysis.sentiment_score.toFixed(2)}</span>
              </div>

              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-3 w-3",
                      i < analysis.rating_estimate 
                        ? "fill-warning text-warning" 
                        : "text-muted"
                    )}
                  />
                ))}
              </div>
            </div>

            {analysis.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {analysis.keywords.slice(0, 4).map((keyword, i) => (
                  <span 
                    key={i}
                    className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
