import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EMISSION_FACTORS, EmissionCategory } from '@/types/carbon';
import { toast } from 'sonner';
import { Fuel, Zap, Package, Truck, Plane, Trash2, Factory } from 'lucide-react';

const categories: { value: EmissionCategory; label: string; icon: any; scope: 1 | 2 | 3 }[] = [
  { value: 'fuel_consumption', label: 'Fuel Consumption', icon: Fuel, scope: 1 },
  { value: 'electricity', label: 'Electricity Usage', icon: Zap, scope: 2 },
  { value: 'raw_materials', label: 'Raw Materials', icon: Package, scope: 3 },
  { value: 'transportation', label: 'Transportation', icon: Truck, scope: 3 },
  { value: 'employee_travel', label: 'Employee Travel', icon: Plane, scope: 3 },
  { value: 'waste', label: 'Waste Generation', icon: Trash2, scope: 3 },
  { value: 'production', label: 'Production', icon: Factory, scope: 1 },
];

const fuelTypes = Object.keys(EMISSION_FACTORS.fuel) as (keyof typeof EMISSION_FACTORS.fuel)[];

const emissionSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  category: z.string().min(1, 'Category is required'),
  subType: z.string().optional(),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  source: z.string().min(1, 'Data source is required'),
  notes: z.string().optional(),
});

type EmissionFormData = z.infer<typeof emissionSchema>;

interface EmissionFormProps {
  onSubmit: (data: any) => void;
}

export function EmissionForm({ onSubmit }: EmissionFormProps) {
  const [selectedCategory, setSelectedCategory] = useState<EmissionCategory | ''>('');
  
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<EmissionFormData>({
    resolver: zodResolver(emissionSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      unit: 'kg',
      source: 'Manual Entry',
    },
  });

  const category = watch('category');

  const getUnitsForCategory = (cat: EmissionCategory) => {
    switch (cat) {
      case 'fuel_consumption':
        return ['liters', 'gallons', 'kg', 'm³'];
      case 'electricity':
        return ['kWh', 'MWh'];
      case 'transportation':
        return ['km', 'miles'];
      case 'waste':
        return ['kg', 'tons'];
      default:
        return ['kg', 'units', 'tons'];
    }
  };

  const calculateCO2e = (cat: EmissionCategory, subType: string, quantity: number): number => {
    if (cat === 'fuel_consumption' && subType in EMISSION_FACTORS.fuel) {
      return quantity * EMISSION_FACTORS.fuel[subType as keyof typeof EMISSION_FACTORS.fuel];
    }
    if (cat === 'electricity') {
      return quantity * EMISSION_FACTORS.electricity.default;
    }
    // Default estimation
    return quantity * 0.5;
  };

  const handleFormSubmit = (data: EmissionFormData) => {
    const categoryInfo = categories.find(c => c.value === data.category);
    const co2e = calculateCO2e(data.category as EmissionCategory, data.subType || '', data.quantity);
    
    const entry = {
      date: data.date,
      category: data.category as EmissionCategory,
      scope: categoryInfo?.scope || 3,
      value: data.quantity,
      unit: data.unit,
      co2Equivalent: co2e,
      source: data.source,
      notes: data.notes,
    };

    onSubmit(entry);
    toast.success('Emission entry added successfully', {
      description: `${co2e.toFixed(2)} kg CO₂e recorded for ${categoryInfo?.label}`,
    });
    reset();
    setSelectedCategory('');
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Add Emission Data</CardTitle>
        <CardDescription>
          Enter emission data manually. CO₂ equivalent will be calculated automatically.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                {...register('date')}
              />
              {errors.date && (
                <p className="text-sm text-destructive">{errors.date.message}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={selectedCategory}
                onValueChange={(value) => {
                  setSelectedCategory(value as EmissionCategory);
                  setValue('category', value);
                  const units = getUnitsForCategory(value as EmissionCategory);
                  setValue('unit', units[0]);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <span>{cat.label}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            (Scope {cat.scope})
                          </span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category.message}</p>
              )}
            </div>

            {/* Sub-type (for fuel) */}
            {selectedCategory === 'fuel_consumption' && (
              <div className="space-y-2">
                <Label htmlFor="subType">Fuel Type</Label>
                <Select onValueChange={(value) => setValue('subType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select fuel type" />
                  </SelectTrigger>
                  <SelectContent>
                    {fuelTypes.map((fuel) => (
                      <SelectItem key={fuel} value={fuel}>
                        {fuel.replace('_', ' ').toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                placeholder="Enter quantity"
                {...register('quantity', { valueAsNumber: true })}
              />
              {errors.quantity && (
                <p className="text-sm text-destructive">{errors.quantity.message}</p>
              )}
            </div>

            {/* Unit */}
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select 
                value={watch('unit')}
                onValueChange={(value) => setValue('unit', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(selectedCategory ? getUnitsForCategory(selectedCategory) : ['kg']).map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Source */}
            <div className="space-y-2">
              <Label htmlFor="source">Data Source</Label>
              <Select 
                value={watch('source')}
                onValueChange={(value) => setValue('source', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Manual Entry">Manual Entry</SelectItem>
                  <SelectItem value="Invoice">Invoice</SelectItem>
                  <SelectItem value="Utility Bill">Utility Bill</SelectItem>
                  <SelectItem value="Meter Reading">Meter Reading</SelectItem>
                  <SelectItem value="Estimate">Estimate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes about this entry..."
              {...register('notes')}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => reset()}>
              Clear
            </Button>
            <Button type="submit">
              Add Entry
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
