import { 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  Package, 
  Truck, 
  Headphones,
  DollarSign,
  Megaphone,
  Star
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ActionableInsight } from "@/lib/api";

const categoryIcons: Record<string, React.ElementType> = {
  product: Package,
  service: Headphones,
  marketing: Megaphone,
  pricing: DollarSign,
  delivery: Truck,
  quality: Star,
};

const priorityStyles = {
  high: {
    badge: 'bg-destructive/20 text-destructive border-destructive/30',
    border: 'border-l-destructive',
    icon: 'text-destructive',
  },
  medium: {
    badge: 'bg-warning/20 text-warning border-warning/30',
    border: 'border-l-warning',
    icon: 'text-warning',
  },
  low: {
    badge: 'bg-info/20 text-info border-info/30',
    border: 'border-l-info',
    icon: 'text-info',
  },
};

interface InsightCardProps {
  insight: ActionableInsight;
  index?: number;
}

export function InsightCard({ insight, index = 0 }: InsightCardProps) {
  const Icon = categoryIcons[insight.category] || Lightbulb;
  const priority = priorityStyles[insight.priority] || priorityStyles.medium;

  return (
    <Card 
      variant="elevated"
      className={cn(
        "border-l-4 animate-fade-in overflow-hidden",
        priority.border
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg bg-secondary",
              priority.icon
            )}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{insight.title}</h3>
              <p className="text-xs text-muted-foreground capitalize">{insight.category} • {insight.impact_area}</p>
            </div>
          </div>
          <Badge variant="outline" className={priority.badge}>
            {insight.priority} priority
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {insight.description}
        </p>
        
        <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
          <div className="flex items-start gap-2">
            <TrendingUp className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-primary mb-1">Recommended Action</p>
              <p className="text-sm text-foreground">{insight.recommendation}</p>
            </div>
          </div>
        </div>

        {insight.review_count && insight.review_count > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <AlertTriangle className="h-3 w-3" />
            <span>Based on {insight.review_count} reviews mentioning this topic</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
