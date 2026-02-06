import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface ChartData {
  month: string;
  scope1: number;
  scope2: number;
  scope3: number;
  total: number;
}

interface EmissionChartProps {
  data: ChartData[];
  title?: string;
  description?: string;
}

export function EmissionChart({ 
  data, 
  title = "Emission Trends",
  description = "Monthly carbon emissions by scope"
}: EmissionChartProps) {
  const formattedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      scope1: Math.round(item.scope1),
      scope2: Math.round(item.scope2),
      scope3: Math.round(item.scope3),
      total: Math.round(item.total),
    }));
  }, [data]);

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="scope1Gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--scope1))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--scope1))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="scope2Gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--scope2))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--scope2))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="scope3Gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--scope3))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--scope3))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                className="text-muted-foreground"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px hsl(var(--foreground) / 0.1)',
                }}
                formatter={(value: number) => [`${value.toLocaleString()} kg CO₂e`, '']}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="scope1"
                name="Scope 1"
                stroke="hsl(var(--scope1))"
                strokeWidth={2}
                fill="url(#scope1Gradient)"
              />
              <Area
                type="monotone"
                dataKey="scope2"
                name="Scope 2"
                stroke="hsl(var(--scope2))"
                strokeWidth={2}
                fill="url(#scope2Gradient)"
              />
              <Area
                type="monotone"
                dataKey="scope3"
                name="Scope 3"
                stroke="hsl(var(--scope3))"
                strokeWidth={2}
                fill="url(#scope3Gradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
