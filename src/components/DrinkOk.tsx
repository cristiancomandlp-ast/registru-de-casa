import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const DrinkOk = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    data_ora: new Date().toISOString().slice(0, 16),
    nume_client: '',
    telefon_client: '',
    adresa_preluare: '',
    adresa_destinatie: '',
    marca_auto: '',
    indicativ: '',
    timp_estimat: '',
  });
  const [status, setStatus] = useState<'acceptat' | 'refuzat' | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!status) {
      toast({
        title: "Eroare",
        description: "Selectează statusul comenzii",
        variant: "destructive",
      });
      return;
    }

    if (!formData.data_ora || !formData.nume_client || !formData.telefon_client || !formData.adresa_preluare || 
        !formData.adresa_destinatie || !formData.marca_auto || !formData.indicativ || !formData.timp_estimat) {
      toast({
        title: "Eroare",
        description: "Completează toate câmpurile",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('drink_orders')
        .insert([{
          nume_client: formData.nume_client,
          telefon_client: formData.telefon_client,
          adresa_preluare: formData.adresa_preluare,
          adresa_destinatie: formData.adresa_destinatie,
          marca_auto: formData.marca_auto,
          indicativ: formData.indicativ,
          timp_estimat: formData.timp_estimat,
          status,
          data_ora: new Date(formData.data_ora).toISOString(),
        }]);

      if (error) throw error;

      toast({
        title: "Succes",
        description: "Comanda a fost salvată",
      });

      // Reset form
      setFormData({
        data_ora: new Date().toISOString().slice(0, 16),
        nume_client: '',
        telefon_client: '',
        adresa_preluare: '',
        adresa_destinatie: '',
        marca_auto: '',
        indicativ: '',
        timp_estimat: '',
      });
      setStatus(null);
    } catch (error) {
      console.error('Error saving order:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut salva comanda",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="data_ora">Data și Ora</Label>
            <Input
              id="data_ora"
              type="datetime-local"
              value={formData.data_ora}
              onChange={(e) => handleInputChange('data_ora', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="nume_client">Nume Client</Label>
            <Input
              id="nume_client"
              value={formData.nume_client}
              onChange={(e) => handleInputChange('nume_client', e.target.value)}
              placeholder="Introduceți numele clientului"
            />
          </div>

          <div>
            <Label htmlFor="telefon_client">Telefon Client</Label>
            <Input
              id="telefon_client"
              value={formData.telefon_client}
              onChange={(e) => handleInputChange('telefon_client', e.target.value)}
              placeholder="Introduceți telefonul"
            />
          </div>

          <div>
            <Label htmlFor="adresa_preluare">Adresă Preluare</Label>
            <Input
              id="adresa_preluare"
              value={formData.adresa_preluare}
              onChange={(e) => handleInputChange('adresa_preluare', e.target.value)}
              placeholder="Introduceți adresa de preluare"
            />
          </div>

          <div>
            <Label htmlFor="adresa_destinatie">Adresă Destinație</Label>
            <Input
              id="adresa_destinatie"
              value={formData.adresa_destinatie}
              onChange={(e) => handleInputChange('adresa_destinatie', e.target.value)}
              placeholder="Introduceți adresa de destinație"
            />
          </div>

          <div>
            <Label htmlFor="marca_auto">Marcă Auto</Label>
            <Input
              id="marca_auto"
              value={formData.marca_auto}
              onChange={(e) => handleInputChange('marca_auto', e.target.value)}
              placeholder="Introduceți marca auto"
            />
          </div>

          <div>
            <Label htmlFor="indicativ">Indicativ</Label>
            <Input
              id="indicativ"
              value={formData.indicativ}
              onChange={(e) => handleInputChange('indicativ', e.target.value)}
              placeholder="Introduceți indicativul"
            />
          </div>

          <div>
            <Label htmlFor="timp_estimat">Timp Estimat</Label>
            <Input
              id="timp_estimat"
              value={formData.timp_estimat}
              onChange={(e) => handleInputChange('timp_estimat', e.target.value)}
              placeholder="Ex: 15 minute"
            />
          </div>
        </div>

        <div className="mt-6">
          <Label className="mb-2 block">Status Comandă</Label>
          <div className="flex gap-4">
            <Button
              type="button"
              variant={status === 'acceptat' ? 'default' : 'outline'}
              onClick={() => setStatus('acceptat')}
              className="flex-1"
            >
              ACCEPTAT
            </Button>
            <Button
              type="button"
              variant={status === 'refuzat' ? 'destructive' : 'outline'}
              onClick={() => setStatus('refuzat')}
              className="flex-1"
            >
              REFUZAT
            </Button>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full mt-6"
        >
          {isLoading ? 'Se salvează...' : 'Salvează Comandă'}
        </Button>
      </Card>
    </div>
  );
};