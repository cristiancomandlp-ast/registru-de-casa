import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useAdmin } from '@/hooks/useAdmin';
import { Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';

type Reclamatie = {
  id: string;
  nume_complet: string;
  telefon: string;
  email: string | null;
  tip_reclamatie: string;
  numar_taxi: string;
  data_incident: string;
  ora_incident: string;
  descriere: string;
  status: string;
  created_at: string;
};

export const Reclamatii = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAdmin } = useAdmin();
  const [showAdmin, setShowAdmin] = useState(false);

  const [formData, setFormData] = useState({
    nume_complet: '',
    telefon: '',
    email: '',
    tip_reclamatie: '',
    numar_taxi: '',
    data_incident: '',
    ora_incident: '',
    descriere: '',
  });

  const { data: reclamatii = [] } = useQuery({
    queryKey: ['reclamatii'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reclamatii')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Reclamatie[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from('reclamatii').insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Succes',
        description: 'Reclamația a fost înregistrată cu succes.',
      });
      setFormData({
        nume_complet: '',
        telefon: '',
        email: '',
        tip_reclamatie: '',
        numar_taxi: '',
        data_incident: '',
        ora_incident: '',
        descriere: '',
      });
      queryClient.invalidateQueries({ queryKey: ['reclamatii'] });
    },
    onError: () => {
      toast({
        title: 'Eroare',
        description: 'A apărut o eroare la înregistrarea reclamației.',
        variant: 'destructive',
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('reclamatii')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Succes',
        description: 'Statusul reclamației a fost actualizat.',
      });
      queryClient.invalidateQueries({ queryKey: ['reclamatii'] });
    },
    onError: () => {
      toast({
        title: 'Eroare',
        description: 'A apărut o eroare la actualizarea statusului.',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('reclamatii').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Succes',
        description: 'Reclamația a fost ștearsă.',
      });
      queryClient.invalidateQueries({ queryKey: ['reclamatii'] });
    },
    onError: () => {
      toast({
        title: 'Eroare',
        description: 'A apărut o eroare la ștergerea reclamației.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.nume_complet ||
      !formData.telefon ||
      !formData.tip_reclamatie ||
      !formData.numar_taxi ||
      !formData.data_incident ||
      !formData.ora_incident ||
      !formData.descriere
    ) {
      toast({
        title: 'Eroare',
        description: 'Toate câmpurile obligatorii trebuie completate.',
        variant: 'destructive',
      });
      return;
    }
    createMutation.mutate(formData);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Rezolvat':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Respins':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {!showAdmin ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Înregistrare Reclamație</CardTitle>
              {isAdmin && (
                <Button onClick={() => setShowAdmin(true)} variant="outline">
                  Panou Admin
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Vă rugăm completați toate câmpurile pentru a înregistra reclamația dumneavoastră
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nume_complet">Nume Complet *</Label>
                <Input
                  id="nume_complet"
                  value={formData.nume_complet}
                  onChange={(e) => setFormData({ ...formData, nume_complet: e.target.value })}
                  placeholder="Introduceți numele complet"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefon">Telefon *</Label>
                <Input
                  id="telefon"
                  value={formData.telefon}
                  onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                  placeholder="Introduceți numărul de telefon"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (opțional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Introduceți adresa de email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tip_reclamatie">Tip Reclamație *</Label>
                <Select
                  value={formData.tip_reclamatie}
                  onValueChange={(value) => setFormData({ ...formData, tip_reclamatie: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selectați tipul" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Comportament Șofer">Comportament Șofer</SelectItem>
                    <SelectItem value="Tarif Incorect">Tarif Incorect</SelectItem>
                    <SelectItem value="Cursă Refuzată">Cursă Refuzată</SelectItem>
                    <SelectItem value="Întârziere">Întârziere</SelectItem>
                    <SelectItem value="Starea Vehiculului">Starea Vehiculului</SelectItem>
                    <SelectItem value="Altele">Altele</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="numar_taxi">Număr Taxi *</Label>
                <Input
                  id="numar_taxi"
                  value={formData.numar_taxi}
                  onChange={(e) => setFormData({ ...formData, numar_taxi: e.target.value })}
                  placeholder="Introduceți numărul de taxi"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data_incident">Data Incidentului *</Label>
                  <Input
                    id="data_incident"
                    type="date"
                    value={formData.data_incident}
                    onChange={(e) => setFormData({ ...formData, data_incident: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ora_incident">Ora Incidentului *</Label>
                  <Input
                    id="ora_incident"
                    type="time"
                    value={formData.ora_incident}
                    onChange={(e) => setFormData({ ...formData, ora_incident: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descriere">Descriere Detaliată *</Label>
                <Textarea
                  id="descriere"
                  value={formData.descriere}
                  onChange={(e) => setFormData({ ...formData, descriere: e.target.value })}
                  placeholder="Descrieți situația întâmpinată..."
                  rows={6}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Se trimite...' : 'Trimite Reclamația'}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Panou Admin - Gestionare Reclamații</CardTitle>
              <Button onClick={() => setShowAdmin(false)} variant="outline">
                Înapoi la Formular
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {reclamatii.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nu există reclamații înregistrate.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Ora</TableHead>
                      <TableHead>Nume</TableHead>
                      <TableHead>Telefon</TableHead>
                      <TableHead>Tip</TableHead>
                      <TableHead>Nr. Taxi</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Acțiuni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reclamatii.map((reclamatie) => (
                      <TableRow key={reclamatie.id}>
                        <TableCell className="whitespace-nowrap">
                          <div className="text-sm">
                            {new Date(reclamatie.data_incident).toLocaleDateString('ro-RO')}
                          </div>
                          <div className="text-xs text-muted-foreground">{reclamatie.ora_incident}</div>
                        </TableCell>
                        <TableCell className="font-medium">{reclamatie.nume_complet}</TableCell>
                        <TableCell>{reclamatie.telefon}</TableCell>
                        <TableCell>{reclamatie.tip_reclamatie}</TableCell>
                        <TableCell>{reclamatie.numar_taxi}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(reclamatie.status)}
                            <Select
                              value={reclamatie.status}
                              onValueChange={(value) =>
                                updateStatusMutation.mutate({ id: reclamatie.id, status: value })
                              }
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="In asteptare">În așteptare</SelectItem>
                                <SelectItem value="In lucru">În lucru</SelectItem>
                                <SelectItem value="Rezolvat">Rezolvat</SelectItem>
                                <SelectItem value="Respins">Respins</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => deleteMutation.mutate(reclamatie.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
