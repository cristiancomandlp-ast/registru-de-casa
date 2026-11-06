import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';

export type SoferPelicanulAst = {
  id: string;
  numar_contract: string;
  data_contract: string;
  indicativ_alocat: string;
  denumire_societate: string;
  cui: string;
  nr_inreg_onrc: string;
  sediu_societate: string;
  localitate: string;
  administrator: string;
  telefon_administrator: string;
  aut_taxi: string;
  aut_transp: string;
  marca_auto: string;
  numar_auto: string;
  serie_sasiu: string;
  nume_sofer: string;
  telefon_sofer: string;
  created_at: string;
  updated_at: string;
  status?: string;
  data_decolantare?: string | null;
  plati_lunare?: Record<string, { platit: boolean; data: string | null }>;
};

export const useSoferiPelicanulAst = () => {
  const queryClient = useQueryClient();
  const { saveSoferPelicanulAst } = useGoogleSheets();

  const { data: soferi, isLoading } = useQuery({
    queryKey: ['soferi-pelicanul-ast'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('soferi_pelicanul_ast')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SoferPelicanulAst[];
    },
  });

  const addSofer = useMutation({
    mutationFn: async (sofer: Omit<SoferPelicanulAst, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('soferi_pelicanul_ast')
        .insert(sofer)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['soferi-pelicanul-ast'] });
      toast({
        title: 'Succes',
        description: 'Șofer adăugat cu succes',
      });
      await saveSoferPelicanulAst(data);
    },
    onError: (error) => {
      toast({
        title: 'Eroare',
        description: `Nu s-a putut adăuga șoferul: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const updateSofer = useMutation({
    mutationFn: async ({ id, ...sofer }: Partial<SoferPelicanulAst> & { id: string }) => {
      const { data, error } = await supabase
        .from('soferi_pelicanul_ast')
        .update(sofer)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['soferi-pelicanul-ast'] });
      toast({
        title: 'Succes',
        description: 'Șofer actualizat cu succes',
      });
      await saveSoferPelicanulAst(data);
    },
    onError: (error) => {
      toast({
        title: 'Eroare',
        description: `Nu s-a putut actualiza șoferul: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const deleteSofer = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('soferi_pelicanul_ast')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['soferi-pelicanul-ast'] });
      toast({
        title: 'Succes',
        description: 'Șofer șters cu succes',
      });
    },
    onError: (error) => {
      toast({
        title: 'Eroare',
        description: `Nu s-a putut șterge șoferul: ${error.message}`,
        variant: 'destructive',
      });
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
