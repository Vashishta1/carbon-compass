import { AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnomalyAlert } from '@/types/carbon';
import { cn } from '@/lib/utils';

interface AlertsListProps {
  alerts: AnomalyAlert[];
  onResolve: (alertId: string) => void;
  maxItems?: number;
}

export function AlertsList({ alerts, onResolve, maxItems = 5 }: AlertsListProps) {
  const unresolvedAlerts = alerts.filter(a => !a.resolved).slice(0, maxItems);

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-destructive/10 border-destructive/20 text-destructive';
      case 'medium':
        return 'bg-warning/10 border-warning/20 text-warning';
      default:
        return 'bg-info/10 border-info/20 text-info';
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">AI Anomaly Alerts</CardTitle>
            <CardDescription>Unusual patterns detected in your data</CardDescription>
          </div>
          {unresolvedAlerts.length > 0 && (
            <span className="flex items-center justify-center px-2.5 py-1 rounded-full bg-destructive/10 text-destructive text-sm font-medium">
              {unresolvedAlerts.length} active
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {unresolvedAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6 text-success" />
            </div>
            <p className="font-medium text-foreground">No Active Alerts</p>
            <p className="text-sm text-muted-foreground mt-1">
              All anomalies have been reviewed
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {unresolvedAlerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  'flex items-start gap-3 p-4 rounded-lg border transition-all',
                  getSeverityStyles(alert.severity)
                )}
              >
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium uppercase tracking-wide opacity-70">
                      {alert.type.replace('_', ' ')}
                    </span>
                    <span className="text-xs opacity-50">•</span>
                    <span className="text-xs opacity-70">
                      {new Date(alert.detectedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm font-medium leading-relaxed">
                    {alert.message}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0 h-8 w-8 hover:bg-background/50"
                  onClick={() => onResolve(alert.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
