import { AppLayout } from '@/components/layout/AppLayout';
import { useCarbonData } from '@/hooks/useCarbonData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, TrendingDown, Target, Brain } from 'lucide-react';

export default function Forecasts() {
  const { forecasts, alerts, getSummary, getMonthlyTrends } = useCarbonData();
  const summary = getSummary();
  const monthlyTrends = getMonthlyTrends();
  const unresolvedAlerts = alerts.filter(a => !a.resolved);

  // Combine historical and forecast data
  const combinedData = [
    ...monthlyTrends.slice(-6).map(d => ({
      period: d.month,
      actual: d.total,
      predicted: null,
      lower: null,
      upper: null,
    })),
    ...forecasts.map(f => ({
      period: f.period,
      actual: null,
      predicted: f.predictedEmissions,
      lower: f.confidenceInterval.lower,
      upper: f.confidenceInterval.upper,
    })),
  ];

  const totalPredicted = forecasts.reduce((sum, f) => sum + f.predictedEmissions, 0);
  const avgMonthlyPrediction = totalPredicted / forecasts.length;
  const currentMonthly = summary.totalEmissions;
  const trendPercentage = ((avgMonthlyPrediction - currentMonthly) / currentMonthly) * 100;

  return (
    <AppLayout 
      title="AI Forecasts" 
      subtitle="Predicted emissions based on historical patterns"
      alertCount={unresolvedAlerts.length}
    >
      {/* Key Forecast Metrics */}
      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">6-Month Forecast</p>
                <p className="text-3xl font-bold font-mono-data mt-1">
                  {Math.round(totalPredicted).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">kg CO₂e total</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                <Brain className="w-6 h-6 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Monthly Prediction</p>
                <p className="text-3xl font-bold font-mono-data mt-1">
                  {Math.round(avgMonthlyPrediction).toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {trendPercentage > 0 ? (
                    <>
                      <TrendingUp className="w-4 h-4 text-destructive" />
                      <span className="text-sm text-destructive">+{trendPercentage.toFixed(1)}%</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-4 h-4 text-success" />
                      <span className="text-sm text-success">{trendPercentage.toFixed(1)}%</span>
                    </>
                  )}
                  <span className="text-sm text-muted-foreground">vs current</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Confidence Level</p>
                <p className="text-3xl font-bold font-mono-data mt-1">85%</p>
                <p className="text-sm text-muted-foreground">prediction accuracy</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forecast Chart */}
      <Card className="shadow-card mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Emission Forecast</CardTitle>
              <CardDescription>Historical data with AI-predicted future emissions</CardDescription>
            </div>
            <Badge variant="outline" className="gap-1">
              <Brain className="w-3 h-3" />
              AI Powered
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={combinedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--info))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--info))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--info))" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="hsl(var(--info))" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="period" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number | null, name: string) => {
                    if (value === null) return ['-', name];
                    const label = name === 'actual' ? 'Actual' : 
                                  name === 'predicted' ? 'Predicted' :
                                  name === 'upper' ? 'Upper Bound' : 'Lower Bound';
                    return [`${Math.round(value).toLocaleString()} kg CO₂e`, label];
                  }}
                />
                {/* Confidence interval */}
                <Area
                  type="monotone"
                  dataKey="upper"
                  stroke="none"
                  fill="url(#confidenceGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="lower"
                  stroke="none"
                  fill="hsl(var(--background))"
                />
                {/* Actual emissions */}
                <Area
                  type="monotone"
                  dataKey="actual"
                  name="actual"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#actualGradient)"
                  connectNulls={false}
                />
                {/* Predicted emissions */}
                <Area
                  type="monotone"
                  dataKey="predicted"
                  name="predicted"
                  stroke="hsl(var(--info))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="url(#predictedGradient)"
                  connectNulls={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-primary" />
              <span className="text-muted-foreground">Historical</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-info" style={{ backgroundImage: 'repeating-linear-gradient(90deg, hsl(var(--info)) 0, hsl(var(--info)) 4px, transparent 4px, transparent 8px)' }} />
              <span className="text-muted-foreground">Predicted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 bg-info/10 rounded" />
              <span className="text-muted-foreground">Confidence Interval</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Forecast Details */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Monthly Forecast Details</CardTitle>
          <CardDescription>Predicted emissions breakdown by scope</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {forecasts.map((forecast) => (
              <div
                key={forecast.period}
                className="p-4 rounded-lg border border-border bg-muted/30"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-foreground">{forecast.period}</span>
                  <Badge variant="outline" className="text-info border-info">
                    {Math.round(forecast.predictedEmissions).toLocaleString()} kg
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Scope 1</span>
                    <span className="font-mono-data">{Math.round(forecast.scope1).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Scope 2</span>
                    <span className="font-mono-data">{Math.round(forecast.scope2).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Scope 3</span>
                    <span className="font-mono-data">{Math.round(forecast.scope3).toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-border text-xs text-muted-foreground">
                    Range: {Math.round(forecast.confidenceInterval.lower).toLocaleString()} - {Math.round(forecast.confidenceInterval.upper).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
