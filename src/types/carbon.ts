// Carbon Footprint Management System Types

export interface EmissionEntry {
  id: string;
  date: string;
  category: EmissionCategory;
  scope: 1 | 2 | 3;
  value: number;
  unit: string;
  co2Equivalent: number; // in kg CO2e
  source: string;
  notes?: string;
  isAnomaly?: boolean;
}

export type EmissionCategory = 
  | 'fuel_consumption'
  | 'electricity'
  | 'raw_materials'
  | 'transportation'
  | 'employee_travel'
  | 'waste'
  | 'production';

export interface FuelData {
  type: 'diesel' | 'coal' | 'natural_gas' | 'gasoline' | 'lpg' | 'fuel_oil';
  quantity: number;
  unit: 'liters' | 'kg' | 'm3' | 'gallons';
}

export interface ElectricityData {
  consumption: number; // kWh
  gridEmissionFactor?: number; // kg CO2e per kWh
  renewablePercentage?: number;
}

export interface TransportationData {
  vehicleType: 'truck' | 'van' | 'ship' | 'rail' | 'air';
  fuelType: string;
  distance: number; // km
  loadWeight?: number; // tons
}

export interface CarbonCredit {
  id: string;
  type: 'VCS' | 'Gold Standard' | 'CDM' | 'CAR' | 'ACR' | 'Other';
  quantity: number; // tons CO2e
  purchaseDate: string;
  expiryDate: string;
  cost: number;
  currency: string;
  projectName: string;
  status: 'active' | 'used' | 'expired';
  usedQuantity: number;
}

export interface EmissionSummary {
  totalEmissions: number;
  scope1: number;
  scope2: number;
  scope3: number;
  byCategory: Record<EmissionCategory, number>;
  trend: 'increasing' | 'decreasing' | 'stable';
  percentageChange: number;
}

export interface AnomalyAlert {
  id: string;
  entryId: string;
  type: 'spike' | 'unusual_pattern' | 'missing_data' | 'outlier';
  severity: 'low' | 'medium' | 'high';
  message: string;
  detectedAt: string;
  resolved: boolean;
}

export interface Forecast {
  period: string;
  predictedEmissions: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  scope1: number;
  scope2: number;
  scope3: number;
}

// Emission factors (kg CO2e per unit)
export const EMISSION_FACTORS = {
  fuel: {
    diesel: 2.68, // kg CO2e per liter
    coal: 2.42, // kg CO2e per kg
    natural_gas: 2.0, // kg CO2e per m3
    gasoline: 2.31, // kg CO2e per liter
    lpg: 1.51, // kg CO2e per liter
    fuel_oil: 2.96, // kg CO2e per liter
  },
  electricity: {
    default: 0.5, // kg CO2e per kWh (varies by region)
  },
  transport: {
    truck: 0.1, // kg CO2e per ton-km
    van: 0.15,
    ship: 0.015,
    rail: 0.025,
    air: 0.6,
  },
  waste: {
    landfill: 0.5, // kg CO2e per kg
    recycled: 0.1,
    composted: 0.2,
  },
} as const;
