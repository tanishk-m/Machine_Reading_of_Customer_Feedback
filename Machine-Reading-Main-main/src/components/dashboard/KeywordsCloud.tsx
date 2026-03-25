import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface KeywordsCloudProps {
  keywords: string[];
}

export function KeywordsCloud({ keywords }: KeywordsCloudProps) {
  // Count keyword frequency
  const keywordCount: Record<string, number> = {};
  keywords.forEach(k => {
    const key = k.toLowerCase();
    keywordCount[key] = (keywordCount[key] || 0) + 1;
  });

  // Sort by frequency and take top 15
  const sortedKeywords = Object.entries(keywordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  const maxCount = sortedKeywords[0]?.[1] || 1;

  const getSizeClass = (count: number) => {
    const ratio = count / maxCount;
    if (ratio > 0.7) return 'text-lg font-bold';
    if (ratio > 0.4) return 'text-base font-semibold';
    return 'text-sm font-medium';
  };

  const getColorClass = (index: number) => {
    const colors = [
      'bg-primary/20 text-primary border-primary/30',
      'bg-info/20 text-info border-info/30',
      'bg-success/20 text-success border-success/30',
      'bg-warning/20 text-warning border-warning/30',
      'bg-secondary text-secondary-foreground border-secondary',
    ];
    return colors[index % colors.length];
  };

  return (
    <Card variant="glass" className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Top Keywords</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedKeywords.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-muted-foreground">
            No keywords extracted yet
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {sortedKeywords.map(([keyword, count], index) => (
              <Badge 
                key={keyword}
                variant="outline"
                className={`${getSizeClass(count)} ${getColorClass(index)} px-3 py-1.5 transition-all hover:scale-105`}
              >
                {keyword}
                <span className="ml-1.5 opacity-60">({count})</span>
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
