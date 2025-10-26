import { Card } from '@/components/ui/card';
import { useShifts } from '@/hooks/useShifts';

export const History = () => {
  const { history, loading } = useShifts();

  if (loading) {
    return <div className="text-center py-8">Se încarcă...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Istoric Ture</h2>
      
      <div className="space-y-4">
        {history.length === 0 ? (
          <Card className="p-8">
            <p className="text-center text-muted-foreground">
              Nicio tură încheiată încă
            </p>
          </Card>
        ) : (
          history.map((shift) => {
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
                      <h4 className="font-medium mb-2">Tranzacții ({shift.transactions.length})</h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {shift.transactions.map((transaction) => {
                          const transDate = new Date(transaction.timestamp);
                          return (
                            <div
                              key={transaction.id}
                              className={`p-2 rounded text-sm ${
                                transaction.type === "intrare"
                                  ? "bg-green-50"
                                  : "bg-red-50"
                              }`}
                            >
                              <div className="flex justify-between">
                                <span>{transaction.description}</span>
                                <span className="font-medium">
                                  {transaction.type === "intrare" ? "+" : "-"}
                                  {transaction.amount.toFixed(2)} lei
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {transDate.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
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
