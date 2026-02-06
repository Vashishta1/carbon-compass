import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface ScopeBreakdownProps {
  scope1: number;
  scope2: number;
  scope3: number;
}

export function ScopeBreakdown({ scope1, scope2, scope3 }: ScopeBreakdownProps) {
  const total = scope1 + scope2 + scope3;
  
  const data = [
    { name: 'Scope 1', value: scope1, color: 'hsl(var(--scope1))', description: 'Direct emissions' },
    { name: 'Scope 2', value: scope2, color: 'hsl(var(--scope2))', description: 'Indirect from energy' },
    { name: 'Scope 3', value: scope3, color: 'hsl(var(--scope3))', description: 'Other indirect' },
  ];

  const getPercentage = (value: number) => {
    return total > 0 ? ((value / total) * 100).toFixed(1) : '0';
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-lg">Emission Scope Breakdown</CardTitle>
        <CardDescription>Distribution by emission scope</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row items-center gap-6">
          {/* Pie Chart */}
          <div className="h-64 w-64 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value.toLocaleString()} kg CO₂e`, '']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-4">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold font-mono-data">{item.value.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">{getPercentage(item.value)}%</p>
                </div>
              </div>
            ))}
            
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <p className="font-medium text-foreground">Total Emissions</p>
                <p className="text-xl font-bold font-mono-data text-primary">
                  {total.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">kg CO₂e</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
