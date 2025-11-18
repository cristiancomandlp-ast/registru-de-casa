import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { useShifts } from '@/hooks/useShifts';
import { useToast } from '@/hooks/use-toast';
import { DispatcherName, Transaction, Shift } from '@/types/dispatcher';

const dispatchers: DispatcherName[] = ["Luiza", "Laura", "Rely", "Antigona", "Memeta"];

export const DispatcherPanelDmx = () => {
  const { saveTransaction, saveShift } = useGoogleSheets();
  const { currentShift, history, createShift, updateShift, addTransaction: addTransactionToDb } = useShifts('DMX');
  const { toast } = useToast();

  const [selectedDispatcher, setSelectedDispatcher] = useState<DispatcherName | "">("");
  const [intrareAmount, setIntrareAmount] = useState("");
  const [intrareDesc, setIntrareDesc] = useState("");
  const [iesireAmount, setIesireAmount] = useState("");
  const [iesireDesc, setIesireDesc] = useState("");

  const handleStartShift = async () => {
    if (!selectedDispatcher) {
      toast({
        title: "Eroare",
        description: "Selectează un dispecer",
        variant: "destructive",
      });
      return;
    }

    // Preia soldul final din ultima tură încheiată
    const previousFinalBalance = history.length > 0 ? history[0].finalBalance : 0;

    const newShift: Shift = {
      id: `shift_${Date.now()}`,
      dispatcher: selectedDispatcher,
      startTime: new Date().toISOString(),
      initialBalance: previousFinalBalance,
      finalBalance: previousFinalBalance,
      transactions: [],
    };

    await createShift(newShift);
    
    toast({
      title: "Tură începută",
      description: `${selectedDispatcher} a început tura cu sold inițial: ${previousFinalBalance} lei`,
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

  const handleEndShift = async () => {
    if (!currentShift) return;

    const endTime = new Date().toISOString();

    // Actualizează tura cu timpul de încheiere
    await updateShift(currentShift.id, { endTime });

    // Salvează și în Google Sheets (backup)
    const completedShift = {
      ...currentShift,
      endTime,
    };
    await saveShift(completedShift);

    toast({
      title: "Tură încheiată",
      description: `Sold final: ${currentShift.finalBalance.toFixed(2)} lei`,
    });

    // Resetează selectorul
    setSelectedDispatcher("");
  };

  return (
    <div className="space-y-6">
      {/* Selectare dispecer și început tură */}
      {!currentShift ? (
        <Card className="p-6">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Alege tura, dispecerul și începe. Lasă „Sold inițial" 0 pentru preluare automată.
            </p>
            
            <Select value={selectedDispatcher} onValueChange={(value) => setSelectedDispatcher(value as DispatcherName)}>
              <SelectTrigger>
                <SelectValue placeholder="— Alege dispecer —" />
              </SelectTrigger>
              <SelectContent>
                {dispatchers.map((dispatcher) => (
                  <SelectItem key={dispatcher} value={dispatcher}>
                    {dispatcher}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="number"
              value={currentShift?.initialBalance || 0}
              disabled
              placeholder="0"
            />

            <Button onClick={handleStartShift} className="w-full">
              Începe Tura
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

          {/* Butoane acțiuni */}
          <div className="flex gap-3">
            <Button onClick={handleEndShift} variant="secondary" className="flex-1">
              Încheie Tura
            </Button>
          </div>

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
