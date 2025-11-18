import { useState } from 'react';
import { DispatcherPanel } from '@/components/DispatcherPanel';
import { DispatcherPanelDmx } from '@/components/DispatcherPanelDmx';
import { LoanPanel } from '@/components/LoanPanel';
import { Settings } from '@/components/Settings';
import { Pontaj } from '@/components/Pontaj';
import { Necesar } from '@/components/Necesar';
import { DrinkOk } from '@/components/DrinkOk';
import BazaDeDate from '@/components/BazaDeDate';
import { ChatIntern } from '@/components/ChatIntern';
import { Settings as SettingsIcon, LogOut, FileText, BarChart3, Wallet, Users, Package, ClipboardCheck, Database, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentDateTime } from '@/hooks/useCurrentDateTime';
import { useAdmin } from '@/hooks/useAdmin';
import pelicanulLogo from '@/assets/pelicanul-logo.jpg';
import { Reclamatii } from '@/components/Reclamatii';

type ViewType = 'registru' | 'registru-dmx' | 'drink-ok' | 'sold-mihai' | 'reclamatii' | 'baza-date' | 'chat-intern' | 'necesar' | 'pontaj';

const Dashboard = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [activeView, setActiveView] = useState<ViewType | null>(null);
  const { signOut, user } = useAuth();
  const { formatDate, formatTime } = useCurrentDateTime();
  const { isAdmin } = useAdmin();

  const navigationCards = [
    { id: 'registru' as ViewType, label: 'REGISTRU DE CASĂ', icon: FileText, color: 'bg-blue-600 hover:bg-blue-700' },
    { id: 'registru-dmx' as ViewType, label: 'REGISTRU DE CASĂ DMX', icon: FileText, color: 'bg-purple-600 hover:bg-purple-700' },
    { id: 'drink-ok' as ViewType, label: 'DRINK OK', icon: ClipboardCheck, color: 'bg-teal-600 hover:bg-teal-700' },
    { id: 'sold-mihai' as ViewType, label: 'SOLD MIHAI', icon: Wallet, color: 'bg-orange-600 hover:bg-orange-700' },
    { id: 'reclamatii' as ViewType, label: 'RECLAMAȚII', icon: BarChart3, color: 'bg-red-600 hover:bg-red-700' },
    { id: 'baza-date' as ViewType, label: 'BAZĂ DE DATE', icon: Database, color: 'bg-indigo-600 hover:bg-indigo-700' },
    { id: 'chat-intern' as ViewType, label: 'CHAT INTERN', icon: MessageSquare, color: 'bg-violet-600 hover:bg-violet-700' },
    { id: 'necesar' as ViewType, label: 'NECESAR', icon: Package, color: 'bg-rose-600 hover:bg-rose-700' },
    { id: 'pontaj' as ViewType, label: 'PONTAJ', icon: Users, color: 'bg-pink-600 hover:bg-pink-700' },
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'registru':
        return <DispatcherPanel onBack={() => setActiveView(null)} />;
      case 'registru-dmx':
        return <DispatcherPanelDmx />;
      case 'drink-ok':
        return <DrinkOk onBack={() => setActiveView(null)} />;
      case 'sold-mihai':
        return <LoanPanel />;
      case 'reclamatii':
        return <Reclamatii />;
      case 'baza-date':
        return <BazaDeDate />;
      case 'chat-intern':
        return <ChatIntern />;
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
              <div className="text-xs font-semibold text-gray-600 uppercase">
                EȘTI LOGAT CA {isAdmin ? 'ADMIN' : 'DISPECER'}
              </div>
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
              onClick={() => setActiveView(null)}
              className="mb-4 bg-red-600 hover:bg-red-700 text-white border-2 border-black"
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
                  className={`${card.color} border-2 border-black cursor-pointer transition-all duration-200 active:scale-95`}
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
