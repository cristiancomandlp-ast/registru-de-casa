import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SoferPelicanul } from '@/hooks/useSoferiPelicanul';

interface SoferPelicanulFormProps {
  sofer?: SoferPelicanul;
  onSubmit: (sofer: Omit<SoferPelicanul, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}

const SoferPelicanulForm = ({ sofer, onSubmit, onCancel }: SoferPelicanulFormProps) => {
  const [formData, setFormData] = useState({
    indicativ_alocat: sofer?.indicativ_alocat || '',
    numar_auto: sofer?.numar_auto || '',
    status: sofer?.status || '',
    denumire_societate: sofer?.denumire_societate || '',
    administrator: sofer?.administrator || '',
    telefon_administrator: sofer?.telefon_administrator || '',
    nume_sofer: sofer?.nume_sofer || '',
    telefon_sofer: sofer?.telefon_sofer || '',
    numar_contract: sofer?.numar_contract || '',
    data_contract: sofer?.data_contract || '',
    cui: sofer?.cui || '',
    nr_inreg_onrc: sofer?.nr_inreg_onrc || '',
    sediu_societate: sofer?.sediu_societate || '',
    localitate: sofer?.localitate || '',
    aut_taxi: sofer?.aut_taxi || '',
    aut_transp: sofer?.aut_transp || '',
    marca_auto: sofer?.marca_auto || '',
    serie_sasiu: sofer?.serie_sasiu || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="indicativ_alocat">Indicativ *</Label>
          <Input
            id="indicativ_alocat"
            value={formData.indicativ_alocat}
            onChange={(e) => handleChange('indicativ_alocat', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="numar_auto">Număr Înmatriculare *</Label>
          <Input
            id="numar_auto"
            value={formData.numar_auto}
            onChange={(e) => handleChange('numar_auto', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Input
            id="status"
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="denumire_societate">Firmă *</Label>
          <Input
            id="denumire_societate"
            value={formData.denumire_societate}
            onChange={(e) => handleChange('denumire_societate', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="administrator">Administrator *</Label>
          <Input
            id="administrator"
            value={formData.administrator}
            onChange={(e) => handleChange('administrator', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="telefon_administrator">Telefon Administrator *</Label>
          <Input
            id="telefon_administrator"
            value={formData.telefon_administrator}
            onChange={(e) => handleChange('telefon_administrator', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="nume_sofer">Nume Șofer *</Label>
          <Input
            id="nume_sofer"
            value={formData.nume_sofer}
            onChange={(e) => handleChange('nume_sofer', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="telefon_sofer">Telefon Șofer *</Label>
          <Input
            id="telefon_sofer"
            value={formData.telefon_sofer}
            onChange={(e) => handleChange('telefon_sofer', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="mt-6 pt-4 border-t">
        <h3 className="text-sm font-semibold mb-4">Informații Suplimentare (Opțional)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="numar_contract">Număr Contract</Label>
            <Input
              id="numar_contract"
              value={formData.numar_contract}
              onChange={(e) => handleChange('numar_contract', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="data_contract">Data Contract</Label>
            <Input
              id="data_contract"
              type="date"
              value={formData.data_contract}
              onChange={(e) => handleChange('data_contract', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="cui">CUI</Label>
            <Input
              id="cui"
              value={formData.cui}
              onChange={(e) => handleChange('cui', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="nr_inreg_onrc">Nr. Înreg. ONRC</Label>
            <Input
              id="nr_inreg_onrc"
              value={formData.nr_inreg_onrc}
              onChange={(e) => handleChange('nr_inreg_onrc', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="sediu_societate">Sediu Societate</Label>
            <Input
              id="sediu_societate"
              value={formData.sediu_societate}
              onChange={(e) => handleChange('sediu_societate', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="localitate">Localitate</Label>
            <Input
              id="localitate"
              value={formData.localitate}
              onChange={(e) => handleChange('localitate', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="aut_taxi">Aut. Taxi</Label>
            <Input
              id="aut_taxi"
              value={formData.aut_taxi}
              onChange={(e) => handleChange('aut_taxi', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="aut_transp">Aut. Transport</Label>
            <Input
              id="aut_transp"
              value={formData.aut_transp}
              onChange={(e) => handleChange('aut_transp', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="marca_auto">Marcă Auto</Label>
            <Input
              id="marca_auto"
              value={formData.marca_auto}
              onChange={(e) => handleChange('marca_auto', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="serie_sasiu">Serie Șasiu</Label>
            <Input
              id="serie_sasiu"
              value={formData.serie_sasiu}
              onChange={(e) => handleChange('serie_sasiu', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Anulează
        </Button>
        <Button type="submit">
          Salvează
        </Button>
      </div>
    </form>
  );
};

export default SoferPelicanulForm;
