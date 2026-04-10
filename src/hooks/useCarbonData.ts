import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  EmissionEntry,
  CarbonCredit,
  EmissionSummary,
  AnomalyAlert,
  Forecast,
  EmissionCategory
} from '@/types/carbon';

export function useCarbonData() {
  const { user } = useAuth();
  const [emissions, setEmissions] = useState<EmissionEntry[]>([]);
  const [credits, setCredits] = useState<CarbonCredit[]>([]);
  const [alerts, setAlerts] = useState<AnomalyAlert[]>([]);
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch emissions from Supabase
  const fetchEmissions = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('emissions')
      .select('*')
      .order('date', { ascending: false });

    if (!error && data) {
      setEmissions(data.map(e => ({
        id: e.id,
        date: e.date,
        category: e.category as EmissionCategory,
        scope: e.scope as 1 | 2 | 3,
        value: Number(e.value),
        unit: e.unit,
        co2Equivalent: Number(e.co2_equivalent),
        source: e.source,
        notes: e.notes || undefined,
        isAnomaly: e.is_anomaly || false,
      })));
    }
  }, [user]);

  // Fetch credits from Supabase
  const fetchCredits = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('carbon_credits')
      .select('*')
      .order('purchase_date', { ascending: false });

    if (!error && data) {
      setCredits(data.map(c => ({
        id: c.id,
        type: c.type as CarbonCredit['type'],
        quantity: Number(c.quantity),
        purchaseDate: c.purchase_date,
        expiryDate: c.expiry_date,
        cost: Number(c.cost),
        currency: c.currency,
        projectName: c.project_name,
        status: c.status as CarbonCredit['status'],
        usedQuantity: Number(c.used_quantity),
      })));
    }
  }, [user]);

  // Fetch alerts from Supabase
  const fetchAlerts = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('anomaly_alerts')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAlerts(data.map(a => ({
        id: a.id,
        entryId: a.emission_id || '',
        type: a.type as AnomalyAlert['type'],
        severity: a.severity as AnomalyAlert['severity'],
        message: a.message,
        detectedAt: a.created_at,
        resolved: a.resolved,
      })));
    }
  }, [user]);

  // Generate forecasts based on existing data
  const generateForecasts = useCallback((): Forecast[] => {
    if (emissions.length === 0) return [];
    const now = new Date();
    const result: Forecast[] = [];

    // Calculate average monthly emissions from data
    const monthlyTotals: Record<string, { scope1: number; scope2: number; scope3: number; total: number }> = {};
    emissions.forEach(e => {
      const key = e.date.substring(0, 7);
      if (!monthlyTotals[key]) monthlyTotals[key] = { scope1: 0, scope2: 0, scope3: 0, total: 0 };
      monthlyTotals[key][`scope${e.scope}` as 'scope1' | 'scope2' | 'scope3'] += e.co2Equivalent;
      monthlyTotals[key].total += e.co2Equivalent;
    });

    const months = Object.values(monthlyTotals);
    if (months.length === 0) return [];
    const avgTotal = months.reduce((s, m) => s + m.total, 0) / months.length;
    const avgS1 = months.reduce((s, m) => s + m.scope1, 0) / months.length;
    const avgS2 = months.reduce((s, m) => s + m.scope2, 0) / months.length;
    const avgS3 = months.reduce((s, m) => s + m.scope3, 0) / months.length;

    for (let i = 1; i <= 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const variance = 0.9 + Math.random() * 0.2;
      const predicted = avgTotal * variance;
      result.push({
        period: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        predictedEmissions: predicted,
        confidenceInterval: { lower: predicted * 0.85, upper: predicted * 1.15 },
        scope1: avgS1 * variance,
        scope2: avgS2 * variance,
        scope3: avgS3 * variance,
      });
    }
    return result;
  }, [emissions]);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    Promise.all([fetchEmissions(), fetchCredits(), fetchAlerts()])
      .finally(() => setIsLoading(false));
  }, [user, fetchEmissions, fetchCredits, fetchAlerts]);

  useEffect(() => {
    setForecasts(generateForecasts());
  }, [emissions, generateForecasts]);

  const getSummary = useCallback((): EmissionSummary => {
    const now = new Date();
    const currentMonth = emissions.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const lastMonth = emissions.filter(e => {
      const d = new Date(e.date);
      const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
    });

    const totalCurrent = currentMonth.reduce((s, e) => s + e.co2Equivalent, 0);
    const totalLast = lastMonth.reduce((s, e) => s + e.co2Equivalent, 0);
    const scope1 = currentMonth.filter(e => e.scope === 1).reduce((s, e) => s + e.co2Equivalent, 0);
    const scope2 = currentMonth.filter(e => e.scope === 2).reduce((s, e) => s + e.co2Equivalent, 0);
    const scope3 = currentMonth.filter(e => e.scope === 3).reduce((s, e) => s + e.co2Equivalent, 0);
    const byCategory = currentMonth.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.co2Equivalent;
      return acc;
    }, {} as Record<EmissionCategory, number>);
    const pctChange = totalLast > 0 ? ((totalCurrent - totalLast) / totalLast) * 100 : 0;

    return {
      totalEmissions: totalCurrent,
      scope1, scope2, scope3,
      byCategory,
      trend: pctChange > 5 ? 'increasing' : pctChange < -5 ? 'decreasing' : 'stable',
      percentageChange: pctChange,
    };
  }, [emissions]);

  const getCreditSummary = useCallback(() => {
    const active = credits.filter(c => c.status === 'active');
    return {
      totalCredits: active.reduce((s, c) => s + c.quantity, 0),
      usedCredits: active.reduce((s, c) => s + c.usedQuantity, 0),
      availableCredits: active.reduce((s, c) => s + c.quantity - c.usedQuantity, 0),
      totalValue: active.reduce((s, c) => s + c.cost, 0),
      activeCount: active.length,
    };
  }, [credits]);

  const addEmission = useCallback(async (entry: Omit<EmissionEntry, 'id'>) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('emissions')
      .insert({
        user_id: user.id,
        date: entry.date,
        category: entry.category,
        scope: entry.scope,
        value: entry.value,
        unit: entry.unit,
        co2_equivalent: entry.co2Equivalent,
        source: entry.source,
        notes: entry.notes || null,
        is_anomaly: entry.isAnomaly || false,
      })
      .select()
      .single();

    if (!error && data) {
      // Check for anomaly (simple spike detection)
      const categoryAvg = emissions
        .filter(e => e.category === entry.category)
        .reduce((s, e) => s + e.co2Equivalent, 0) / Math.max(emissions.filter(e => e.category === entry.category).length, 1);

      if (categoryAvg > 0 && entry.co2Equivalent > categoryAvg * 2) {
        await supabase.from('anomaly_alerts').insert({
          user_id: user.id,
          emission_id: data.id,
          type: 'spike',
          severity: 'high',
          message: `Unusual ${entry.category.replace('_', ' ')} detected: ${entry.co2Equivalent.toFixed(0)} kg CO₂e (${((entry.co2Equivalent / categoryAvg) * 100).toFixed(0)}% of average)`,
        });
        await fetchAlerts();
      }

      await fetchEmissions();
      return data;
    }
    return null;
  }, [user, emissions, fetchEmissions, fetchAlerts]);

  const addCredit = useCallback(async (credit: Omit<CarbonCredit, 'id'>) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('carbon_credits')
      .insert({
        user_id: user.id,
        type: credit.type,
        quantity: credit.quantity,
        purchase_date: credit.purchaseDate,
        expiry_date: credit.expiryDate,
        cost: credit.cost,
        currency: credit.currency,
        project_name: credit.projectName,
        status: credit.status,
        used_quantity: credit.usedQuantity,
      })
      .select()
      .single();

    if (!error && data) {
      await fetchCredits();
      return data;
    }
    return null;
  }, [user, fetchCredits]);

  const resolveAlert = useCallback(async (alertId: string) => {
    if (!user) return;
    await supabase
      .from('anomaly_alerts')
      .update({ resolved: true })
      .eq('id', alertId);
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, resolved: true } : a));
  }, [user]);

  const getMonthlyTrends = useCallback(() => {
    const grouped = emissions.reduce((acc, e) => {
      const key = e.date.substring(0, 7);
      if (!acc[key]) acc[key] = { scope1: 0, scope2: 0, scope3: 0, total: 0 };
      acc[key][`scope${e.scope}` as 'scope1' | 'scope2' | 'scope3'] += e.co2Equivalent;
      acc[key].total += e.co2Equivalent;
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
    emissions, credits, alerts, forecasts, isLoading,
    getSummary, getCreditSummary, getMonthlyTrends,
    addEmission, addCredit, resolveAlert, fetchEmissions, fetchCredits,
  };
}
