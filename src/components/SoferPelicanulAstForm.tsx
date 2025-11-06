import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SoferPelicanulAst } from '@/hooks/useSoferiPelicanulAst';

type SoferPelicanulAstFormProps = {
  sofer?: SoferPelicanulAst;
  onSubmit: (sofer: Omit<SoferPelicanulAst, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
};

const SoferPelicanulAstForm = ({ sofer, onSubmit, onCancel }: SoferPelicanulAstFormProps) => {
  const [formData, setFormData] = useState({
    numar_contract: '',
    data_contract: '',
    indicativ_alocat: '',
    denumire_societate: '',
    cui: '',
    nr_inreg_onrc: '',
    sediu_societate: '',
    localitate: '',
    administrator: '',
    telefon_administrator: '',
    aut_taxi: '',
    aut_transp: '',
    marca_auto: '',
    numar_auto: '',
    serie_sasiu: '',
    nume_sofer: '',
    telefon_sofer: '',
  });

  useEffect(() => {
    if (sofer) {
      setFormData({
        numar_contract: sofer.numar_contract,
        data_contract: sofer.data_contract,
        indicativ_alocat: sofer.indicativ_alocat,
        denumire_societate: sofer.denumire_societate,
        cui: sofer.cui,
        nr_inreg_onrc: sofer.nr_inreg_onrc,
        sediu_societate: sofer.sediu_societate,
        localitate: sofer.localitate,
        administrator: sofer.administrator,
        telefon_administrator: sofer.telefon_administrator,
        aut_taxi: sofer.aut_taxi,
        aut_transp: sofer.aut_transp,
        marca_auto: sofer.marca_auto,
        numar_auto: sofer.numar_auto,
        serie_sasiu: sofer.serie_sasiu,
        nume_sofer: sofer.nume_sofer,
        telefon_sofer: sofer.telefon_sofer,
      });
    }
  }, [sofer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="numar_contract">NUMAR CONTRACT</Label>
          <Input
            id="numar_contract"
            type="text"
            value={formData.numar_contract}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="data_contract">DATA CONTRACT</Label>
          <Input
            id="data_contract"
            type="date"
            value={formData.data_contract}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="indicativ_alocat">INDICATIV ALOCAT</Label>
          <Input
            id="indicativ_alocat"
            type="text"
            value={formData.indicativ_alocat}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="denumire_societate">DENUMIRE SOCIETATE</Label>
          <Input
            id="denumire_societate"
            type="text"
            value={formData.denumire_societate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cui">CUI</Label>
          <Input
            id="cui"
            type="text"
            value={formData.cui}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nr_inreg_onrc">NR. INREG. ONRC</Label>
          <Input
            id="nr_inreg_onrc"
            type="text"
            value={formData.nr_inreg_onrc}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sediu_societate">SEDIU SOCIETATE</Label>
          <Input
            id="sediu_societate"
            type="text"
            value={formData.sediu_societate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="localitate">LOCALITATE</Label>
          <Input
            id="localitate"
            type="text"
            value={formData.localitate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="administrator">ADMINISTRATOR</Label>
          <Input
            id="administrator"
            type="text"
            value={formData.administrator}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefon_administrator">TELEFON ADMINISTRATOR</Label>
          <Input
            id="telefon_administrator"
            type="tel"
            value={formData.telefon_administrator}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="aut_taxi">AUT. TAXI</Label>
          <Input
            id="aut_taxi"
            type="text"
            value={formData.aut_taxi}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="aut_transp">AUT. TRANSP.</Label>
          <Input
            id="aut_transp"
            type="text"
            value={formData.aut_transp}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="marca_auto">MARCA AUTO</Label>
          <Input
            id="marca_auto"
            type="text"
            value={formData.marca_auto}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="numar_auto">NUMAR AUTO</Label>
          <Input
            id="numar_auto"
            type="text"
            value={formData.numar_auto}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="serie_sasiu">SERIE SASIU</Label>
          <Input
            id="serie_sasiu"
            type="text"
            value={formData.serie_sasiu}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nume_sofer">NUME SOFER</Label>
          <Input
            id="nume_sofer"
            type="text"
            value={formData.nume_sofer}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefon_sofer">TELEFON SOFER</Label>
          <Input
            id="telefon_sofer"
            type="tel"
            value={formData.telefon_sofer}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
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

export default SoferPelicanulAstForm;
