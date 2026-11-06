import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAdmin } from '@/hooks/useAdmin';
import { useDispatchers } from '@/hooks/useDispatchers';
import { Trash2, Pencil, Plus } from 'lucide-react';

interface SettingsProps {
  onBack?: () => void;
}

export const Settings = ({ onBack }: SettingsProps) => {
  const [sheetUrl, setSheetUrl] = useState("");
  const { toast } = useToast();
  const { isAdmin } = useAdmin();
  const { dispatchers, addDispatcher, updateDispatcher, updateDispatcherColor, deleteDispatcher } = useDispatchers();
  const [newDispatcher, setNewDispatcher] = useState('');
  const [newColor, setNewColor] = useState('#3b82f6');
  const [editingDispatcher, setEditingDispatcher] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    const savedUrl = localStorage.getItem('GOOGLE_SHEET_URL');
    if (savedUrl) {
      setSheetUrl(savedUrl);
    }
  }, []);

  const handleSave = () => {
    if (!sheetUrl.trim()) {
      toast({
        title: "Eroare",
        description: "Te rog introdu un URL valid",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem('GOOGLE_SHEET_URL', sheetUrl);
    toast({
      title: "Salvat",
      description: "URL-ul Google Sheet a fost salvat cu succes",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">Setări</h2>
        {onBack && <Button variant="outline" onClick={onBack}>← Înapoi</Button>}
      </div>

      {isAdmin && (
        <Card className="p-6 border-2 border-black">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Gestionare dispeceri</h3>
              <p className="text-sm text-muted-foreground">Doar administratorul poate adăuga, modifica sau șterge dispeceri.</p>
            </div>
            <div className="flex gap-2">
              <Input value={newDispatcher} onChange={(event) => setNewDispatcher(event.target.value)} placeholder="Nume dispecer" />
              <Input type="color" value={newColor} onChange={(event) => setNewColor(event.target.value)} className="w-14 p-1" aria-label="Culoare dispecer nou" />
              <Button onClick={async () => { if (await addDispatcher(newDispatcher, newColor)) setNewDispatcher(''); }} aria-label="Adaugă dispecer"><Plus className="h-4 w-4" /></Button>
            </div>
            <div className="space-y-2">
              {dispatchers.map((dispatcher) => (
                <div key={dispatcher.name} className="flex items-center gap-2 rounded border p-2">
                  <Input type="color" value={dispatcher.color} onChange={(event) => updateDispatcherColor(dispatcher.name, event.target.value)} className="w-12 p-1" aria-label={`Culoare ${dispatcher.name}`} />
                  {editingDispatcher === dispatcher.name ? (
                    <Input value={editingName} onChange={(event) => setEditingName(event.target.value)} autoFocus />
                  ) : <span className="flex-1">{dispatcher.name}</span>}
                  {editingDispatcher === dispatcher.name ? (
                    <Button size="sm" onClick={async () => { if (await updateDispatcher(dispatcher.name, editingName, dispatcher.color)) setEditingDispatcher(null); }}>Salvează</Button>
                  ) : (
                    <Button size="icon" variant="outline" onClick={() => { setEditingDispatcher(dispatcher.name); setEditingName(dispatcher.name); }} aria-label={`Editează ${dispatcher.name}`}><Pencil className="h-4 w-4" /></Button>
                  )}
                  <Button size="icon" variant="destructive" onClick={() => deleteDispatcher(dispatcher.name)} aria-label={`Șterge ${dispatcher.name}`}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Integrare Google Sheets</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Pentru a integra cu Google Sheets, trebuie să creezi un Google Apps Script Web App.
            </p>
            <ol className="text-sm text-muted-foreground space-y-2 mb-4 list-decimal list-inside">
              <li>Deschide foaia ta Google Sheets</li>
              <li>Mergi la Extensions {'>'} Apps Script</li>
              <li>Copiază codul de mai jos și lipește-l în editor</li>
              <li>Deploy {'>'} New deployment {'>'} Web app</li>
              <li>Selectează "Execute as: Me" și "Who has access: Anyone"</li>
              <li>Copiază URL-ul Web app și lipește-l mai jos</li>
            </ol>
            
            <div className="bg-muted p-4 rounded text-xs font-mono mb-4 overflow-x-auto">
              <pre>{`function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var data = JSON.parse(e.postData.contents);
  
  if (data.type === 'transaction') {
    var transSheet = sheet.getSheetByName('Tranzactii') || sheet.insertSheet('Tranzactii');
    transSheet.appendRow([
      data.data.timestamp,
      data.data.dispatcher,
      data.data.type,
      data.data.amount,
      data.data.description
    ]);
  } else if (data.type === 'shift') {
    var shiftSheet = sheet.getSheetByName('Ture') || sheet.insertSheet('Ture');
    shiftSheet.appendRow([
      data.data.startTime,
      data.data.endTime || '',
      data.data.dispatcher,
      data.data.initialBalance,
      data.data.finalBalance
    ]);
  }
  
  return ContentService.createTextOutput(JSON.stringify({status: 'success'}));
}`}</pre>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">URL Google Apps Script</label>
            <Input
              type="url"
              placeholder="https://script.google.com/macros/s/..."
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
            />
          </div>

          <Button onClick={handleSave} className="w-full">
            Salvează
          </Button>
        </div>
      </Card>
    </div>
  );
};
