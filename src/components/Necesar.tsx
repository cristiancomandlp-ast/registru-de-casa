import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { Textarea } from '@/components/ui/textarea';
import { Pencil, Trash2 } from 'lucide-react';

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
  const [necesarData, setNecesarData] = useState<NecesarEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [numeProdus, setNumeProdus] = useState('');
  const [cantitate, setCantitate] = useState('');
  const [lunaAn, setLunaAn] = useState('');
  const [observatii, setObservatii] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadNecesar();

    const channel = supabase
      .channel('necesar-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'necesar' }, () => {
        loadNecesar();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadNecesar = async () => {
    try {
      const { data, error } = await supabase
        .from('necesar')
        .select('*')
        .order('luna_an', { ascending: false });

      if (error) throw error;
      setNecesarData(data || []);
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
    if (!numeProdus || !cantitate || !lunaAn) {
      toast({
        title: 'Eroare',
        description: 'Completați toate câmpurile obligatorii',
        variant: 'destructive',
      });
      return;
    }

    try {
      const necesarEntry = {
        nume_produs: numeProdus,
        cantitate: cantitate,
        luna_an: lunaAn,
        observatii: observatii || null,
      };

      if (editingId) {
        const { error } = await supabase
          .from('necesar')
          .update(necesarEntry)
          .eq('id', editingId);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Necesar actualizat cu succes',
        });
      } else {
        const { error } = await supabase.from('necesar').insert([necesarEntry]);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Necesar adăugat cu succes',
        });
      }

      resetForm();
      loadNecesar();
    } catch (error: any) {
      toast({
        title: 'Eroare',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (entry: NecesarEntry) => {
    setEditingId(entry.id);
    setNumeProdus(entry.nume_produs);
    setCantitate(entry.cantitate);
    setLunaAn(entry.luna_an);
    setObservatii(entry.observatii || '');
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('necesar').delete().eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Necesar șters cu succes',
      });

      loadNecesar();
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
    setNumeProdus('');
    setCantitate('');
    setLunaAn('');
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
            <CardTitle>{editingId ? 'Editează Necesar' : 'Adaugă Necesar'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nume Produs</Label>
              <Input
                value={numeProdus}
                onChange={(e) => setNumeProdus(e.target.value)}
                placeholder="Ex: Cafea, Hârtie, Zahăr"
              />
            </div>

            <div className="space-y-2">
              <Label>Cantitate</Label>
              <Input
                value={cantitate}
                onChange={(e) => setCantitate(e.target.value)}
                placeholder="Ex: 2 pachete, 5 bucăți"
              />
            </div>

            <div className="space-y-2">
              <Label>Luna/An</Label>
              <Input
                type="month"
                value={lunaAn}
                onChange={(e) => setLunaAn(e.target.value)}
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
          <CardTitle>Necesar Lunar Dispecerat</CardTitle>
        </CardHeader>
        <CardContent>
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
              {necesarData.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.nume_produs}</TableCell>
                  <TableCell>{entry.cantitate}</TableCell>
                  <TableCell>{entry.luna_an}</TableCell>
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
              {necesarData.length === 0 && (
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
