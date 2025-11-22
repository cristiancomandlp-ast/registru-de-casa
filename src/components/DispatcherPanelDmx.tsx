import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { useShifts } from '@/hooks/useShifts';
import { useToast } from '@/hooks/use-toast';
import { Transaction, Shift } from '@/types/dispatcher';

export const DispatcherPanelDmx = () => {
  const { saveTransaction } = useGoogleSheets();
  const { currentShift, history, createShift, updateShift, addTransaction: addTransactionToDb } = useShifts('DMX');
  const { currentShift: casaShift } = useShifts('CASA'); // Get CASA shift for dispatcher info
  const { toast } = useToast();

  const [intrareAmount, setIntrareAmount] = useState("");
  const [intrareDesc, setIntrareDesc] = useState("");
  const [iesireAmount, setIesireAmount] = useState("");
  const [iesireDesc, setIesireDesc] = useState("");

  // Actualizează automat dispecerul din DMX când se schimbă în CASA
  useEffect(() => {
    if (currentShift && casaShift && currentShift.dispatcher !== casaShift.dispatcher) {
      // Sincronizează dispecerul
      updateShift(currentShift.id, { 
        dispatcher: casaShift.dispatcher 
      } as Partial<Shift>);
    }
  }, [casaShift?.dispatcher, currentShift?.id]);

  const handleStartShift = async () => {
    if (!casaShift) {
      toast({
        title: "Eroare",
        description: "Nu există o tură activă în REGISTRU DE CASA",
        variant: "destructive",
      });
      return;
    }

    // Preia soldul final din ultima tură încheiată
    const previousFinalBalance = history.length > 0 ? history[0].finalBalance : 0;

    const newShift: Shift = {
      id: `shift_${Date.now()}`,
      dispatcher: casaShift.dispatcher, // Use dispatcher from CASA register
      startTime: new Date().toISOString(),
      initialBalance: previousFinalBalance,
      finalBalance: previousFinalBalance,
      transactions: [],
    };

    await createShift(newShift);
    
    toast({
      title: "Tură începută",
      description: `${casaShift.dispatcher} a început tura DMX cu sold inițial: ${previousFinalBalance} lei`,
    });
  };

  const addTransaction = async (type: "intrare" | "iesire") => {
    if (!currentShift) {
      toast({
        title: "Eroare",
        description: "Pornește o tură mai întâi",
        variant: "destructive",
      });
      return;
    }

    const amount = type === "intrare" ? parseFloat(intrareAmount) : parseFloat(iesireAmount);
    const description = type === "intrare" ? intrareDesc : iesireDesc;

    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Eroare",
        description: "Introdu o sumă validă",
        variant: "destructive",
      });
      return;
    }

    const transaction: Transaction = {
      id: `trans_${Date.now()}`,
      type,
      amount,
      description,
      timestamp: new Date().toISOString(),
      dispatcher: currentShift.dispatcher,
    };

    const newBalance = type === "intrare" 
      ? currentShift.finalBalance + amount 
      : currentShift.finalBalance - amount;

    // Salvează tranzacția în baza de date
    await addTransactionToDb(currentShift.id, transaction);
    
    // Actualizează soldul
    await updateShift(currentShift.id, { finalBalance: newBalance });
    
    // Salvează și în Google Sheets (backup)
    await saveTransaction(transaction);

    // Resetează câmpurile
    if (type === "intrare") {
      setIntrareAmount("");
      setIntrareDesc("");
    } else {
      setIesireAmount("");
      setIesireDesc("");
    }

    toast({
      title: "Tranzacție adăugată",
      description: `${type === "intrare" ? "Intrare" : "Ieșire"}: ${amount} lei`,
    });
  };


  return (
    <div className="space-y-6">
      {/* Început tură */}
      {!currentShift ? (
        <Card className="p-6">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Începe tura DMX. Dispecerul va fi preluat automat din REGISTRU DE CASA.
            </p>
            
            {casaShift ? (
              <div className="p-3 bg-muted rounded-md">
                <div className="flex justify-between">
                  <span className="font-medium">Dispecer activ:</span>
                  <span>{casaShift.dispatcher}</span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                Atenție: Nu există o tură activă în REGISTRU DE CASA
              </div>
            )}

            <Input
              type="number"
              value={currentShift?.initialBalance || 0}
              disabled
              placeholder="0"
            />

            <Button onClick={handleStartShift} className="w-full" disabled={!casaShift}>
              Începe Tura DMX
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Informații tură curentă */}
          <Card className="p-6 bg-card">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Dispecer:</span>
                <span>{currentShift.dispatcher}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Sold inițial:</span>
                <span>{currentShift.initialBalance.toFixed(2)} lei</span>
              </div>
            </div>
          </Card>

          {/* Intrări */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Intrare</h3>
            <div className="space-y-3">
              <Input
                type="text"
                placeholder="Intrare - descriere"
                value={intrareDesc}
                onChange={(e) => setIntrareDesc(e.target.value)}
              />
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Sumă"
                  value={intrareAmount}
                  onChange={(e) => setIntrareAmount(e.target.value)}
                />
                <Button onClick={() => addTransaction("intrare")}>
                  Adaugă Intrare
                </Button>
              </div>
            </div>
          </Card>

          {/* Ieșiri */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Ieșire</h3>
            <div className="space-y-3">
              <Input
                type="text"
                placeholder="Ieșire - descriere"
                value={iesireDesc}
                onChange={(e) => setIesireDesc(e.target.value)}
              />
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Sumă"
                  value={iesireAmount}
                  onChange={(e) => setIesireAmount(e.target.value)}
                />
                <Button onClick={() => addTransaction("iesire")} variant="destructive">
                  Adaugă Ieșire
                </Button>
              </div>
            </div>
          </Card>

          {/* Sold curent */}
          <Card className="p-6 bg-primary text-primary-foreground">
            <div className="text-center">
              <div className="text-sm mb-2">Sold curent:</div>
              <div className="text-3xl font-bold">
                {currentShift.finalBalance.toFixed(2)} lei
              </div>
            </div>
          </Card>

          {/* Lista operațiuni */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Operațiuni din tura curentă</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {currentShift.transactions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nicio operațiune încă
                </p>
              ) : (
                currentShift.transactions.map((transaction) => {
                  const date = new Date(transaction.timestamp);
                  const timeStr = date.toLocaleTimeString('ro-RO', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  });
                  const dateStr = date.toLocaleDateString('ro-RO');
                  
                  return (
                    <div
                      key={transaction.id}
                      className={`p-3 rounded border ${
                        transaction.type === "intrare"
                          ? "bg-green-50 border-green-200"
                          : "bg-red-50 border-red-200"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium">
                            {transaction.type === "intrare" ? "+" : "-"}
                            {transaction.amount.toFixed(2)} lei
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {transaction.description}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Dispecer: {transaction.dispatcher}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground text-right">
                          <div>{timeStr}</div>
                          <div>{dateStr}</div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
