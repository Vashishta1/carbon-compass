import { useState, useEffect, useCallback } from 'react';
import { 
  EmissionEntry, 
  CarbonCredit, 
  EmissionSummary, 
  AnomalyAlert,
  Forecast,
  EmissionCategory
} from '@/types/carbon';

// Mock data for demonstration
const generateMockEmissions = (): EmissionEntry[] => {
  const categories: EmissionCategory[] = [
    'fuel_consumption', 'electricity', 'raw_materials', 
    'transportation', 'employee_travel', 'waste', 'production'
  ];
  
  const entries: EmissionEntry[] = [];
  const now = new Date();
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const dateStr = date.toISOString().split('T')[0];
    
    // Generate entries for each category
    categories.forEach((category, idx) => {
      const baseValue = Math.random() * 1000 + 500;
      const scope = category === 'fuel_consumption' || category === 'production' ? 1 
        : category === 'electricity' ? 2 : 3;
      
      // Add some anomalies
      const isAnomaly = Math.random() < 0.05;
      const multiplier = isAnomaly ? 2.5 : 1;
      
      entries.push({
        id: `${dateStr}-${category}`,
        date: dateStr,
        category,
        scope: scope as 1 | 2 | 3,
        value: baseValue * multiplier,
        unit: category === 'electricity' ? 'kWh' : category === 'fuel_consumption' ? 'liters' : 'kg',
        co2Equivalent: (baseValue * multiplier) * (0.3 + Math.random() * 0.5),
        source: 'Manual Entry',
        isAnomaly,
      });
    });
  }
  
  return entries;
};

const generateMockCredits = (): CarbonCredit[] => [
  {
    id: 'cc-001',
    type: 'VCS',
    quantity: 5000,
    purchaseDate: '2025-01-15',
    expiryDate: '2027-01-15',
    cost: 75000,
    currency: 'USD',
    projectName: 'Amazon Rainforest Conservation',
    status: 'active',
    usedQuantity: 1200,
  },
  {
    id: 'cc-002',
    type: 'Gold Standard',
    quantity: 2500,
    purchaseDate: '2025-06-01',
    expiryDate: '2028-06-01',
    cost: 45000,
    currency: 'USD',
    projectName: 'Wind Farm Development - Gujarat',
    status: 'active',
    usedQuantity: 500,
  },
  {
    id: 'cc-003',
    type: 'CDM',
    quantity: 1000,
    purchaseDate: '2024-03-10',
    expiryDate: '2025-03-10',
    cost: 12000,
    currency: 'USD',
    projectName: 'Methane Capture - Landfill',
    status: 'expired',
    usedQuantity: 1000,
  },
];

const generateMockAlerts = (emissions: EmissionEntry[]): AnomalyAlert[] => {
  return emissions
    .filter(e => e.isAnomaly)
    .map(e => ({
      id: `alert-${e.id}`,
      entryId: e.id,
      type: 'spike' as const,
      severity: 'high' as const,
      message: `Unusual ${e.category.replace('_', ' ')} detected: ${e.co2Equivalent.toFixed(0)} kg CO2e (150% above average)`,
      detectedAt: new Date().toISOString(),
      resolved: false,
    }));
};

const generateForecasts = (): Forecast[] => {
  const forecasts: Forecast[] = [];
  const now = new Date();
  
  for (let i = 1; i <= 6; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const baseEmission = 15000 + Math.random() * 2000;
    
    forecasts.push({
      period: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      predictedEmissions: baseEmission,
      confidenceInterval: {
        lower: baseEmission * 0.85,
        upper: baseEmission * 1.15,
      },
      scope1: baseEmission * 0.35,
      scope2: baseEmission * 0.40,
      scope3: baseEmission * 0.25,
    });
  }
  
  return forecasts;
};

export function useCarbonData() {
  const [emissions, setEmissions] = useState<EmissionEntry[]>([]);
  const [credits, setCredits] = useState<CarbonCredit[]>([]);
  const [alerts, setAlerts] = useState<AnomalyAlert[]>([]);
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      const mockEmissions = generateMockEmissions();
      setEmissions(mockEmissions);
      setCredits(generateMockCredits());
      setAlerts(generateMockAlerts(mockEmissions));
      setForecasts(generateForecasts());
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const getSummary = useCallback((): EmissionSummary => {
    const currentMonthEmissions = emissions.filter(e => {
      const entryDate = new Date(e.date);
      const now = new Date();
      return entryDate.getMonth() === now.getMonth() && 
             entryDate.getFullYear() === now.getFullYear();
    });

    const lastMonthEmissions = emissions.filter(e => {
      const entryDate = new Date(e.date);
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return entryDate.getMonth() === lastMonth.getMonth() && 
             entryDate.getFullYear() === lastMonth.getFullYear();
    });

    const totalCurrent = currentMonthEmissions.reduce((sum, e) => sum + e.co2Equivalent, 0);
    const totalLast = lastMonthEmissions.reduce((sum, e) => sum + e.co2Equivalent, 0);
    
    const scope1 = currentMonthEmissions
      .filter(e => e.scope === 1)
      .reduce((sum, e) => sum + e.co2Equivalent, 0);
    const scope2 = currentMonthEmissions
      .filter(e => e.scope === 2)
      .reduce((sum, e) => sum + e.co2Equivalent, 0);
    const scope3 = currentMonthEmissions
      .filter(e => e.scope === 3)
      .reduce((sum, e) => sum + e.co2Equivalent, 0);

    const byCategory = currentMonthEmissions.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.co2Equivalent;
      return acc;
    }, {} as Record<EmissionCategory, number>);

    const percentageChange = totalLast > 0 
      ? ((totalCurrent - totalLast) / totalLast) * 100 
      : 0;

    return {
      totalEmissions: totalCurrent,
      scope1,
      scope2,
      scope3,
      byCategory,
      trend: percentageChange > 5 ? 'increasing' : percentageChange < -5 ? 'decreasing' : 'stable',
      percentageChange,
    };
  }, [emissions]);

  const getCreditSummary = useCallback(() => {
    const activeCredits = credits.filter(c => c.status === 'active');
    const totalCredits = activeCredits.reduce((sum, c) => sum + c.quantity, 0);
    const usedCredits = activeCredits.reduce((sum, c) => sum + c.usedQuantity, 0);
    const totalValue = activeCredits.reduce((sum, c) => sum + c.cost, 0);

    return {
      totalCredits,
      usedCredits,
      availableCredits: totalCredits - usedCredits,
      totalValue,
      activeCount: activeCredits.length,
    };
  }, [credits]);

  const addEmission = useCallback((entry: Omit<EmissionEntry, 'id'>) => {
    const newEntry: EmissionEntry = {
      ...entry,
      id: `entry-${Date.now()}`,
    };
    setEmissions(prev => [...prev, newEntry]);
    return newEntry;
  }, []);

  const addCredit = useCallback((credit: Omit<CarbonCredit, 'id'>) => {
    const newCredit: CarbonCredit = {
      ...credit,
      id: `cc-${Date.now()}`,
    };
    setCredits(prev => [...prev, newCredit]);
    return newCredit;
  }, []);

  const resolveAlert = useCallback((alertId: string) => {
    setAlerts(prev => 
      prev.map(a => a.id === alertId ? { ...a, resolved: true } : a)
    );
  }, []);

  const getMonthlyTrends = useCallback(() => {
    const grouped = emissions.reduce((acc, e) => {
      const monthKey = e.date.substring(0, 7); // YYYY-MM
      if (!acc[monthKey]) {
        acc[monthKey] = { scope1: 0, scope2: 0, scope3: 0, total: 0 };
      }
      acc[monthKey][`scope${e.scope}` as 'scope1' | 'scope2' | 'scope3'] += e.co2Equivalent;
      acc[monthKey].total += e.co2Equivalent;
      return acc;
    }, {} as Record<string, { scope1: number; scope2: number; scope3: number; total: number }>);

    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        ...data,
      }));
  }, [emissions]);

  return {
    emissions,
    credits,
    alerts,
    forecasts,
    isLoading,
    getSummary,
    getCreditSummary,
    getMonthlyTrends,
    addEmission,
    addCredit,
    resolveAlert,
  };
}
