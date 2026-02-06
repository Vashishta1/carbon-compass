import { Link } from 'react-router-dom';
import { Plus, Upload, FileText, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const actions = [
  {
    title: 'Add Emission Data',
    description: 'Enter fuel, electricity, or transport data',
    icon: Plus,
    href: '/data-entry',
    color: 'bg-primary/10 text-primary',
  },
  {
    title: 'Upload Data File',
    description: 'Import from Excel, CSV, or PDF',
    icon: Upload,
    href: '/data-entry?tab=upload',
    color: 'bg-info/10 text-info',
  },
  {
    title: 'Generate Report',
    description: 'Create emission summary report',
    icon: FileText,
    href: '/reports',
    color: 'bg-success/10 text-success',
  },
  {
    title: 'View Analysis',
    description: 'Explore detailed emissions data',
    icon: BarChart3,
    href: '/emissions',
    color: 'bg-warning/10 text-warning',
  },
];

export function QuickActions() {
  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                to={action.href}
                className="group flex flex-col p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all duration-200"
              >
                <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                  {action.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {action.description}
                </p>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
