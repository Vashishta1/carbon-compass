import { AppLayout } from '@/components/layout/AppLayout';
import { CreditBalance } from '@/components/dashboard/CreditBalance';
import { useCarbonData } from '@/hooks/useCarbonData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, ExternalLink, Calendar, DollarSign } from 'lucide-react';

export default function Credits() {
  const { credits, alerts, getCreditSummary } = useCarbonData();
  const creditSummary = getCreditSummary();
  const unresolvedAlerts = alerts.filter(a => !a.resolved);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success/10 text-success border-success/20">Active</Badge>;
      case 'expired':
        return <Badge variant="outline" className="text-muted-foreground">Expired</Badge>;
      case 'used':
        return <Badge className="bg-info/10 text-info border-info/20">Fully Used</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AppLayout 
      title="Carbon Credits" 
      subtitle="Manage your carbon offset portfolio"
      alertCount={unresolvedAlerts.length}
    >
      {/* Overview Cards */}
      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <CreditBalance {...creditSummary} />
        
        <Card className="shadow-card lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Credit Usage vs Emissions</CardTitle>
                <CardDescription>Offset coverage analysis</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <p className="text-sm text-muted-foreground mb-1">Total Emissions (YTD)</p>
                <p className="text-2xl font-bold font-mono-data">124,500</p>
                <p className="text-xs text-muted-foreground">kg CO₂e</p>
              </div>
              <div className="p-4 rounded-lg bg-success/5 border border-success/20">
                <p className="text-sm text-muted-foreground mb-1">Credits Used</p>
                <p className="text-2xl font-bold font-mono-data text-success">2,700</p>
                <p className="text-xs text-muted-foreground">tons CO₂e offset</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Net Zero Progress</span>
                <span className="font-medium">68%</span>
              </div>
              <Progress value={68} className="h-3" />
              <p className="text-xs text-muted-foreground">
                You're on track to achieve carbon neutrality by Q4 2025
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Credits List */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Carbon Credit Portfolio</CardTitle>
              <CardDescription>All purchased carbon credits and their status</CardDescription>
            </div>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Credit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Used</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {credits.map((credit) => {
                  const usagePercent = (credit.usedQuantity / credit.quantity) * 100;
                  return (
                    <TableRow key={credit.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{credit.projectName}</span>
                          <ExternalLink className="w-3 h-3 text-muted-foreground" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{credit.type}</Badge>
                      </TableCell>
                      <TableCell className="font-mono-data">
                        {credit.quantity.toLocaleString()} t
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Progress value={usagePercent} className="h-1.5 w-20" />
                          <span className="text-xs text-muted-foreground">
                            {credit.usedQuantity.toLocaleString()} / {credit.quantity.toLocaleString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono-data">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-muted-foreground" />
                          {credit.cost.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          {new Date(credit.expiryDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(credit.status)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Info Section */}
      <div className="grid gap-6 md:grid-cols-2 mt-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Credit Type Guide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">VCS</Badge>
              <div>
                <p className="font-medium">Verified Carbon Standard</p>
                <p className="text-sm text-muted-foreground">
                  World's most widely used voluntary GHG program
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">Gold Standard</Badge>
              <div>
                <p className="font-medium">Gold Standard</p>
                <p className="text-sm text-muted-foreground">
                  Premium credits with co-benefits for sustainable development
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">CDM</Badge>
              <div>
                <p className="font-medium">Clean Development Mechanism</p>
                <p className="text-sm text-muted-foreground">
                  UN-backed mechanism under the Kyoto Protocol
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">💡 Credit Strategy Tip</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Based on your current emission trajectory, we recommend purchasing 
              <span className="font-semibold text-foreground"> 3,500 additional credits</span> to 
              maintain carbon neutrality through 2026.
            </p>
            <Button variant="outline" className="w-full">
              View Recommendations
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
