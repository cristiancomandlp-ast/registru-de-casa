import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Pencil, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAdmin } from '@/hooks/useAdmin';

interface DrinkOrder {
  id: string;
  data_ora: string;
  nume_client: string;
  telefon_client: string;
  adresa_preluare: string;
  adresa_destinatie: string;
  marca_auto: string;
  indicativ: string;
  timp_estimat: string;
  status: string;
}

export const DrinkHistory = () => {
  const { toast } = useToast();
  const { isAdmin } = useAdmin();
  const [orders, setOrders] = useState<DrinkOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editOrder, setEditOrder] = useState<DrinkOrder | null>(null);
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    data_ora: '',
    nume_client: '',
    telefon_client: '',
    adresa_preluare: '',
    adresa_destinatie: '',
    marca_auto: '',
    indicativ: '',
    timp_estimat: '',
    status: '',
  });

  useEffect(() => {
    fetchOrders();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('drink_orders_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'drink_orders'
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('drink_orders')
        .select('*')
        .order('data_ora', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (order: DrinkOrder) => {
    setEditOrder(order);
    const orderDate = new Date(order.data_ora);
    setEditFormData({
      data_ora: orderDate.toISOString().slice(0, 16),
      nume_client: order.nume_client,
      telefon_client: order.telefon_client,
      adresa_preluare: order.adresa_preluare,
      adresa_destinatie: order.adresa_destinatie,
      marca_auto: order.marca_auto,
      indicativ: order.indicativ,
      timp_estimat: order.timp_estimat,
      status: order.status,
    });
  };

  const handleSaveEdit = async () => {
    if (!editOrder) return;

    try {
      const { error } = await supabase
        .from('drink_orders')
        .update({
          data_ora: new Date(editFormData.data_ora).toISOString(),
          nume_client: editFormData.nume_client,
          telefon_client: editFormData.telefon_client,
          adresa_preluare: editFormData.adresa_preluare,
          adresa_destinatie: editFormData.adresa_destinatie,
          marca_auto: editFormData.marca_auto,
          indicativ: editFormData.indicativ,
          timp_estimat: editFormData.timp_estimat,
          status: editFormData.status,
        })
        .eq('id', editOrder.id);

      if (error) throw error;

      toast({
        title: "Succes",
        description: "Comanda a fost actualizată",
      });

      setEditOrder(null);
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut actualiza comanda",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteOrderId) return;

    try {
      const { error } = await supabase
        .from('drink_orders')
        .delete()
        .eq('id', deleteOrderId);

      if (error) throw error;

      toast({
        title: "Succes",
        description: "Comanda a fost ștearsă",
      });

      setDeleteOrderId(null);
      fetchOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut șterge comanda",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="text-center p-8">Se încarcă...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Istoric Comenzi DRINK OK</h2>
      
      <div className="space-y-4">
        {orders.length === 0 ? (
          <Card className="p-8">
            <p className="text-center text-muted-foreground">
              Nicio comandă înregistrată încă
            </p>
          </Card>
        ) : (
          orders.map((order) => {
            const orderDate = new Date(order.data_ora);
            
            return (
              <Card key={order.id} className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{order.nume_client}</h3>
                      <p className="text-sm text-muted-foreground">
                        {orderDate.toLocaleDateString('ro-RO')} • {orderDate.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        order.status === 'acceptat' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {order.status.toUpperCase()}
                      </span>
                      {isAdmin && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(order)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteOrderId(order.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Telefon</div>
                      <div className="font-semibold">{order.telefon_client}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Marcă Auto</div>
                      <div className="font-semibold">{order.marca_auto}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Indicativ</div>
                      <div className="font-semibold">{order.indicativ}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Timp Estimat</div>
                      <div className="font-semibold">{order.timp_estimat}</div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <span className="text-sm text-muted-foreground min-w-[100px]">Preluare:</span>
                        <span className="text-sm font-medium">{order.adresa_preluare}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-sm text-muted-foreground min-w-[100px]">Destinație:</span>
                        <span className="text-sm font-medium">{order.adresa_destinatie}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      <Dialog open={!!editOrder} onOpenChange={() => setEditOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editează Comandă</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="edit_data_ora">Data și Ora</Label>
              <Input
                id="edit_data_ora"
                type="datetime-local"
                value={editFormData.data_ora}
                onChange={(e) => setEditFormData({ ...editFormData, data_ora: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit_nume_client">Nume Client</Label>
              <Input
                id="edit_nume_client"
                value={editFormData.nume_client}
                onChange={(e) => setEditFormData({ ...editFormData, nume_client: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit_telefon_client">Telefon Client</Label>
              <Input
                id="edit_telefon_client"
                value={editFormData.telefon_client}
                onChange={(e) => setEditFormData({ ...editFormData, telefon_client: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit_adresa_preluare">Adresă Preluare</Label>
              <Input
                id="edit_adresa_preluare"
                value={editFormData.adresa_preluare}
                onChange={(e) => setEditFormData({ ...editFormData, adresa_preluare: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit_adresa_destinatie">Adresă Destinație</Label>
              <Input
                id="edit_adresa_destinatie"
                value={editFormData.adresa_destinatie}
                onChange={(e) => setEditFormData({ ...editFormData, adresa_destinatie: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit_marca_auto">Marcă Auto</Label>
              <Input
                id="edit_marca_auto"
                value={editFormData.marca_auto}
                onChange={(e) => setEditFormData({ ...editFormData, marca_auto: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit_indicativ">Indicativ</Label>
              <Input
                id="edit_indicativ"
                value={editFormData.indicativ}
                onChange={(e) => setEditFormData({ ...editFormData, indicativ: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit_timp_estimat">Timp Estimat</Label>
              <Input
                id="edit_timp_estimat"
                value={editFormData.timp_estimat}
                onChange={(e) => setEditFormData({ ...editFormData, timp_estimat: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <Label className="mb-2 block">Status Comandă</Label>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={editFormData.status === 'acceptat' ? 'default' : 'outline'}
                  onClick={() => setEditFormData({ ...editFormData, status: 'acceptat' })}
                  className="flex-1"
                >
                  ACCEPTAT
                </Button>
                <Button
                  type="button"
                  variant={editFormData.status === 'refuzat' ? 'destructive' : 'outline'}
                  onClick={() => setEditFormData({ ...editFormData, status: 'refuzat' })}
                  className="flex-1"
                >
                  REFUZAT
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOrder(null)}>
              Anulează
            </Button>
            <Button onClick={handleSaveEdit}>
              Salvează
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteOrderId} onOpenChange={() => setDeleteOrderId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmă Ștergerea</AlertDialogTitle>
            <AlertDialogDescription>
              Ești sigur că vrei să ștergi această comandă? Această acțiune nu poate fi anulată.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Șterge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};