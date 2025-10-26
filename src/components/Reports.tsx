import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shift, ShiftData } from '@/types/dispatcher';

export const Reports = () => {
  const [history, setHistory] = useState<Shift[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");

  useEffect(() => {
    const savedHistory = localStorage.getItem('shiftHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }

    // Setează luna și anul curent
    const now = new Date();
    setSelectedMonth((now.getMonth() + 1).toString());
    setSelectedYear(now.getFullYear().toString());
  }, []);

  // Calculează datele pentru luna selectată
  const getMonthlyData = () => {
    if (!selectedMonth || !selectedYear) return [];

    const filtered = history.filter((shift) => {
      const date = new Date(shift.startTime);
      return (
        date.getMonth() + 1 === parseInt(selectedMonth) &&
        date.getFullYear() === parseInt(selectedYear)
      );
    });

    const grouped = filtered.reduce((acc, shift) => {
      const dispatcher = shift.dispatcher;
      if (!acc[dispatcher]) {
        acc[dispatcher] = [];
      }
      acc[dispatcher].push(shift);
      return acc;
    }, {} as Record<string, Shift[]>);

    return Object.entries(grouped).map(([dispatcher, shifts]) => {
      const totalIntrari = shifts.reduce((sum, shift) => {
        return sum + shift.transactions
          .filter(t => t.type === "intrare")
          .reduce((s, t) => s + t.amount, 0);
      }, 0);

      const totalIesiri = shifts.reduce((sum, shift) => {
        return sum + shift.transactions
          .filter(t => t.type === "iesire")
          .reduce((s, t) => s + t.amount, 0);
      }, 0);

      return {
        dispatcher,
        shifts: shifts.length,
        intrari: totalIntrari,
        iesiri: totalIesiri,
        balance: totalIntrari - totalIesiri,
      };
    });
  };

  const monthlyData = getMonthlyData();
  const totalIntrari = monthlyData.reduce((sum, d) => sum + d.intrari, 0);
  const totalIesiri = monthlyData.reduce((sum, d) => sum + d.iesiri, 0);
  const totalBalance = totalIntrari - totalIesiri;

  // Generează opțiuni pentru luni și ani
  const months = [
    { value: "1", label: "Ianuarie" },
    { value: "2", label: "Februarie" },
    { value: "3", label: "Martie" },
    { value: "4", label: "Aprilie" },
    { value: "5", label: "Mai" },
    { value: "6", label: "Iunie" },
    { value: "7", label: "Iulie" },
    { value: "8", label: "August" },
    { value: "9", label: "Septembrie" },
    { value: "10", label: "Octombrie" },
    { value: "11", label: "Noiembrie" },
    { value: "12", label: "Decembrie" },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Rapoarte</h2>

      {/* Selectare perioadă */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Selectează perioada</h3>
        <div className="grid grid-cols-2 gap-4">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger>
              <SelectValue placeholder="Luna" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger>
              <SelectValue placeholder="Anul" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Raport total */}
      <Card className="p-6 bg-primary text-primary-foreground">
        <h3 className="font-semibold mb-4">Total {months.find(m => m.value === selectedMonth)?.label} {selectedYear}</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-sm opacity-90">Intrări totale</div>
            <div className="text-2xl font-bold">+{totalIntrari.toFixed(2)} lei</div>
          </div>
          <div>
            <div className="text-sm opacity-90">Ieșiri totale</div>
            <div className="text-2xl font-bold">-{totalIesiri.toFixed(2)} lei</div>
          </div>
          <div>
            <div className="text-sm opacity-90">Sold net</div>
            <div className="text-2xl font-bold">{totalBalance.toFixed(2)} lei</div>
          </div>
        </div>
      </Card>

      {/* Raport pe dispeceri */}
      <div className="space-y-4">
        <h3 className="font-semibold">Detalii pe dispeceri</h3>
        {monthlyData.length === 0 ? (
          <Card className="p-8">
            <p className="text-center text-muted-foreground">
              Nu există date pentru perioada selectată
            </p>
          </Card>
        ) : (
          monthlyData.map((data) => (
            <Card key={data.dispatcher} className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-semibold">{data.dispatcher}</h4>
                  <span className="text-sm text-muted-foreground">
                    {data.shifts} {data.shifts === 1 ? 'tură' : 'ture'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-sm text-muted-foreground">Intrări</div>
                    <div className="font-semibold text-green-600">
                      +{data.intrari.toFixed(2)} lei
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Ieșiri</div>
                    <div className="font-semibold text-red-600">
                      -{data.iesiri.toFixed(2)} lei
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Sold</div>
                    <div className="font-semibold text-primary">
                      {data.balance.toFixed(2)} lei
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
