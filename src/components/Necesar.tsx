import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Trash2, Plus } from 'lucide-react';

interface NecesarEntry {
  id: string;
  nume_produs: string;
  cantitate: string;
  luna_an: string;
  observatii: string | null;
}

export const Necesar = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { toast } = useToast();
  const [items, setItems] = useState<NecesarEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [formData, setFormData] = useState({
    nume_produs: '',
    cantitate: '',
    luna_an: getCurrentMonthYear(),
    observatii: ''
  });

  function getCurrentMonthYear() {
    const now = new Date();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    return `${year}-${month}`;
  }

  useEffect(() => {
    loadNecesar();
  }, []);

  const loadNecesar = async () => {
    try {
      const { data, error } = await supabase
        .from('necesar')
        .select('*')
        .order('luna_an', { ascending: false })
        .order('nume_produs', { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error loading necesar:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-au putut încărca datele',
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
        description: 'Doar administratorii pot modifica necesarul',
        variant: 'destructive'
      });
      return;
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('necesar')
          .update({
            nume_produs: formData.nume_produs,
            cantitate: formData.cantitate,
            luna_an: formData.luna_an,
            observatii: formData.observatii || null
          })
          .eq('id', editingId);

        if (error) throw error;
        
        toast({
          title: 'Succes',
          description: 'Produsul a fost actualizat'
        });
      } else {
        const { error } = await supabase
          .from('necesar')
          .insert({
            nume_produs: formData.nume_produs,
            cantitate: formData.cantitate,
            luna_an: formData.luna_an,
            observatii: formData.observatii || null
          });

        if (error) throw error;
        
        toast({
          title: 'Succes',
          description: 'Produsul a fost adăugat'
        });
      }

      resetForm();
      loadNecesar();
    } catch (error: any) {
      console.error('Error saving necesar:', error);
      toast({
        title: 'Eroare',
        description: error.message || 'Nu s-a putut salva produsul',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (item: NecesarEntry) => {
    if (!isAdmin) return;
    setEditingId(item.id);
    setFormData({
      nume_produs: item.nume_produs,
      cantitate: item.cantitate,
      luna_an: item.luna_an,
      observatii: item.observatii || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;
    
    if (!confirm('Sigur doriți să ștergeți acest produs?')) return;

    try {
      const { error } = await supabase
        .from('necesar')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: 'Succes',
        description: 'Produsul a fost șters'
      });
      
      loadNecesar();
    } catch (error: any) {
      console.error('Error deleting necesar:', error);
      toast({
        title: 'Eroare',
        description: error.message || 'Nu s-a putut șterge produsul',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nume_produs: '',
      cantitate: '',
      luna_an: getCurrentMonthYear(),
      observatii: ''
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const formatMonthYear = (lunaAn: string) => {
    const [year, month] = lunaAn.split('-');
    const monthNames = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Noi', 'Dec'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  if (loading || adminLoading) {
    return <div className="text-center p-4">Se încarcă...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Necesar Lunar Dispecerat</CardTitle>
          {isAdmin && !showAddForm && (
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Adaugă Produs
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {showAddForm && isAdmin && (
            <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium mb-1">Nume produs</label>
                <Input
                  value={formData.nume_produs}
                  onChange={(e) => setFormData({ ...formData, nume_produs: e.target.value })}
                  placeholder="ex: Cafea, Hârtie, Zahăr"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Cantitate</label>
                <Input
                  value={formData.cantitate}
                  onChange={(e) => setFormData({ ...formData, cantitate: e.target.value })}
                  placeholder="ex: 2 kg, 5 pachete, 10 buc"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Lună/An</label>
                <Input
                  type="month"
                  value={formData.luna_an}
                  onChange={(e) => setFormData({ ...formData, luna_an: e.target.value })}
                  required
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
                  <TableHead>Produs</TableHead>
                  <TableHead>Cantitate</TableHead>
                  <TableHead>Luna/An</TableHead>
                  <TableHead>Observații</TableHead>
                  {isAdmin && <TableHead>Acțiuni</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 5 : 4} className="text-center text-gray-500">
                      Nu există produse adăugate
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.nume_produs}</TableCell>
                      <TableCell>{item.cantitate}</TableCell>
                      <TableCell>{formatMonthYear(item.luna_an)}</TableCell>
                      <TableCell>{item.observatii || '-'}</TableCell>
                      {isAdmin && (
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(item)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(item.id)}
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
