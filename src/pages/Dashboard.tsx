import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DispatcherPanel } from '@/components/DispatcherPanel';
import { History } from '@/components/History';
import { ReportsDb } from '@/components/ReportsDb';
import { Settings } from '@/components/Settings';
import { Pontaj } from '@/components/Pontaj';
import { Necesar } from '@/components/Necesar';
import { Settings as SettingsIcon, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import pelicanulLogo from '@/assets/pelicanul-logo.jpg';

const Dashboard = () => {
  const [showSettings, setShowSettings] = useState(false);
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      <div className="container max-w-4xl mx-auto p-4 md:p-6">
        <div className="mb-6 flex flex-col gap-4">
          <img 
            src={pelicanulLogo} 
            alt="Pelicanul Taxi Logo" 
            className="w-64 mx-auto"
          />
          <div className="flex justify-end items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
            >
              <SettingsIcon className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              title="Deconectare"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {showSettings ? (
          <Settings />
        ) : (
          <Tabs defaultValue="panou" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6 h-12 bg-gray-100 border border-gray-300">
              <TabsTrigger 
                value="panou"
                className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:border data-[state=active]:border-gray-300 data-[state=active]:shadow-sm font-medium"
              >
                Panou Dispecer
              </TabsTrigger>
              <TabsTrigger 
                value="istoric"
                className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:border data-[state=active]:border-gray-300 data-[state=active]:shadow-sm font-medium"
              >
                Istoric
              </TabsTrigger>
              <TabsTrigger 
                value="rapoarte"
                className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:border data-[state=active]:border-gray-300 data-[state=active]:shadow-sm font-medium"
              >
                Rapoarte
              </TabsTrigger>
              <TabsTrigger 
                value="pontaj"
                className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:border data-[state=active]:border-gray-300 data-[state=active]:shadow-sm font-medium"
              >
                Pontaj
              </TabsTrigger>
              <TabsTrigger 
                value="necesar"
                className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:border data-[state=active]:border-gray-300 data-[state=active]:shadow-sm font-medium"
              >
                Necesar
              </TabsTrigger>
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

            <TabsContent value="pontaj" className="mt-0">
              <Pontaj />
            </TabsContent>

            <TabsContent value="necesar" className="mt-0">
              <Necesar />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
