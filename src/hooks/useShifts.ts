import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Shift } from '@/types/dispatcher';

export const useShifts = (registerType: 'CASA' | 'DMX' = 'CASA') => {
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [history, setHistory] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  // Încarcă tura curentă și istoricul
  useEffect(() => {
    loadShifts();

    // Abonare la modificări în timp real
    const channel = supabase
      .channel('shifts-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shifts'
        },
        () => {
          loadShifts();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions'
        },
        () => {
          loadShifts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [registerType]);

  const loadShifts = async () => {
    try {
      // Încarcă toate turele cu tranzacțiile lor pentru registrul specificat
      const { data: shiftsData, error: shiftsError } = await (supabase as any)
        .from('shifts')
        .select(`
          *,
          transactions (*)
        `)
        .eq('register_type', registerType)
        .order('start_time', { ascending: false });

      if (shiftsError) throw shiftsError;

      // Transformă datele pentru a se potrivi cu tipul Shift
      const shifts: Shift[] = (shiftsData || []).map((shift: any) => ({
        id: shift.id,
        dispatcher: shift.dispatcher,
        startTime: shift.start_time,
        endTime: shift.end_time,
        initialBalance: parseFloat(shift.initial_balance),
        finalBalance: parseFloat(shift.final_balance),
        transactions: (shift.transactions || []).map((t: any) => ({
          id: t.id,
          type: t.type,
          amount: parseFloat(t.amount),
          description: t.description,
          timestamp: t.timestamp,
          dispatcher: t.dispatcher,
        })),
      }));

      // Găsește tura curentă (fără endTime)
      const current = shifts.find(s => !s.endTime) || null;
      setCurrentShift(current);

      // Istoricul conține doar turele încheiate
      const completed = shifts.filter(s => s.endTime);
      setHistory(completed);

      setLoading(false);
    } catch (error) {
      console.error('Error loading shifts:', error);
      setLoading(false);
    }
  };

  const createShift = async (shift: Shift) => {
    try {
      const { error } = await (supabase as any)
        .from('shifts')
        .insert({
          id: shift.id,
          dispatcher: shift.dispatcher,
          start_time: shift.startTime,
          initial_balance: shift.initialBalance,
          final_balance: shift.finalBalance,
          register_type: registerType,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error creating shift:', error);
      throw error;
    }
  };

  const updateShift = async (shiftId: string, updates: Partial<Shift>) => {
    try {
      const dbUpdates: any = {};
      if (updates.finalBalance !== undefined) dbUpdates.final_balance = updates.finalBalance;
      if (updates.endTime !== undefined) dbUpdates.end_time = updates.endTime;
      if (updates.dispatcher !== undefined) dbUpdates.dispatcher = updates.dispatcher;

      const { error } = await (supabase as any)
        .from('shifts')
        .update(dbUpdates)
        .eq('id', shiftId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating shift:', error);
      throw error;
    }
  };

  const addTransaction = async (shiftId: string, transaction: any) => {
    try {
      const { error } = await (supabase as any)
        .from('transactions')
        .insert({
          id: transaction.id,
          shift_id: shiftId,
          type: transaction.type,
          amount: transaction.amount,
          description: transaction.description,
          timestamp: transaction.timestamp,
          dispatcher: transaction.dispatcher,
          register_type: registerType,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  };

  return {
    currentShift,
    history,
    loading,
    createShift,
    updateShift,
    addTransaction,
  };
};
