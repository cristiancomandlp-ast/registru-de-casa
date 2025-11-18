import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface GoogleSheetsImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableName: 'soferi_pelicanul' | 'soferi_pelicanul_ast';
  onSuccess: () => void;
}

export const GoogleSheetsImportDialog = ({
  open,
  onOpenChange,
  tableName,
  onSuccess,
}: GoogleSheetsImportDialogProps) => {
  const [sheetUrl, setSheetUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const parseCSV = (csvText: string): any[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      if (values.length === headers.length) {
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });
        rows.push(row);
      }
    }

    return rows;
  };

  const mapToTableStructure = (data: any[]): any[] => {
    return data.map(row => ({
      indicativ_alocat: row['INDICATIV'] || row['INDICATIV AUTO'] || row['indicativ_alocat'] || '',
      numar_auto: row['NUMAR AUTO'] || row['NUMAR INMATRICULARE'] || row['numar_auto'] || '',
      status: row['STATUS'] || row['status'] || '',
      denumire_societate: row['FIRMA'] || row['denumire_societate'] || '',
      administrator: row['ADMINISTRATOR'] || row['administrator'] || '',
      telefon_administrator: row['TEL. ADMINISTRATOR'] || row['TELEFON ADMINISTRATOR'] || row['telefon_administrator'] || '',
      nume_sofer: row['NUME SOFER'] || row['nume_sofer'] || '',
      telefon_sofer: row['TELEFON'] || row['TELEFON SOFER'] || row['telefon_sofer'] || '',
      numar_contract: '',
      data_contract: '2024-01-01',
      cui: '',
      nr_inreg_onrc: '',
      sediu_societate: '',
      localitate: '',
      aut_taxi: '',
      aut_transp: '',
      marca_auto: '',
      serie_sasiu: '',
    }));
  };

  const handleImport = async () => {
    if (!sheetUrl) {
      toast({
        title: 'Eroare',
        description: 'Te rog introdu URL-ul foii de calcul',
        variant: 'destructive',
      });
      return;
    }

    setIsImporting(true);

    try {
      // Extract sheet ID from URL
      let csvUrl = sheetUrl;
      
      // If it's a regular Google Sheets URL, convert to CSV export URL
      if (sheetUrl.includes('docs.google.com/spreadsheets')) {
        const match = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
        if (match) {
          const sheetId = match[1];
          csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
        }
      }

      // Fetch CSV data
      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error('Nu s-a putut accesa foaia de calcul. Asigură-te că este publică.');
      }

      const csvText = await response.text();
      const parsedData = parseCSV(csvText);

      if (parsedData.length === 0) {
        throw new Error('Nu s-au găsit date în foaia de calcul');
      }

      // Map to table structure
      const mappedData = mapToTableStructure(parsedData);

      // Insert into Supabase
      const { error } = await supabase
        .from(tableName)
        .insert(mappedData);

      if (error) throw error;

      toast({
        title: 'Succes',
        description: `${mappedData.length} șoferi importați cu succes!`,
      });

      onSuccess();
      onOpenChange(false);
      setSheetUrl('');
    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: 'Eroare la import',
        description: error.message || 'Nu s-au putut importa datele',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Importă din Google Sheets</DialogTitle>
          <DialogDescription>
            Introdu URL-ul unei foi de calcul Google Sheets pentru a importa șoferii.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="sheet-url">URL Foaie de Calcul Google</Label>
            <Input
              id="sheet-url"
              placeholder="https://docs.google.com/spreadsheets/d/..."
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              disabled={isImporting}
            />
          </div>

          <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
            <p className="font-semibold">Instrucțiuni:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Deschide foaia de calcul în Google Sheets</li>
              <li>Click pe "Fișier" → "Partajare" → "Publică pe web"</li>
              <li>Selectează "Întreaga foaie de calcul" și formatul "Pagină web"</li>
              <li>Click pe "Publică" și copiază URL-ul</li>
              <li>Lipește URL-ul mai sus</li>
            </ol>
            <p className="text-muted-foreground mt-2">
              Foaia trebuie să conțină coloane cu numele: INDICATIV, NUMAR AUTO, STATUS, FIRMA, ADMINISTRATOR, TEL. ADMINISTRATOR, NUME SOFER, TELEFON
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setSheetUrl('');
            }}
            disabled={isImporting}
          >
            Anulează
          </Button>
          <Button onClick={handleImport} disabled={isImporting}>
            {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Importă
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
