import { useState } from 'react';
import { DispatcherPanel } from '@/components/DispatcherPanel';
import { LoanPanel } from '@/components/LoanPanel';
import { History } from '@/components/History';
import { ReportsDb } from '@/components/ReportsDb';
import { Settings } from '@/components/Settings';
import { Pontaj } from '@/components/Pontaj';
import { Necesar } from '@/components/Necesar';
import { Settings as SettingsIcon, LogOut, FileText, History as HistoryIcon, FileSpreadsheet, Wallet, Users, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentDateTime } from '@/hooks/useCurrentDateTime';
import pelicanulLogo from '@/assets/pelicanul-logo.jpg';

type ViewType = 'registru' | 'istoric' | 'rapoarte' | 'sold-mihai' | 'necesar' | 'pontaj';

const Dashboard = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [activeView, setActiveView] = useState<ViewType | null>(null);
  const { signOut, user } = useAuth();
  const { formatDate, formatTime } = useCurrentDateTime();

  const navigationCards = [
    { id: 'registru' as ViewType, label: 'REGISTRU DE CASĂ', icon: FileText, color: 'bg-blue-600 hover:bg-blue-700' },
    { id: 'istoric' as ViewType, label: 'ISTORIC', icon: HistoryIcon, color: 'bg-purple-600 hover:bg-purple-700' },
    { id: 'rapoarte' as ViewType, label: 'RAPOARTE', icon: FileSpreadsheet, color: 'bg-green-600 hover:bg-green-700' },
    { id: 'sold-mihai' as ViewType, label: 'SOLD MIHAI', icon: Wallet, color: 'bg-orange-600 hover:bg-orange-700' },
    { id: 'necesar' as ViewType, label: 'NECESAR', icon: ClipboardList, color: 'bg-teal-600 hover:bg-teal-700' },
    { id: 'pontaj' as ViewType, label: 'PONTAJ', icon: Users, color: 'bg-pink-600 hover:bg-pink-700' },
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'registru':
        return <DispatcherPanel />;
      case 'istoric':
        return <History />;
      case 'rapoarte':
        return <ReportsDb />;
      case 'sold-mihai':
        return <LoanPanel />;
      case 'necesar':
        return <Necesar />;
      case 'pontaj':
        return <Pontaj />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container max-w-4xl mx-auto p-4 md:p-6">
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="text-left">
              <div className="text-lg font-semibold text-gray-800">{formatTime()}</div>
              <div className="text-sm text-gray-600">{formatDate()}</div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="text-sm font-medium text-gray-800">{user?.email}</div>
              <div className="flex gap-2">
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
          </div>
          <img 
            src={pelicanulLogo} 
            alt="Pelicanul Taxi Logo" 
            className="w-64 mx-auto"
          />
        </div>

        {showSettings ? (
          <Settings />
        ) : activeView ? (
          <div>
            <Button
              variant="outline"
              onClick={() => setActiveView(null)}
              className="mb-4"
            >
              ← Înapoi
            </Button>
            {renderContent()}
          </div>
        ) : (
          <div className="flex flex-col gap-4 max-w-2xl mx-auto">
            {navigationCards.map((card) => {
              const Icon = card.icon;
              return (
                <Card
                  key={card.id}
                  className={`${card.color} border-0 cursor-pointer transition-all duration-200 active:scale-95`}
                  onClick={() => setActiveView(card.id)}
                >
                  <div className="flex items-center justify-center gap-3 py-8 px-6">
                    <Icon className="h-6 w-6 text-white" />
                    <span className="text-white font-bold text-lg tracking-wide">
                      {card.label}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
