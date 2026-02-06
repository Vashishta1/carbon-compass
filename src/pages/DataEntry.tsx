import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { EmissionForm } from '@/components/data-entry/EmissionForm';
import { FileUpload } from '@/components/data-entry/FileUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCarbonData } from '@/hooks/useCarbonData';
import { FileInput, Upload } from 'lucide-react';

export default function DataEntry() {
  const { addEmission, alerts } = useCarbonData();
  const unresolvedAlerts = alerts.filter(a => !a.resolved);

  const handleSubmit = (data: any) => {
    addEmission(data);
  };

  return (
    <AppLayout 
      title="Data Entry" 
      subtitle="Add emission data manually or upload files"
      alertCount={unresolvedAlerts.length}
    >
      <Tabs defaultValue="manual" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="manual" className="gap-2">
            <FileInput className="w-4 h-4" />
            Manual Entry
          </TabsTrigger>
          <TabsTrigger value="upload" className="gap-2">
            <Upload className="w-4 h-4" />
            File Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual">
          <EmissionForm onSubmit={handleSubmit} />
        </TabsContent>

        <TabsContent value="upload">
          <FileUpload />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
