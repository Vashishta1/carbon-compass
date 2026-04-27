import { AppLayout } from '@/components/layout/AppLayout';
import { useCarbonData } from '@/hooks/useCarbonData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  FileText, 
  Download, 
  Calendar, 
  BarChart3, 
  PieChart, 
  TrendingUp,
  FileSpreadsheet,
  File
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { generatePDFReport, generateExcelReport } from '@/lib/reportGenerator';

const reportTypes = [
  {
    id: 'monthly',
    title: 'Monthly Summary',
    description: 'Overview of emissions, credits, and trends for the month',
    icon: Calendar,
    frequency: 'Monthly',
  },
  {
    id: 'scope',
    title: 'Scope Analysis',
    description: 'Detailed breakdown by Scope 1, 2, and 3 emissions',
    icon: PieChart,
    frequency: 'On-demand',
  },
  {
    id: 'trend',
    title: 'Trend Report',
    description: 'Historical trends with AI-powered insights',
    icon: TrendingUp,
    frequency: 'Quarterly',
  },
  {
    id: 'compliance',
    title: 'Compliance Report',
    description: 'Regulatory compliance and carbon credit usage',
    icon: BarChart3,
    frequency: 'Annual',
  },
];

const recentReports = [
  { name: 'January 2026 Summary', date: '2026-02-01', type: 'Monthly', size: '2.4 MB' },
  { name: 'Q4 2025 Trend Analysis', date: '2026-01-15', type: 'Quarterly', size: '4.1 MB' },
  { name: 'Annual Compliance 2025', date: '2026-01-10', type: 'Annual', size: '8.7 MB' },
  { name: 'December 2025 Summary', date: '2025-01-05', type: 'Monthly', size: '2.1 MB' },
];

export default function Reports() {
  const { emissions, credits, alerts, getSummary, getCreditSummary } = useCarbonData();
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [reportType, setReportType] = useState('monthly');
  const [format, setFormat] = useState('pdf');
  const [generating, setGenerating] = useState(false);

  const summary = getSummary();
  const creditSummary = getCreditSummary();
  const unresolvedAlerts = alerts.filter(a => !a.resolved);

  const handleGenerate = () => {
    if (emissions.length === 0 && credits.length === 0) {
      toast.error('No data available. Add emissions or credits first.');
      return;
    }
    setGenerating(true);
    try {
      const payload = {
        reportType,
        period: selectedPeriod,
        emissions,
        credits,
        alerts,
        summary,
        creditSummary,
      };
      if (format === 'pdf') {
        generatePDFReport(payload);
      } else {
        generateExcelReport(payload);
      }
      toast.success(`${format.toUpperCase()} report downloaded`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <AppLayout 
      title="Reports" 
      subtitle="Generate and download emission reports"
      alertCount={unresolvedAlerts.length}
    >
      {/* Report Generator */}
      <Card className="shadow-card mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Generate Report</CardTitle>
          <CardDescription>Create custom emission reports for any period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Period</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current-month">Current Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="current-quarter">Current Quarter</SelectItem>
                  <SelectItem value="last-quarter">Last Quarter</SelectItem>
                  <SelectItem value="current-year">Current Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Format</label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">
                    <div className="flex items-center gap-2">
                      <File className="w-4 h-4" />
                      PDF Report
                    </div>
                  </SelectItem>
                  <SelectItem value="excel">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4" />
                      Excel Spreadsheet
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="gap-2" onClick={handleGenerate} disabled={generating}>
                <Download className="w-4 h-4" />
                {generating ? 'Generating…' : 'Generate'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Types */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.id} className="shadow-card hover:shadow-card-hover transition-all cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-foreground">{report.title}</h3>
                      <Badge variant="outline">{report.frequency}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{report.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Summary Preview */}
      <Card className="shadow-card mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Current Period Summary</CardTitle>
          <CardDescription>Quick preview of key metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground mb-1">Total Emissions</p>
              <p className="text-2xl font-bold font-mono-data">
                {Math.round(summary.totalEmissions).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">kg CO₂e</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground mb-1">Credits Available</p>
              <p className="text-2xl font-bold font-mono-data text-success">
                {creditSummary.availableCredits.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">tons CO₂e</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground mb-1">Anomalies Detected</p>
              <p className="text-2xl font-bold font-mono-data text-warning">
                {unresolvedAlerts.length}
              </p>
              <p className="text-xs text-muted-foreground">pending review</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground mb-1">Trend</p>
              <p className="text-2xl font-bold font-mono-data capitalize">
                {summary.trend}
              </p>
              <p className="text-xs text-muted-foreground">
                {summary.percentageChange > 0 ? '+' : ''}{summary.percentageChange.toFixed(1)}% vs last period
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Recent Reports</CardTitle>
          <CardDescription>Previously generated reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentReports.map((report, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-info" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{report.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{new Date(report.date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{report.size}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{report.type}</Badge>
                  <Button variant="ghost" size="icon">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
