import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useCurrentDateTime } from '@/hooks/useCurrentDateTime';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

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
  const [intrareDate, setIntrareDate] = useState<Date>(new Date());
  const [iesireAmount, setIesireAmount] = useState("");
  const [iesireDesc, setIesireDesc] = useState("");
  const [iesireDate, setIesireDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);

  // Load transactions from database
  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('loan_transactions')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedTransactions: Transaction[] = data.map(t => ({
          id: t.id,
          type: t.type as "intrare" | "iesire",
          amount: Number(t.amount),
          description: t.description,
          timestamp: t.timestamp,
        }));

        setTransactions(formattedTransactions);

        // Calculate balance from all transactions
        const calculatedBalance = formattedTransactions.reduce((acc, t) => {
          return t.type === "intrare" ? acc + t.amount : acc - t.amount;
        }, 0);
        setBalance(calculatedBalance);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast({
        title: "Eroare",
        description: "Nu s-au putut încărca tranzacțiile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addTransaction = async (type: "intrare" | "iesire") => {
    const amount = type === "intrare" ? parseFloat(intrareAmount) : parseFloat(iesireAmount);
    const description = type === "intrare" ? intrareDesc : iesireDesc;
    const selectedDate = type === "intrare" ? intrareDate : iesireDate;

    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Eroare",
        description: "Introdu o sumă validă",
        variant: "destructive",
      });
      return;
    }

    try {
      // Save to database with custom timestamp
      const { data, error } = await supabase
        .from('loan_transactions')
        .insert({
          type,
          amount,
          description,
          timestamp: selectedDate.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Reload transactions to update UI
      await loadTransactions();

      // Resetează câmpurile
      if (type === "intrare") {
        setIntrareAmount("");
        setIntrareDesc("");
        setIntrareDate(new Date());
      } else {
        setIesireAmount("");
        setIesireDesc("");
        setIesireDate(new Date());
      }

      toast({
        title: "Tranzacție adăugată",
        description: `${type === "intrare" ? "Intrare" : "Ieșire"}: ${amount} lei`,
      });
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut adăuga tranzacția",
        variant: "destructive",
      });
    }
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
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !intrareDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {intrareDate ? format(intrareDate, "dd/MM/yyyy") : <span>Selectează data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={intrareDate}
                  onSelect={(date) => date && setIntrareDate(date)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
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
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !iesireDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {iesireDate ? format(iesireDate, "dd/MM/yyyy") : <span>Selectează data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={iesireDate}
                  onSelect={(date) => date && setIesireDate(date)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
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
