import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface SentimentChartProps {
  positive: number;
  negative: number;
  neutral: number;
}

export function SentimentChart({ positive, negative, neutral }: SentimentChartProps) {
  const data = [
    { name: 'Positive', value: positive, color: 'hsl(160, 84%, 39%)' },
    { name: 'Negative', value: negative, color: 'hsl(0, 84%, 60%)' },
    { name: 'Neutral', value: neutral, color: 'hsl(38, 92%, 50%)' },
  ].filter(d => d.value > 0);

  const total = positive + negative + neutral;

  return (
    <Card variant="glass" className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Sentiment Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <div className="flex h-[250px] items-center justify-center text-muted-foreground">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    className="transition-all hover:opacity-80"
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(222, 47%, 8%)',
                  border: '1px solid hsl(222, 30%, 18%)',
                  borderRadius: '8px',
                  color: 'hsl(210, 40%, 98%)'
                }}
                formatter={(value: number) => [`${value} reviews`, '']}
              />
              <Legend 
                verticalAlign="bottom"
                formatter={(value) => (
                  <span className="text-sm text-muted-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
