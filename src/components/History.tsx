import { Card } from '@/components/ui/card';
import { useShifts } from '@/hooks/useShifts';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export const History = () => {
  const { history, loading } = useShifts();
  const [showLast24h, setShowLast24h] = useState(false);

  if (loading) {
    return <div className="text-center py-8">Se încarcă...</div>;
  }

  // Filtrează turele din ultimele 24 de ore dacă este selectat
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  const filteredHistory = showLast24h
    ? history.filter(shift => new Date(shift.startTime) >= twentyFourHoursAgo)
    : history;

  // Calculează totalurile pentru ultimele 24 de ore
  const last24hIntrari = filteredHistory.reduce((total, shift) => {
    return total + shift.transactions
      .filter(t => t.type === "intrare")
      .reduce((sum, t) => sum + t.amount, 0);
  }, 0);

  const last24hIesiri = filteredHistory.reduce((total, shift) => {
    return total + shift.transactions
      .filter(t => t.type === "iesire")
      .reduce((sum, t) => sum + t.amount, 0);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Istoric Ture</h2>
        <Button 
          variant={showLast24h ? "default" : "outline"}
          onClick={() => setShowLast24h(!showLast24h)}
        >
          {showLast24h ? "Arată Tot" : "Ultimele 24h"}
        </Button>
      </div>

      {showLast24h && filteredHistory.length > 0 && (
        <Card className="p-6 bg-primary/5">
          <h3 className="text-lg font-semibold mb-4">Sumar Ultimele 24 de Ore</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-muted-foreground">Intrări Totale</div>
              <div className="text-2xl font-bold text-green-600">+{last24hIntrari.toFixed(2)} lei</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Ieșiri Totale</div>
              <div className="text-2xl font-bold text-red-600">-{last24hIesiri.toFixed(2)} lei</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Diferență</div>
              <div className={`text-2xl font-bold ${(last24hIntrari - last24hIesiri) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {(last24hIntrari - last24hIesiri) >= 0 ? '+' : ''}{(last24hIntrari - last24hIesiri).toFixed(2)} lei
              </div>
            </div>
          </div>
        </Card>
      )}
      
      <div className="space-y-4">
        {filteredHistory.length === 0 ? (
          <Card className="p-8">
            <p className="text-center text-muted-foreground">
              {showLast24h ? "Nicio tură în ultimele 24 de ore" : "Nicio tură încheiată încă"}
            </p>
          </Card>
        ) : (
          filteredHistory.map((shift) => {
            const startDate = new Date(shift.startTime);
            const endDate = shift.endTime ? new Date(shift.endTime) : null;
            
            const intrari = shift.transactions
              .filter(t => t.type === "intrare")
              .reduce((sum, t) => sum + t.amount, 0);
            
            const iesiri = shift.transactions
              .filter(t => t.type === "iesire")
              .reduce((sum, t) => sum + t.amount, 0);

            return (
              <Card key={shift.id} className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{shift.dispatcher}</h3>
                      <p className="text-sm text-muted-foreground">
                        {startDate.toLocaleDateString('ro-RO')} • {startDate.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                        {endDate && ` - ${endDate.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Sold final</div>
                      <div className="text-xl font-bold text-primary">
                        {shift.finalBalance.toFixed(2)} lei
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-sm text-muted-foreground">Sold inițial</div>
                      <div className="font-semibold">{shift.initialBalance.toFixed(2)} lei</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Intrări</div>
                      <div className="font-semibold text-green-600">+{intrari.toFixed(2)} lei</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Ieșiri</div>
                      <div className="font-semibold text-red-600">-{iesiri.toFixed(2)} lei</div>
                    </div>
                  </div>

                  {shift.transactions.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3">Tranzacții ({shift.transactions.length})</h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {shift.transactions.map((transaction) => {
                          const transDate = new Date(transaction.timestamp);
                          return (
                            <div
                              key={transaction.id}
                              className={`p-3 rounded-lg border-l-4 ${
                                transaction.type === "intrare"
                                  ? "bg-green-50 border-green-500 dark:bg-green-950/20"
                                  : "bg-red-50 border-red-500 dark:bg-red-950/20"
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="font-medium">{transaction.description}</div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {transDate.toLocaleDateString('ro-RO')} • {transDate.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                </div>
                                <div className={`text-lg font-bold ${
                                  transaction.type === "intrare" ? "text-green-600" : "text-red-600"
                                }`}>
                                  {transaction.type === "intrare" ? "+" : "-"}
                                  {transaction.amount.toFixed(2)} lei
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
