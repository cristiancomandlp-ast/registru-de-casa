import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useDispatchers = () => {
  const [dispatchers, setDispatchers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadDispatchers = useCallback(async () => {
    const { data, error } = await supabase.from('dispatchers').select('name').order('name');
    if (error) {
      toast({ title: 'Eroare', description: 'Dispecerii nu au putut fi încărcați.', variant: 'destructive' });
    } else {
      setDispatchers((data ?? []).map((dispatcher) => dispatcher.name));
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    void loadDispatchers();
  }, [loadDispatchers]);

  const addDispatcher = async (name: string) => {
    const normalizedName = name.trim();
    if (!normalizedName) return false;
    const { error } = await supabase.from('dispatchers').insert({ name: normalizedName });
    if (error) {
      toast({ title: 'Eroare', description: error.code === '23505' ? 'Acest dispecer există deja.' : 'Dispecerul nu a putut fi adăugat.', variant: 'destructive' });
      return false;
    }
    await loadDispatchers();
    return true;
  };

  const updateDispatcher = async (oldName: string, newName: string) => {
    const normalizedName = newName.trim();
    if (!normalizedName) return false;
    const { error } = await supabase.from('dispatchers').update({ name: normalizedName }).eq('name', oldName);
    if (error) {
      toast({ title: 'Eroare', description: 'Dispecerul nu a putut fi modificat.', variant: 'destructive' });
      return false;
    }
    await loadDispatchers();
    return true;
  };

  const deleteDispatcher = async (name: string) => {
    const { error } = await supabase.from('dispatchers').delete().eq('name', name);
    if (error) {
      toast({ title: 'Eroare', description: 'Dispecerul nu a putut fi șters.', variant: 'destructive' });
      return false;
    }
    await loadDispatchers();
    return true;
  };

  return { dispatchers, loading, addDispatcher, updateDispatcher, deleteDispatcher };
};
