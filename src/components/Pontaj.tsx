import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { useToast } from '@/hooks/use-toast';
import { DispatcherName } from '@/types/dispatcher';
import { Plus } from 'lucide-react';

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

  const dispatchers: DispatcherName[] = ['Luiza', 'Laura', 'Rely', 'Antigona', 'Memeta'];

  useEffect(() => {
    loadPontaje();
  }, []);

  const loadPontaje = async () => {
    try {
      const { data, error } = await supabase
        .from('pontaj')
        .select('*')
        .order('data', { ascending: false });

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

  const handleAddDate = async () => {
    if (!isAdmin) return;

    const today = new Date().toISOString().split('T')[0];
    
    try {
      const { error } = await supabase
        .from('pontaj')
        .insert({
          data: today,
          tura_zi: null,
          tura_noapte: null
        });

      if (error) throw error;
      
      toast({
        title: 'Succes',
        description: 'Data a fost adăugată'
      });
      
      loadPontaje();
    } catch (error: any) {
      console.error('Error adding date:', error);
      toast({
        title: 'Eroare',
        description: error.message || 'Nu s-a putut adăuga data',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateShift = async (id: string, field: 'tura_zi' | 'tura_noapte', value: string | null) => {
    if (!isAdmin) return;

    try {
      const { error } = await supabase
        .from('pontaj')
        .update({ [field]: value })
        .eq('id', id);

      if (error) throw error;
      
      setPontaje(prev => 
        prev.map(p => p.id === id ? { ...p, [field]: value } : p)
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pontaj Dispeceri</h2>
          <p className="text-muted-foreground">Gestionare ture zilnice</p>
        </div>
        {isAdmin && (
          <Button onClick={handleAddDate} size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Adaugă Dată
          </Button>
        )}
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
                            value={entry.tura_zi || ''}
                            onValueChange={(value) => handleUpdateShift(entry.id, 'tura_zi', value || null)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selectează dispecer" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Niciun dispecer</SelectItem>
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
                            value={entry.tura_noapte || ''}
                            onValueChange={(value) => handleUpdateShift(entry.id, 'tura_noapte', value || null)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selectează dispecer" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Niciun dispecer</SelectItem>
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
