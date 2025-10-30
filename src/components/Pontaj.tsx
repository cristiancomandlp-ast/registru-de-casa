import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { useToast } from '@/hooks/use-toast';
import { DispatcherName } from '@/types/dispatcher';
import { Calendar } from 'lucide-react';

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
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [showMonthSelector, setShowMonthSelector] = useState(false);

  const dispatchers: DispatcherName[] = ['Luiza', 'Laura', 'Rely', 'Antigona', 'Memeta'];

  useEffect(() => {
    loadPontaje();
  }, [selectedMonth]);

  const loadPontaje = async () => {
    try {
      const startDate = `${selectedMonth}-01`;
      const endDate = new Date(new Date(selectedMonth).getFullYear(), new Date(selectedMonth).getMonth() + 1, 0)
        .toISOString().split('T')[0];

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

    const [year, month] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    
    try {
      const entries = [];
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day).toISOString().split('T')[0];
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
        description: `Luna ${month}/${year} a fost generată`
      });
      
      loadPontaje();
      setShowMonthSelector(false);
    } catch (error: any) {
      console.error('Error generating month:', error);
      toast({
        title: 'Eroare',
        description: error.message || 'Nu s-a putut genera luna',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateShift = async (id: string, field: 'tura_zi' | 'tura_noapte', value: string) => {
    if (!isAdmin) return;

    const actualValue = value === 'none' ? null : value;

    try {
      const { error } = await supabase
        .from('pontaj')
        .update({ [field]: actualValue })
        .eq('id', id);

      if (error) throw error;
      
      setPontaje(prev => 
        prev.map(p => p.id === id ? { ...p, [field]: actualValue } : p)
      );
      
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

  if (loading || adminLoading) {
    return <div className="text-center p-4">Se încarcă...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pontaj Dispeceri</h2>
          <p className="text-muted-foreground">Gestionare ture zilnice</p>
        </div>
        <div className="flex items-center gap-3">
          <Input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-auto"
          />
          {isAdmin && (
            <Button onClick={handleGenerateMonth} size="lg">
              <Calendar className="w-4 h-4 mr-2" />
              Generează Luna
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold min-w-[150px]">Data</TableHead>
                  <TableHead className="font-semibold min-w-[200px]">Tura Zi</TableHead>
                  <TableHead className="font-semibold min-w-[200px]">Tura Noapte</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pontaje.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground h-32">
                      Nu există înregistrări de pontaj
                    </TableCell>
                  </TableRow>
                ) : (
                  pontaje.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">
                        {new Date(entry.data).toLocaleDateString('ro-RO', { 
                          day: '2-digit', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </TableCell>
                      <TableCell>
                        {isAdmin ? (
                          <Select
                            value={entry.tura_zi || 'none'}
                            onValueChange={(value) => handleUpdateShift(entry.id, 'tura_zi', value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selectează dispecer" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Niciun dispecer</SelectItem>
                              {dispatchers.map((d) => (
                                <SelectItem key={d} value={d}>{d}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-primary/10 text-primary">
                            {entry.tura_zi || '-'}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {isAdmin ? (
                          <Select
                            value={entry.tura_noapte || 'none'}
                            onValueChange={(value) => handleUpdateShift(entry.id, 'tura_noapte', value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selectează dispecer" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Niciun dispecer</SelectItem>
                              {dispatchers.map((d) => (
                                <SelectItem key={d} value={d}>{d}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-secondary/10 text-secondary">
                            {entry.tura_noapte || '-'}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
