import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';

export interface SoferPelicanul {
  id: string;
  indicativ_alocat: string;
  numar_auto: string;
  status: string;
  denumire_societate: string;
  administrator: string;
  telefon_administrator: string;
  nume_sofer: string;
  telefon_sofer: string;
  created_at: string;
  updated_at: string;
}

export const useSoferiPelicanul = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { saveSoferPelicanul } = useGoogleSheets();

  const { data: soferi, isLoading } = useQuery({
    queryKey: ['soferi-pelicanul'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('soferi_pelicanul')
        .select('*')
        .order('indicativ_alocat', { ascending: true });

      if (error) throw error;
      return data as SoferPelicanul[];
    },
  });

  const addSofer = useMutation({
    mutationFn: async (sofer: Omit<SoferPelicanul, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('soferi_pelicanul')
        .insert([sofer])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['soferi-pelicanul'] });
      toast({
        title: 'Succes',
        description: 'Șoferul a fost adăugat cu succes',
      });
      await saveSoferPelicanul(data);
    },
    onError: (error) => {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut adăuga șoferul',
        variant: 'destructive',
      });
      console.error('Error adding sofer:', error);
    },
  });

  const updateSofer = useMutation({
    mutationFn: async (sofer: SoferPelicanul) => {
      const { id, created_at, updated_at, ...updateData } = sofer;
      const { data, error } = await supabase
        .from('soferi_pelicanul')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['soferi-pelicanul'] });
      toast({
        title: 'Succes',
        description: 'Șoferul a fost actualizat cu succes',
      });
      await saveSoferPelicanul(data);
    },
    onError: (error) => {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut actualiza șoferul',
        variant: 'destructive',
      });
      console.error('Error updating sofer:', error);
    },
  });

  const deleteSofer = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('soferi_pelicanul')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['soferi-pelicanul'] });
      toast({
        title: 'Succes',
        description: 'Șoferul a fost șters cu succes',
      });
    },
    onError: (error) => {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut șterge șoferul',
        variant: 'destructive',
      });
      console.error('Error deleting sofer:', error);
    },
  });

  return {
    soferi,
    isLoading,
    addSofer,
    updateSofer,
    deleteSofer,
  };
};
