import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useShifts } from '@/hooks/useShifts';

export const ReportsDb = () => {
  const { history } = useShifts();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [showReport, setShowReport] = useState(false);

  const months = [
    'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
    'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'
  ];

  const generateReport = () => {
    setShowReport(true);
  };

  // Filtrează turele pentru luna și anul selectat
  const filteredShifts = history.filter(shift => {
    const shiftDate = new Date(shift.startTime);
    return (
      shiftDate.getMonth() === parseInt(selectedMonth) &&
      shiftDate.getFullYear() === parseInt(selectedYear)
    );
  });

  // Calculează totale
  const totalIntrari = filteredShifts.reduce((sum, shift) => {
    return sum + shift.transactions
      .filter(t => t.type === "intrare")
      .reduce((tSum, t) => tSum + t.amount, 0);
  }, 0);

  const totalIesiri = filteredShifts.reduce((sum, shift) => {
    return sum + shift.transactions
      .filter(t => t.type === "iesire")
      .reduce((tSum, t) => tSum + t.amount, 0);
  }, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Rapoarte</h2>
      
      <Card className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Luna</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Anul</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2024, 2025, 2026].map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={generateReport} className="w-full">
            Generează Raport
          </Button>
        </div>
      </Card>

      {showReport && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">
            Raport {months[parseInt(selectedMonth)]} {selectedYear}
          </h3>

          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-muted-foreground">Ture totale</div>
                <div className="text-2xl font-bold">{filteredShifts.length}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Intrări</div>
                <div className="text-2xl font-bold text-green-600">
                  +{totalIntrari.toFixed(2)} lei
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Ieșiri</div>
                <div className="text-2xl font-bold text-red-600">
                  -{totalIesiri.toFixed(2)} lei
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-2">Diferență</div>
                <div className={`text-3xl font-bold ${
                  totalIntrari - totalIesiri >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {(totalIntrari - totalIesiri).toFixed(2)} lei
                </div>
              </div>
            </div>

            {filteredShifts.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Detalii ture</h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredShifts.map(shift => {
                    const startDate = new Date(shift.startTime);
                    const intrari = shift.transactions
                      .filter(t => t.type === "intrare")
                      .reduce((sum, t) => sum + t.amount, 0);
                    const iesiri = shift.transactions
                      .filter(t => t.type === "iesire")
                      .reduce((sum, t) => sum + t.amount, 0);

                    return (
                      <div key={shift.id} className="p-3 border rounded">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">{shift.dispatcher}</div>
                            <div className="text-sm text-muted-foreground">
                              {startDate.toLocaleDateString('ro-RO')}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-green-600">+{intrari.toFixed(2)}</div>
                            <div className="text-sm text-red-600">-{iesiri.toFixed(2)}</div>
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
      )}
    </div>
  );
};
