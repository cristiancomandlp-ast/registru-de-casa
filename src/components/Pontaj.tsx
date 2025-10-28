import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PontajEntry {
  id: string;
  dispatcher: string;
  data: string;
  ore_lucrate: number;
  observatii: string | null;
}

const dispatchers = ['Luiza', 'Laura', 'Rely', 'Antigona', 'Memeta'];

export const Pontaj = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { toast } = useToast();
  const [pontajData, setPontajData] = useState<PontajEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispatcher, setSelectedDispatcher] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [oreLucrate, setOreLucrate] = useState('');
  const [observatii, setObservatii] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadPontaj();

    const channel = supabase
      .channel('pontaj-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pontaj' }, () => {
        loadPontaj();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadPontaj = async () => {
    try {
      const { data, error } = await supabase
        .from('pontaj')
        .select('*')
        .order('data', { ascending: false });

      if (error) throw error;
      setPontajData(data || []);
    } catch (error: any) {
      toast({
        title: 'Eroare',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedDispatcher || !selectedDate || !oreLucrate) {
      toast({
        title: 'Eroare',
        description: 'Completați toate câmpurile obligatorii',
        variant: 'destructive',
      });
      return;
    }

    try {
      const pontajEntry = {
        dispatcher: selectedDispatcher,
        data: format(selectedDate, 'yyyy-MM-dd'),
        ore_lucrate: parseFloat(oreLucrate),
        observatii: observatii || null,
      };

      if (editingId) {
        const { error } = await supabase
          .from('pontaj')
          .update(pontajEntry)
          .eq('id', editingId);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Pontaj actualizat cu succes',
        });
      } else {
        const { error } = await supabase.from('pontaj').insert([pontajEntry]);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Pontaj adăugat cu succes',
        });
      }

      resetForm();
      loadPontaj();
    } catch (error: any) {
      toast({
        title: 'Eroare',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (entry: PontajEntry) => {
    setEditingId(entry.id);
    setSelectedDispatcher(entry.dispatcher);
    setSelectedDate(new Date(entry.data));
    setOreLucrate(entry.ore_lucrate.toString());
    setObservatii(entry.observatii || '');
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('pontaj').delete().eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Pontaj șters cu succes',
      });

      loadPontaj();
    } catch (error: any) {
      toast({
        title: 'Eroare',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setSelectedDispatcher('');
    setSelectedDate(undefined);
    setOreLucrate('');
    setObservatii('');
  };

  if (adminLoading || loading) {
    return <div>Se încarcă...</div>;
  }

  return (
    <div className="space-y-6">
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Editează Pontaj' : 'Adaugă Pontaj'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Dispecer</Label>
              <Select value={selectedDispatcher} onValueChange={setSelectedDispatcher}>
                <SelectTrigger>
                  <SelectValue placeholder="Selectează dispecer" />
                </SelectTrigger>
                <SelectContent>
                  {dispatchers.map((dispatcher) => (
                    <SelectItem key={dispatcher} value={dispatcher}>
                      {dispatcher}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !selectedDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : 'Selectează data'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Ore Lucrate</Label>
              <Input
                type="number"
                step="0.5"
                value={oreLucrate}
                onChange={(e) => setOreLucrate(e.target.value)}
                placeholder="8"
              />
            </div>

            <div className="space-y-2">
              <Label>Observații</Label>
              <Textarea
                value={observatii}
                onChange={(e) => setObservatii(e.target.value)}
                placeholder="Observații opționale"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSubmit} className="flex-1">
                {editingId ? 'Actualizează' : 'Adaugă'}
              </Button>
              {editingId && (
                <Button onClick={resetForm} variant="outline">
                  Anulează
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Pontaj Dispeceri</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dispecer</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ore Lucrate</TableHead>
                <TableHead>Observații</TableHead>
                {isAdmin && <TableHead>Acțiuni</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pontajData.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.dispatcher}</TableCell>
                  <TableCell>{format(new Date(entry.data), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{entry.ore_lucrate}h</TableCell>
                  <TableCell>{entry.observatii || '-'}</TableCell>
                  {isAdmin && (
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(entry)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(entry.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {pontajData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 5 : 4} className="text-center">
                    Nu există date
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
