import { Coins, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface CreditBalanceProps {
  totalCredits: number;
  usedCredits: number;
  availableCredits: number;
  totalValue: number;
  activeCount: number;
}

export function CreditBalance({
  totalCredits,
  usedCredits,
  availableCredits,
  totalValue,
  activeCount,
}: CreditBalanceProps) {
  const usagePercentage = totalCredits > 0 ? (usedCredits / totalCredits) * 100 : 0;

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Carbon Credit Balance</CardTitle>
            <CardDescription>Active credits and usage status</CardDescription>
          </div>
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-success/10 text-success">
            <Coins className="w-6 h-6" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Balance */}
        <div className="text-center p-6 rounded-xl bg-gradient-to-br from-success/5 to-success/10 border border-success/20">
          <p className="text-sm font-medium text-muted-foreground mb-1">Available Credits</p>
          <p className="text-4xl font-bold text-success font-mono-data">
            {availableCredits.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground mt-1">tons CO₂e</p>
        </div>

        {/* Usage Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Credit Usage</span>
            <span className="font-medium">{usagePercentage.toFixed(1)}%</span>
          </div>
          <Progress value={usagePercentage} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{usedCredits.toLocaleString()} used</span>
            <span>{totalCredits.toLocaleString()} total</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-secondary/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">Total Value</span>
            </div>
            <p className="text-lg font-semibold font-mono-data">
              ${totalValue.toLocaleString()}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-secondary/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Active Credits</span>
            </div>
            <p className="text-lg font-semibold font-mono-data">
              {activeCount} projects
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
