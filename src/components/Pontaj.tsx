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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pontaj Dispeceri</h2>
          <p className="text-muted-foreground">Gestionare prezență angajați</p>
        </div>
        {isAdmin && !showAddForm && (
          <Button onClick={() => setShowAddForm(true)} size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Adaugă Pontaj
          </Button>
        )}
      </div>

      {showAddForm && isAdmin && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle>{editingId ? 'Editează Pontaj' : 'Pontaj Nou'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Dispecer *</label>
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

                <div className="space-y-2">
                  <label className="text-sm font-medium">Data *</label>
                  <Input
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    disabled={!!editingId}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Ore lucrate *</label>
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    value={formData.ore_lucrate}
                    onChange={(e) => setFormData({ ...formData, ore_lucrate: parseFloat(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Observații</label>
                  <Textarea
                    value={formData.observatii}
                    onChange={(e) => setFormData({ ...formData, observatii: e.target.value })}
                    placeholder="Observații opționale"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Anulează
                </Button>
                <Button type="submit">
                  {editingId ? 'Actualizează' : 'Adaugă Pontaj'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Dispecer</TableHead>
                  <TableHead className="font-semibold">Data</TableHead>
                  <TableHead className="font-semibold">Ore lucrate</TableHead>
                  <TableHead className="font-semibold">Observații</TableHead>
                  {isAdmin && <TableHead className="font-semibold text-right">Acțiuni</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {pontaje.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 5 : 4} className="text-center text-muted-foreground h-32">
                      Nu există înregistrări de pontaj
                    </TableCell>
                  </TableRow>
                ) : (
                  pontaje.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.dispatcher}</TableCell>
                      <TableCell>{new Date(entry.data).toLocaleDateString('ro-RO', { 
                        day: '2-digit', 
                        month: 'long', 
                        year: 'numeric' 
                      })}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {entry.ore_lucrate} ore
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{entry.observatii || '-'}</TableCell>
                      {isAdmin && (
                        <TableCell>
                          <div className="flex gap-1 justify-end">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleEdit(entry)}
                              className="h-8 w-8"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDelete(entry.id)}
                              className="h-8 w-8 text-destructive hover:text-destructive"
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
