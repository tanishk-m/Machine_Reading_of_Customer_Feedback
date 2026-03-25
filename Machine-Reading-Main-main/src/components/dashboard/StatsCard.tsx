import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}

const variantStyles = {
  default: {
    icon: 'bg-primary/10 text-primary',
    trend: 'text-primary',
  },
  success: {
    icon: 'bg-success/10 text-success',
    trend: 'text-success',
  },
  warning: {
    icon: 'bg-warning/10 text-warning',
    trend: 'text-warning',
  },
  destructive: {
    icon: 'bg-destructive/10 text-destructive',
    trend: 'text-destructive',
  },
};

export function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  variant = 'default' 
}: StatsCardProps) {
  const styles = variantStyles[variant];

  return (
    <Card variant="elevated" className="overflow-hidden group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
            {trend && (
              <div className={cn("flex items-center gap-1 text-sm font-medium", styles.trend)}>
                <span>{trend.isPositive ? '↑' : '↓'}</span>
                <span>{Math.abs(trend.value)}%</span>
                <span className="text-muted-foreground font-normal">vs last period</span>
              </div>
            )}
          </div>
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110",
            styles.icon
          )}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
