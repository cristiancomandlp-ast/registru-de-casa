import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useCurrentDateTime } from '@/hooks/useCurrentDateTime';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  type: "intrare" | "iesire";
  amount: number;
  description: string;
  timestamp: string;
}

export const LoanPanel = () => {
  const { formatDate, formatTime } = useCurrentDateTime();
  const { toast } = useToast();

  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [intrareAmount, setIntrareAmount] = useState("");
  const [intrareDesc, setIntrareDesc] = useState("");
  const [iesireAmount, setIesireAmount] = useState("");
  const [iesireDesc, setIesireDesc] = useState("");

  const addTransaction = (type: "intrare" | "iesire") => {
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
    };

    const newBalance = type === "intrare" 
      ? balance + amount 
      : balance - amount;

    setBalance(newBalance);
    setTransactions([transaction, ...transactions]);

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
      {/* Data și ora */}
      <div className="text-right">
        <div className="text-2xl font-bold text-foreground">{formatTime()}</div>
        <div className="text-sm text-muted-foreground">{formatDate()}</div>
      </div>

      <div className="space-y-6">
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
              {balance.toFixed(2)} lei
            </div>
          </div>
        </Card>

        {/* Lista operațiuni */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Operațiuni Împrumut</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nicio operațiune încă
              </p>
            ) : (
              transactions.map((transaction) => {
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
    </div>
  );
};
