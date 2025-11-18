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
