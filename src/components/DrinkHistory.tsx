import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

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
    } finally {
      setIsLoading(false);
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
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        order.status === 'acceptat' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {order.status.toUpperCase()}
                      </span>
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
    </div>
  );
};