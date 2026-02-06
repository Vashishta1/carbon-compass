import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { EmissionChart } from '@/components/dashboard/EmissionChart';
import { ScopeBreakdown } from '@/components/dashboard/ScopeBreakdown';
import { useCarbonData } from '@/hooks/useCarbonData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertTriangle, Download, Filter } from 'lucide-react';
import { EmissionCategory } from '@/types/carbon';

const categoryLabels: Record<EmissionCategory, string> = {
  fuel_consumption: 'Fuel Consumption',
  electricity: 'Electricity',
  raw_materials: 'Raw Materials',
  transportation: 'Transportation',
  employee_travel: 'Employee Travel',
  waste: 'Waste',
  production: 'Production',
};

export default function Emissions() {
  const { emissions, alerts, getSummary, getMonthlyTrends } = useCarbonData();
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [scopeFilter, setScopeFilter] = useState<string>('all');
  
  const summary = getSummary();
  const monthlyTrends = getMonthlyTrends();
  const unresolvedAlerts = alerts.filter(a => !a.resolved);

  const filteredEmissions = emissions.filter(e => {
    if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
    if (scopeFilter !== 'all' && e.scope.toString() !== scopeFilter) return false;
    return true;
  }).slice(-50); // Show last 50 entries

  return (
    <AppLayout 
      title="Emissions Analysis" 
      subtitle="Detailed view of your carbon emissions"
      alertCount={unresolvedAlerts.length}
    >
      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <div className="lg:col-span-2">
          <EmissionChart 
            data={monthlyTrends}
            title="Historical Emissions"
            description="12-month emission trend by scope"
          />
        </div>
        <ScopeBreakdown 
          scope1={summary.scope1}
          scope2={summary.scope2}
          scope3={summary.scope3}
        />
      </div>

      {/* Category Breakdown */}
      <Card className="shadow-card mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Emissions by Category</CardTitle>
          <CardDescription>Current month breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Object.entries(summary.byCategory).map(([category, value]) => (
              <div
                key={category}
                className="p-4 rounded-lg bg-muted/50 border border-border"
              >
                <p className="text-sm text-muted-foreground mb-1">
                  {categoryLabels[category as EmissionCategory]}
                </p>
                <p className="text-xl font-bold font-mono-data">
                  {Math.round(value).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">kg CO₂e</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Emission Records</CardTitle>
              <CardDescription>All manually entered emission data</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={scopeFilter} onValueChange={setScopeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Scopes</SelectItem>
                  <SelectItem value="1">Scope 1</SelectItem>
                  <SelectItem value="2">Scope 2</SelectItem>
                  <SelectItem value="3">Scope 3</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="text-right">CO₂e (kg)</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmissions.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-mono-data text-sm">
                      {new Date(entry.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {categoryLabels[entry.category]}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={
                          entry.scope === 1 ? 'border-scope1 text-scope1' :
                          entry.scope === 2 ? 'border-scope2 text-scope2' :
                          'border-scope3 text-scope3'
                        }
                      >
                        Scope {entry.scope}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono-data">
                      {entry.value.toLocaleString()} {entry.unit}
                    </TableCell>
                    <TableCell className="text-right font-mono-data font-medium">
                      {Math.round(entry.co2Equivalent).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {entry.source}
                    </TableCell>
                    <TableCell>
                      {entry.isAnomaly && (
                        <AlertTriangle className="w-4 h-4 text-warning" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
