import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileInput, 
  BarChart3, 
  Coins, 
  FileText, 
  Settings,
  AlertTriangle,
  Leaf,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Data Entry', href: '/data-entry', icon: FileInput },
  { name: 'Emissions Analysis', href: '/emissions', icon: BarChart3 },
  { name: 'Forecasts', href: '/forecasts', icon: TrendingUp },
  { name: 'Carbon Credits', href: '/credits', icon: Coins },
  { name: 'Alerts', href: '/alerts', icon: AlertTriangle },
  { name: 'Reports', href: '/reports', icon: FileText },
];

interface SidebarProps {
  alertCount?: number;
}

export function Sidebar({ alertCount = 0 }: SidebarProps) {
  const location = useLocation();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-sidebar-primary/20">
          <Leaf className="w-6 h-6 text-sidebar-primary" />
        </div>
        <div>
          <h1 className="font-semibold text-lg text-sidebar-foreground">CarbonTrack</h1>
          <p className="text-xs text-sidebar-foreground/60">Enterprise Edition</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive 
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg' 
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.name}</span>
              {item.name === 'Alerts' && alertCount > 0 && (
                <span className="ml-auto flex items-center justify-center w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold">
                  {alertCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        <Link
          to="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-200"
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </Link>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-sidebar-border">
        <div className="text-xs text-sidebar-foreground/50">
          <p>© 2025 CarbonTrack</p>
          <p className="mt-1">AI-Powered Sustainability</p>
        </div>
      </div>
    </aside>
  );
}
