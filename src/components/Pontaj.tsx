import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { useToast } from '@/hooks/use-toast';
import { DispatcherName } from '@/types/dispatcher';
import { Pencil, Trash2, Plus } from 'lucide-react';

interface PontajEntry {
  id: string;
  dispatcher: DispatcherName;
  data: string;
  ore_lucrate: number;
  observatii: string | null;
}

export const Pontaj = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { toast } = useToast();
  const [pontaje, setPontaje] = useState<PontajEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [formData, setFormData] = useState({
    dispatcher: '' as DispatcherName,
    data: new Date().toISOString().split('T')[0],
    ore_lucrate: 0,
    observatii: ''
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAdmin) {
      toast({
        title: 'Acces interzis',
        description: 'Doar administratorii pot modifica pontajul',
        variant: 'destructive'
      });
      return;
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('pontaj')
          .update({
            ore_lucrate: formData.ore_lucrate,
            observatii: formData.observatii
          })
          .eq('id', editingId);

        if (error) throw error;
        
        toast({
          title: 'Succes',
          description: 'Pontajul a fost actualizat'
        });
      } else {
        const { error } = await supabase
          .from('pontaj')
          .insert({
            dispatcher: formData.dispatcher,
            data: formData.data,
            ore_lucrate: formData.ore_lucrate,
            observatii: formData.observatii || null
          });

        if (error) throw error;
        
        toast({
          title: 'Succes',
          description: 'Pontajul a fost adăugat'
        });
      }

      resetForm();
      loadPontaje();
    } catch (error: any) {
      console.error('Error saving pontaj:', error);
      toast({
        title: 'Eroare',
        description: error.message || 'Nu s-a putut salva pontajul',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (entry: PontajEntry) => {
    if (!isAdmin) return;
    setEditingId(entry.id);
    setFormData({
      dispatcher: entry.dispatcher,
      data: entry.data,
      ore_lucrate: entry.ore_lucrate,
      observatii: entry.observatii || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;
    
    if (!confirm('Sigur doriți să ștergeți această înregistrare?')) return;

    try {
      const { error } = await supabase
        .from('pontaj')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: 'Succes',
        description: 'Pontajul a fost șters'
      });
      
      loadPontaje();
    } catch (error: any) {
      console.error('Error deleting pontaj:', error);
      toast({
        title: 'Eroare',
        description: error.message || 'Nu s-a putut șterge pontajul',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      dispatcher: '' as DispatcherName,
      data: new Date().toISOString().split('T')[0],
      ore_lucrate: 0,
      observatii: ''
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  if (loading || adminLoading) {
    return <div className="text-center p-4">Se încarcă...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Pontaj Dispeceri</CardTitle>
          {isAdmin && !showAddForm && (
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Adaugă Pontaj
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {showAddForm && isAdmin && (
            <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium mb-1">Dispecer</label>
                <Select
                  value={formData.dispatcher}
                  onValueChange={(value) => setFormData({ ...formData, dispatcher: value as DispatcherName })}
                  disabled={!!editingId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selectează dispecer" />
                  </SelectTrigger>
                  <SelectContent>
                    {dispatchers.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Data</label>
                <Input
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  disabled={!!editingId}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Ore lucrate</label>
                <Input
                  type="number"
                  step="0.5"
                  value={formData.ore_lucrate}
                  onChange={(e) => setFormData({ ...formData, ore_lucrate: parseFloat(e.target.value) })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Observații</label>
                <Textarea
                  value={formData.observatii}
                  onChange={(e) => setFormData({ ...formData, observatii: e.target.value })}
                  placeholder="Observații opționale"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">{editingId ? 'Actualizează' : 'Adaugă'}</Button>
                <Button type="button" variant="outline" onClick={resetForm}>Anulează</Button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dispecer</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Ore lucrate</TableHead>
                  <TableHead>Observații</TableHead>
                  {isAdmin && <TableHead>Acțiuni</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {pontaje.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 5 : 4} className="text-center text-gray-500">
                      Nu există înregistrări de pontaj
                    </TableCell>
                  </TableRow>
                ) : (
                  pontaje.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.dispatcher}</TableCell>
                      <TableCell>{new Date(entry.data).toLocaleDateString('ro-RO')}</TableCell>
                      <TableCell>{entry.ore_lucrate} ore</TableCell>
                      <TableCell>{entry.observatii || '-'}</TableCell>
                      {isAdmin && (
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(entry)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(entry.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
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
