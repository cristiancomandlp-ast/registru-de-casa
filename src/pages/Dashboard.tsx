import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DispatcherPanel } from '@/components/DispatcherPanel';
import { History } from '@/components/History';
import { ReportsDb } from '@/components/ReportsDb';
import { Settings } from '@/components/Settings';
import { Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto p-4 md:p-6">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">Dispecerat Taxi</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(!showSettings)}
          >
            <SettingsIcon className="h-5 w-5" />
          </Button>
        </div>

        {showSettings ? (
          <Settings />
        ) : (
          <Tabs defaultValue="panou" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="panou">Panou Dispecer</TabsTrigger>
              <TabsTrigger value="istoric">Istoric</TabsTrigger>
              <TabsTrigger value="rapoarte">Rapoarte</TabsTrigger>
            </TabsList>

            <TabsContent value="panou" className="mt-0">
              <DispatcherPanel />
            </TabsContent>

            <TabsContent value="istoric" className="mt-0">
              <History />
            </TabsContent>

            <TabsContent value="rapoarte" className="mt-0">
              <ReportsDb />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
