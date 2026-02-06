import { AppLayout } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { EmissionChart } from '@/components/dashboard/EmissionChart';
import { ScopeBreakdown } from '@/components/dashboard/ScopeBreakdown';
import { CreditBalance } from '@/components/dashboard/CreditBalance';
import { AlertsList } from '@/components/dashboard/AlertsList';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { useCarbonData } from '@/hooks/useCarbonData';
import { Factory, Zap, Truck, Leaf } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { 
    alerts, 
    isLoading, 
    getSummary, 
    getCreditSummary, 
    getMonthlyTrends,
    resolveAlert 
  } = useCarbonData();

  if (isLoading) {
    return (
      <AppLayout title="Dashboard" subtitle="Loading your sustainability metrics...">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3 mt-6">
          <Skeleton className="h-96 lg:col-span-2 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  const summary = getSummary();
  const creditSummary = getCreditSummary();
  const monthlyTrends = getMonthlyTrends();
  const unresolvedAlerts = alerts.filter(a => !a.resolved);

  return (
    <AppLayout 
      title="Dashboard" 
      subtitle="Carbon footprint overview and insights"
      alertCount={unresolvedAlerts.length}
    >
      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          title="Total Emissions (This Month)"
          value={Math.round(summary.totalEmissions)}
          unit="kg CO₂e"
          change={summary.percentageChange}
          changeLabel="vs last month"
          trend={summary.trend === 'increasing' ? 'up' : summary.trend === 'decreasing' ? 'down' : 'neutral'}
          icon={<Factory className="w-6 h-6" />}
          variant="primary"
        />
        <StatCard
          title="Scope 1 (Direct)"
          value={Math.round(summary.scope1)}
          unit="kg CO₂e"
          icon={<Factory className="w-5 h-5" />}
        />
        <StatCard
          title="Scope 2 (Energy)"
          value={Math.round(summary.scope2)}
          unit="kg CO₂e"
          icon={<Zap className="w-5 h-5" />}
          variant="info"
        />
        <StatCard
          title="Scope 3 (Indirect)"
          value={Math.round(summary.scope3)}
          unit="kg CO₂e"
          icon={<Truck className="w-5 h-5" />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <div className="lg:col-span-2">
          <EmissionChart data={monthlyTrends} />
        </div>
        <ScopeBreakdown 
          scope1={summary.scope1}
          scope2={summary.scope2}
          scope3={summary.scope3}
        />
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <CreditBalance {...creditSummary} />
        <AlertsList alerts={alerts} onResolve={resolveAlert} />
        <QuickActions />
      </div>
    </AppLayout>
  );
}
