import { AppLayout } from '@/components/layout/AppLayout';
import { useCarbonData } from '@/hooks/useCarbonData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Zap,
  Clock,
  X,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Alerts() {
  const { alerts, resolveAlert } = useCarbonData();
  
  const unresolvedAlerts = alerts.filter(a => !a.resolved);
  const resolvedAlerts = alerts.filter(a => a.resolved);

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'high':
        return {
          container: 'bg-destructive/5 border-destructive/20',
          icon: 'text-destructive',
          badge: 'bg-destructive/10 text-destructive border-destructive/20',
        };
      case 'medium':
        return {
          container: 'bg-warning/5 border-warning/20',
          icon: 'text-warning',
          badge: 'bg-warning/10 text-warning border-warning/20',
        };
      default:
        return {
          container: 'bg-info/5 border-info/20',
          icon: 'text-info',
          badge: 'bg-info/10 text-info border-info/20',
        };
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'spike':
        return <TrendingUp className="w-5 h-5" />;
      case 'unusual_pattern':
        return <Zap className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  return (
    <AppLayout 
      title="Anomaly Alerts" 
      subtitle="AI-detected unusual patterns in your emission data"
      alertCount={unresolvedAlerts.length}
    >
      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{unresolvedAlerts.filter(a => a.severity === 'high').length}</p>
                <p className="text-sm text-muted-foreground">High Priority</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{unresolvedAlerts.length}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{resolvedAlerts.length}</p>
                <p className="text-sm text-muted-foreground">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">All Alerts</CardTitle>
          <CardDescription>Review and manage detected anomalies</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active">
            <TabsList className="mb-4">
              <TabsTrigger value="active" className="gap-2">
                Active
                {unresolvedAlerts.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                    {unresolvedAlerts.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {unresolvedAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-success" />
                  </div>
                  <p className="text-lg font-medium text-foreground">All Clear!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    No active anomalies detected in your emission data
                  </p>
                </div>
              ) : (
                unresolvedAlerts.map((alert) => {
                  const styles = getSeverityStyles(alert.severity);
                  return (
                    <div
                      key={alert.id}
                      className={cn(
                        'flex items-start gap-4 p-5 rounded-xl border transition-all',
                        styles.container
                      )}
                    >
                      <div className={cn('flex-shrink-0 mt-0.5', styles.icon)}>
                        {getTypeIcon(alert.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className={styles.badge}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {alert.type.replace('_', ' ')}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(alert.detectedAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-foreground font-medium leading-relaxed">
                          {alert.message}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Entry ID: {alert.entryId}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-1">
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => resolveAlert(alert.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </TabsContent>

            <TabsContent value="resolved" className="space-y-4">
              {resolvedAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-muted-foreground">No resolved alerts yet</p>
                </div>
              ) : (
                resolvedAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-4 p-5 rounded-xl border border-border bg-muted/30 opacity-75"
                  >
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-muted-foreground">
                          RESOLVED
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(alert.detectedAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{alert.message}</p>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* AI Detection Info */}
      <Card className="shadow-card mt-6 bg-gradient-to-br from-info/5 to-info/10 border-info/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-info" />
            How AI Detection Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-medium">Spike Detection</h4>
              <p className="text-sm text-muted-foreground">
                Identifies sudden increases in emissions that exceed 150% of the moving average.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Pattern Analysis</h4>
              <p className="text-sm text-muted-foreground">
                Detects unusual patterns that deviate from historical trends and seasonal norms.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Data Validation</h4>
              <p className="text-sm text-muted-foreground">
                Flags missing data, outliers, and inconsistencies in manually entered data.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
