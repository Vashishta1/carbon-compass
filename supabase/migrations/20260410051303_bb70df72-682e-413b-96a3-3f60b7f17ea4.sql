
-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  company_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Emissions table
CREATE TABLE public.emissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('fuel_consumption','electricity','raw_materials','transportation','employee_travel','waste','production')),
  scope SMALLINT NOT NULL CHECK (scope IN (1,2,3)),
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  co2_equivalent NUMERIC NOT NULL,
  source TEXT NOT NULL DEFAULT 'Manual Entry',
  notes TEXT,
  is_anomaly BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.emissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own emissions" ON public.emissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own emissions" ON public.emissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own emissions" ON public.emissions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own emissions" ON public.emissions FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_emissions_updated_at BEFORE UPDATE ON public.emissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_emissions_user_date ON public.emissions (user_id, date);
CREATE INDEX idx_emissions_category ON public.emissions (category);

-- Carbon credits table
CREATE TABLE public.carbon_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('VCS','Gold Standard','CDM','CAR','ACR','Other')),
  quantity NUMERIC NOT NULL,
  purchase_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  cost NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  project_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','used','expired')),
  used_quantity NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.carbon_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own credits" ON public.carbon_credits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own credits" ON public.carbon_credits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own credits" ON public.carbon_credits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own credits" ON public.carbon_credits FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_carbon_credits_updated_at BEFORE UPDATE ON public.carbon_credits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Anomaly alerts table
CREATE TABLE public.anomaly_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emission_id UUID REFERENCES public.emissions(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('spike','unusual_pattern','missing_data','outlier')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low','medium','high')),
  message TEXT NOT NULL,
  resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.anomaly_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own alerts" ON public.anomaly_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own alerts" ON public.anomaly_alerts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own alerts" ON public.anomaly_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
