import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export const Settings = () => {
  const [sheetUrl, setSheetUrl] = useState("");
  const { toast } = useToast();

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
      <h2 className="text-2xl font-bold">Setări</h2>

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
