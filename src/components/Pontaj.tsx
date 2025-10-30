import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { useToast } from '@/hooks/use-toast';
import { DispatcherName } from '@/types/dispatcher';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PontajEntry {
  id: string;
  data: string;
  tura_zi: string | null;
  tura_noapte: string | null;
}

export const Pontaj = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { toast } = useToast();
  const [pontaje, setPontaje] = useState<PontajEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  const dispatchers: DispatcherName[] = ['Luiza', 'Laura', 'Rely', 'Antigona', 'Memeta'];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    loadPontaje();
  }, [currentDate]);

  const loadPontaje = async () => {
    try {
      const startDate = new Date(year, month, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('pontaj')
        .select('*')
        .gte('data', startDate)
        .lte('data', endDate)
        .order('data', { ascending: true });

      if (error) throw error;
      setPontaje((data || []) as PontajEntry[]);
    } catch (error) {
      console.error('Error loading pontaje:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-au putut încărca datele de pontaj',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMonth = async () => {
    if (!isAdmin) return;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    try {
      const entries = [];
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day).toISOString().split('T')[0];
        entries.push({
          data: date,
          tura_zi: null,
          tura_noapte: null
        });
      }

      const { error } = await supabase
        .from('pontaj')
        .upsert(entries, { onConflict: 'data', ignoreDuplicates: true });

      if (error) throw error;
      
      toast({
        title: 'Succes',
        description: `Luna a fost generată`
      });
      
      loadPontaje();
    } catch (error: any) {
      console.error('Error generating month:', error);
      toast({
        title: 'Eroare',
        description: error.message || 'Nu s-a putut genera luna',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateShift = async (date: string, field: 'tura_zi' | 'tura_noapte', value: string) => {
    if (!isAdmin) return;

    const actualValue = value === 'none' ? null : value;
    const entry = pontaje.find(p => p.data === date);

    try {
      if (entry) {
        const { error } = await supabase
          .from('pontaj')
          .update({ [field]: actualValue })
          .eq('data', date);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('pontaj')
          .insert({
            data: date,
            [field]: actualValue,
            [field === 'tura_zi' ? 'tura_noapte' : 'tura_zi']: null
          });

        if (error) throw error;
      }
      
      loadPontaje();
      
      toast({
        title: 'Succes',
        description: 'Tura a fost actualizată'
      });
    } catch (error: any) {
      console.error('Error updating shift:', error);
      toast({
        title: 'Eroare',
        description: error.message || 'Nu s-a putut actualiza tura',
        variant: 'destructive'
      });
    }
  };

  const getDaysInMonth = () => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    
    const days = [];
    
    // Empty cells before first day
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(null);
    }
    
    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getPontajForDate = (day: number) => {
    const dateStr = new Date(year, month, day).toISOString().split('T')[0];
    return pontaje.find(p => p.data === dateStr);
  };

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
    'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'
  ];

  const weekDays = ['Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm', 'Dum'];

  if (loading || adminLoading) {
    return <div className="text-center p-4">Se încarcă...</div>;
  }

  const days = getDaysInMonth();

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Calendar */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="text-2xl">Pontaj Lunar Dispeceri</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <Button variant="outline" size="icon" onClick={previousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-xl font-semibold">
                {monthNames[month]} {year}
              </h3>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Week Days Header */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {weekDays.map((day) => (
                <div key={day} className="text-center font-semibold text-sm text-muted-foreground p-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {days.map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} className="aspect-square" />;
                }

                const dateStr = new Date(year, month, day).toISOString().split('T')[0];
                const pontaj = getPontajForDate(day);
                const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

                return (
                  <Card key={day} className={`p-2 ${isToday ? 'ring-2 ring-primary' : ''}`}>
                    <div className="space-y-2">
                      {/* Day number */}
                      <div className={`text-center font-bold text-lg ${isToday ? 'text-primary' : ''}`}>
                        {day}
                      </div>

                      {/* Tura Zi */}
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-muted-foreground">Zi</div>
                        {isAdmin ? (
                          <Select
                            value={pontaj?.tura_zi || 'none'}
                            onValueChange={(value) => handleUpdateShift(dateStr, 'tura_zi', value)}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Selectează" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">-</SelectItem>
                              {dispatchers.map((d) => (
                                <SelectItem key={d} value={d}>{d}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="text-xs text-center py-1 px-2 bg-primary/10 rounded">
                            {pontaj?.tura_zi || '-'}
                          </div>
                        )}
                      </div>

                      {/* Tura Noapte */}
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-muted-foreground">Noapte</div>
                        {isAdmin ? (
                          <Select
                            value={pontaj?.tura_noapte || 'none'}
                            onValueChange={(value) => handleUpdateShift(dateStr, 'tura_noapte', value)}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Selectează" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">-</SelectItem>
                              {dispatchers.map((d) => (
                                <SelectItem key={d} value={d}>{d}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="text-xs text-center py-1 px-2 bg-secondary/10 rounded">
                            {pontaj?.tura_noapte || '-'}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="lg:w-80 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Acțiuni Rapide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Selectează Luna</label>
                <Select
                  value={`${year}-${String(month + 1).padStart(2, '0')}`}
                  onValueChange={(value) => {
                    const [newYear, newMonth] = value.split('-').map(Number);
                    setCurrentDate(new Date(newYear, newMonth - 1, 1));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const date = new Date();
                      date.setMonth(date.getMonth() - 12 + i);
                      const y = date.getFullYear();
                      const m = date.getMonth();
                      return (
                        <SelectItem key={i} value={`${y}-${String(m + 1).padStart(2, '0')}`}>
                          {monthNames[m]} {y}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {isAdmin && (
                <Button onClick={handleGenerateMonth} className="w-full">
                  Generează Toate Zilele
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dispeceri</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {dispatchers.map((dispatcher) => (
                  <li key={dispatcher} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span className="text-sm">{dispatcher}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
