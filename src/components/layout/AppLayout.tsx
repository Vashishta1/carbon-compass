import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface AppLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  alertCount?: number;
}

export function AppLayout({ children, title, subtitle, alertCount }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar alertCount={alertCount} />
      <div className="pl-64">
        <Header title={title} subtitle={subtitle} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
