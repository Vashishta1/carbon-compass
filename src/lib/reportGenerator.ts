import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type { EmissionEntry, CarbonCredit, AnomalyAlert } from '@/types/carbon';

interface ReportData {
  reportType: string;
  period: string;
  emissions: EmissionEntry[];
  credits: CarbonCredit[];
  alerts: AnomalyAlert[];
  summary: {
    totalEmissions: number;
    scope1: number;
    scope2: number;
    scope3: number;
    trend: string;
    percentageChange: number;
  };
  creditSummary: {
    totalCredits: number;
    usedCredits: number;
    availableCredits: number;
  };
}

const reportTitleMap: Record<string, string> = {
  monthly: 'Monthly Summary Report',
  scope: 'Scope Analysis Report',
  trend: 'Trend Analysis Report',
  compliance: 'Compliance Report',
};

const periodLabelMap: Record<string, string> = {
  'current-month': 'Current Month',
  'last-month': 'Last Month',
  'current-quarter': 'Current Quarter',
  'last-quarter': 'Last Quarter',
  'current-year': 'Current Year',
  custom: 'Custom Range',
};

export function generatePDFReport(data: ReportData): void {
  const doc = new jsPDF();
  const title = reportTitleMap[data.reportType] || 'Carbon Footprint Report';
  const period = periodLabelMap[data.period] || data.period;
  const generatedAt = new Date().toLocaleString();

  // Header
  doc.setFillColor(34, 139, 87);
  doc.rect(0, 0, 210, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text('CarbonTrack', 14, 15);
  doc.setFontSize(10);
  doc.text('Enterprise Edition', 14, 22);

  // Title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.text(title, 14, 42);
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Period: ${period}`, 14, 49);
  doc.text(`Generated: ${generatedAt}`, 14, 55);

  // Summary section
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(13);
  doc.text('Executive Summary', 14, 68);

  autoTable(doc, {
    startY: 72,
    head: [['Metric', 'Value']],
    body: [
      ['Total Emissions', `${Math.round(data.summary.totalEmissions).toLocaleString()} kg CO₂e`],
      ['Scope 1 (Direct)', `${Math.round(data.summary.scope1).toLocaleString()} kg CO₂e`],
      ['Scope 2 (Electricity)', `${Math.round(data.summary.scope2).toLocaleString()} kg CO₂e`],
      ['Scope 3 (Indirect)', `${Math.round(data.summary.scope3).toLocaleString()} kg CO₂e`],
      ['Trend vs Last Period', `${data.summary.trend} (${data.summary.percentageChange.toFixed(1)}%)`],
      ['Available Credits', `${data.creditSummary.availableCredits.toLocaleString()} tons CO₂e`],
      ['Used Credits', `${data.creditSummary.usedCredits.toLocaleString()} tons CO₂e`],
      ['Active Anomalies', `${data.alerts.filter((a) => !a.resolved).length}`],
    ],
    headStyles: { fillColor: [34, 139, 87] },
    styles: { fontSize: 10 },
  });

  // Emissions table
  if (data.emissions.length > 0) {
    doc.addPage();
    doc.setFontSize(13);
    doc.text('Emission Entries', 14, 20);
    autoTable(doc, {
      startY: 25,
      head: [['Date', 'Scope', 'Category', 'Source', 'Value', 'Unit', 'CO₂e (kg)']],
      body: data.emissions.slice(0, 100).map((e) => [
        new Date(e.date).toLocaleDateString(),
        `Scope ${e.scope}`,
        e.category,
        e.source,
        e.value.toFixed(2),
        e.unit,
        e.co2_equivalent.toFixed(2),
      ]),
      headStyles: { fillColor: [34, 139, 87] },
      styles: { fontSize: 8 },
    });
  }

  // Credits table
  if (data.credits.length > 0) {
    doc.addPage();
    doc.setFontSize(13);
    doc.text('Carbon Credits Portfolio', 14, 20);
    autoTable(doc, {
      startY: 25,
      head: [['Project', 'Type', 'Quantity', 'Used', 'Cost', 'Status', 'Expiry']],
      body: data.credits.map((c) => [
        c.project_name,
        c.type,
        c.quantity.toLocaleString(),
        c.used_quantity.toLocaleString(),
        `${c.currency} ${c.cost.toLocaleString()}`,
        c.status,
        new Date(c.expiry_date).toLocaleDateString(),
      ]),
      headStyles: { fillColor: [34, 139, 87] },
      styles: { fontSize: 8 },
    });
  }

  // Footer on every page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount}  |  CarbonTrack Enterprise  |  Confidential`,
      105,
      290,
      { align: 'center' }
    );
  }

  const filename = `${data.reportType}-report-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}

export function generateExcelReport(data: ReportData): void {
  const wb = XLSX.utils.book_new();

  // Summary sheet
  const summaryData = [
    ['CarbonTrack Report'],
    ['Report Type', reportTitleMap[data.reportType] || data.reportType],
    ['Period', periodLabelMap[data.period] || data.period],
    ['Generated', new Date().toLocaleString()],
    [],
    ['Metric', 'Value', 'Unit'],
    ['Total Emissions', Math.round(data.summary.totalEmissions), 'kg CO₂e'],
    ['Scope 1 (Direct)', Math.round(data.summary.scope1), 'kg CO₂e'],
    ['Scope 2 (Electricity)', Math.round(data.summary.scope2), 'kg CO₂e'],
    ['Scope 3 (Indirect)', Math.round(data.summary.scope3), 'kg CO₂e'],
    ['Trend', data.summary.trend, `${data.summary.percentageChange.toFixed(1)}%`],
    ['Available Credits', data.creditSummary.availableCredits, 'tons CO₂e'],
    ['Used Credits', data.creditSummary.usedCredits, 'tons CO₂e'],
    ['Active Anomalies', data.alerts.filter((a) => !a.resolved).length, ''],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryData), 'Summary');

  // Emissions sheet
  if (data.emissions.length > 0) {
    const emissionsSheet = XLSX.utils.json_to_sheet(
      data.emissions.map((e) => ({
        Date: new Date(e.date).toLocaleDateString(),
        Scope: e.scope,
        Category: e.category,
        Source: e.source,
        Value: e.value,
        Unit: e.unit,
        'CO2e (kg)': e.co2_equivalent,
        Notes: e.notes || '',
      }))
    );
    XLSX.utils.book_append_sheet(wb, emissionsSheet, 'Emissions');
  }

  // Credits sheet
  if (data.credits.length > 0) {
    const creditsSheet = XLSX.utils.json_to_sheet(
      data.credits.map((c) => ({
        Project: c.project_name,
        Type: c.type,
        Quantity: c.quantity,
        Used: c.used_quantity,
        Available: c.quantity - c.used_quantity,
        Cost: c.cost,
        Currency: c.currency,
        Status: c.status,
        'Purchase Date': new Date(c.purchase_date).toLocaleDateString(),
        'Expiry Date': new Date(c.expiry_date).toLocaleDateString(),
      }))
    );
    XLSX.utils.book_append_sheet(wb, creditsSheet, 'Credits');
  }

  // Alerts sheet
  if (data.alerts.length > 0) {
    const alertsSheet = XLSX.utils.json_to_sheet(
      data.alerts.map((a) => ({
        Date: new Date(a.created_at).toLocaleDateString(),
        Type: a.type,
        Severity: a.severity,
        Message: a.message,
        Resolved: a.resolved ? 'Yes' : 'No',
      }))
    );
    XLSX.utils.book_append_sheet(wb, alertsSheet, 'Alerts');
  }

  const filename = `${data.reportType}-report-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, filename);
}
