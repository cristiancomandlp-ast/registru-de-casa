import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Transaction, Shift } from '@/types/dispatcher';

export const useGoogleSheets = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Funcție pentru a trimite date către Google Sheets
  const sendToGoogleSheets = async (data: any) => {
    setIsLoading(true);
    try {
      // Verifică dacă există SHEET_URL în localStorage
      const sheetUrl = localStorage.getItem('GOOGLE_SHEET_URL');
      
      if (!sheetUrl) {
        toast({
          title: "Eroare",
          description: "Te rog configurează URL-ul Google Sheet în setări",
          variant: "destructive",
        });
        return false;
      }

      // Trimite date către Google Apps Script Web App
      const response = await fetch(sheetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      toast({
        title: "Succes",
        description: "Datele au fost salvate în Google Sheets",
      });

      return true;
    } catch (error) {
      console.error('Eroare la salvarea în Google Sheets:', error);
      toast({
        title: "Eroare",
        description: "Nu s-au putut salva datele în Google Sheets",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const saveTransaction = async (transaction: Transaction) => {
    return await sendToGoogleSheets({
      type: 'transaction',
      data: transaction,
    });
  };

  const saveShift = async (shift: Shift) => {
    return await sendToGoogleSheets({
      type: 'shift',
      data: shift,
    });
  };

  const saveSoferPelicanul = async (sofer: any) => {
    return await sendToGoogleSheets({
      type: 'sofer_pelicanul',
      data: sofer,
    });
  };

  const saveSoferPelicanulAst = async (sofer: any) => {
    return await sendToGoogleSheets({
      type: 'sofer_pelicanul_ast',
      data: sofer,
    });
  };

  return {
    saveTransaction,
    saveShift,
    saveSoferPelicanul,
    saveSoferPelicanulAst,
    isLoading,
  };
};
