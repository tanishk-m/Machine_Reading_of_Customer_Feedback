import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { InsightCard } from "@/components/insights/InsightCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getInsights, type ActionableInsight } from "@/lib/api";
import { 
  Lightbulb, 
  Filter, 
  Package, 
  Headphones, 
  Megaphone, 
  DollarSign, 
  Truck, 
  Star,
  RefreshCw,
  AlertTriangle
} from "lucide-react";

const categoryConfig = {
  all: { label: 'All', icon: Filter },
  product: { label: 'Product', icon: Package },
  service: { label: 'Service', icon: Headphones },
  marketing: { label: 'Marketing', icon: Megaphone },
  pricing: { label: 'Pricing', icon: DollarSign },
  delivery: { label: 'Delivery', icon: Truck },
  quality: { label: 'Quality', icon: Star },
};

export default function Insights() {
  const [insights, setInsights] = useState<ActionableInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activePriority, setActivePriority] = useState('all');

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    setIsLoading(true);
    try {
      const data = await getInsights(100);
      setInsights(data || []);
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInsights = insights.filter(insight => {
    if (activeCategory !== 'all' && insight.category !== activeCategory) return false;
    if (activePriority !== 'all' && insight.priority !== activePriority) return false;
    return true;
  });

  const highPriorityCount = insights.filter(i => i.priority === 'high').length;
  const mediumPriorityCount = insights.filter(i => i.priority === 'medium').length;
  const lowPriorityCount = insights.filter(i => i.priority === 'low').length;

  const categories = [...new Set(insights.map(i => i.category))];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Lightbulb className="h-8 w-8 text-primary" />
              Actionable Insights
            </h1>
            <p className="text-muted-foreground">
              AI-generated recommendations to improve your products and services
            </p>
          </div>
          <Button variant="outline" onClick={fetchInsights} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Priority Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card 
            variant={activePriority === 'high' ? 'glow' : 'default'}
            className="cursor-pointer transition-all"
            onClick={() => setActivePriority(activePriority === 'high' ? 'all' : 'high')}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-destructive/20 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{highPriorityCount}</p>
                  <p className="text-xs text-muted-foreground">High Priority</p>
                </div>
              </div>
              <Badge className="bg-destructive/20 text-destructive border-destructive/30">
                Urgent
              </Badge>
            </CardContent>
          </Card>

          <Card 
            variant={activePriority === 'medium' ? 'glow' : 'default'}
            className="cursor-pointer transition-all"
            onClick={() => setActivePriority(activePriority === 'medium' ? 'all' : 'medium')}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-warning/20 flex items-center justify-center">
                  <Lightbulb className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{mediumPriorityCount}</p>
                  <p className="text-xs text-muted-foreground">Medium Priority</p>
                </div>
              </div>
              <Badge className="bg-warning/20 text-warning border-warning/30">
                Important
              </Badge>
            </CardContent>
          </Card>

          <Card 
            variant={activePriority === 'low' ? 'glow' : 'default'}
            className="cursor-pointer transition-all"
            onClick={() => setActivePriority(activePriority === 'low' ? 'all' : 'low')}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-info/20 flex items-center justify-center">
                  <Star className="h-5 w-5 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{lowPriorityCount}</p>
                  <p className="text-xs text-muted-foreground">Low Priority</p>
                </div>
              </div>
              <Badge className="bg-info/20 text-info border-info/30">
                Optional
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(categoryConfig).map(([key, config]) => {
            const Icon = config.icon;
            const count = key === 'all' 
              ? insights.length 
              : insights.filter(i => i.category === key).length;
            
            return (
              <Button
                key={key}
                variant={activeCategory === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(key)}
                className="gap-2"
              >
                <Icon className="h-4 w-4" />
                {config.label}
                <Badge variant="secondary" className="ml-1 text-xs">
                  {count}
                </Badge>
              </Button>
            );
          })}
        </div>

        {/* Insights Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="h-48 animate-pulse bg-muted" />
            ))}
          </div>
        ) : filteredInsights.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredInsights.map((insight, i) => (
              <InsightCard key={insight.id || i} insight={insight} index={i} />
            ))}
          </div>
        ) : (
          <Card variant="glass" className="p-12 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="h-16 w-16 mx-auto rounded-2xl bg-muted flex items-center justify-center">
                <Lightbulb className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold">No Insights Found</h3>
              <p className="text-muted-foreground">
                {insights.length === 0 
                  ? "Analyze some reviews to generate actionable insights."
                  : "No insights match the current filters."}
              </p>
              {activePriority !== 'all' || activeCategory !== 'all' ? (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setActiveCategory('all');
                    setActivePriority('all');
                  }}
                >
                  Clear Filters
                </Button>
              ) : null}
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
