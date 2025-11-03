import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const [orders, setOrders] = useState<DrinkOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      toast({
        title: "Eroare",
        description: "Nu s-au putut încărca comenzile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return <div className="text-center p-8">Se încarcă...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-foreground">Istoric Comenzi DRINK OK</h2>
        
        {orders.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Nu există comenzi</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data și Ora</TableHead>
                  <TableHead>Nume Client</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Adresă Preluare</TableHead>
                  <TableHead>Adresă Destinație</TableHead>
                  <TableHead>Marcă Auto</TableHead>
                  <TableHead>Indicativ</TableHead>
                  <TableHead>Timp Estimat</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{formatDateTime(order.data_ora)}</TableCell>
                    <TableCell>{order.nume_client}</TableCell>
                    <TableCell>{order.telefon_client}</TableCell>
                    <TableCell>{order.adresa_preluare}</TableCell>
                    <TableCell>{order.adresa_destinatie}</TableCell>
                    <TableCell>{order.marca_auto}</TableCell>
                    <TableCell>{order.indicativ}</TableCell>
                    <TableCell>{order.timp_estimat}</TableCell>
                    <TableCell>
                      <Badge variant={order.status === 'acceptat' ? 'default' : 'destructive'}>
                        {order.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
};