import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const BazaDeDate = () => {
  const [activeSection, setActiveSection] = useState<'pelicanul' | 'pelicanul-ast' | null>(null);

  if (activeSection === 'pelicanul') {
    return (
      <div>
        <Button
          variant="outline"
          onClick={() => setActiveSection(null)}
          className="mb-4"
        >
          ← Înapoi
        </Button>
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-center">ȘOFERI PELICANUL</h2>
          <div className="text-center py-8 text-gray-600">
            Secțiunea ȘOFERI PELICANUL - în curând
          </div>
        </Card>
      </div>
    );
  }

  if (activeSection === 'pelicanul-ast') {
    return (
      <div>
        <Button
          variant="outline"
          onClick={() => setActiveSection(null)}
          className="mb-4"
        >
          ← Înapoi
        </Button>
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-center">ȘOFERI PELICANUL AST</h2>
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="numar-contract">NUMAR CONTRACT</Label>
                <Input id="numar-contract" type="text" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="data-contract">DATA CONTRACT</Label>
                <Input id="data-contract" type="date" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="indicativ">INDICATIV ALOCAT</Label>
                <Input id="indicativ" type="text" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="denumire-societate">DENUMIRE SOCIETATE</Label>
                <Input id="denumire-societate" type="text" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cui">CUI</Label>
                <Input id="cui" type="text" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nr-onrc">NR. INREG. ONRC</Label>
                <Input id="nr-onrc" type="text" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sediu">SEDIU SOCIETATE</Label>
                <Input id="sediu" type="text" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="localitate">LOCALITATE</Label>
                <Input id="localitate" type="text" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="administrator">ADMINISTRATOR</Label>
                <Input id="administrator" type="text" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telefon-admin">TELEFON ADMINISTRATOR</Label>
                <Input id="telefon-admin" type="tel" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="aut-taxi">AUT. TAXI</Label>
                <Input id="aut-taxi" type="text" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="aut-transp">AUT. TRANSP.</Label>
                <Input id="aut-transp" type="text" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="marca-auto">MARCA AUTO</Label>
                <Input id="marca-auto" type="text" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="numar-auto">NUMAR AUTO</Label>
                <Input id="numar-auto" type="text" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="serie-sasiu">SERIE SASIU</Label>
                <Input id="serie-sasiu" type="text" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nume-sofer">NUME SOFER</Label>
                <Input id="nume-sofer" type="text" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telefon-sofer">TELEFON SOFER</Label>
                <Input id="telefon-sofer" type="tel" />
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <Button type="submit">
                Salvează
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto">
      <Card
        className="bg-amber-600 hover:bg-amber-700 border-2 border-black cursor-pointer transition-all duration-200 active:scale-95"
        onClick={() => setActiveSection('pelicanul')}
      >
        <div className="flex items-center justify-center gap-3 py-8 px-6">
          <Users className="h-6 w-6 text-white" />
          <span className="text-white font-bold text-lg tracking-wide">
            ȘOFERI PELICANUL
          </span>
        </div>
      </Card>

      <Card
        className="bg-blue-600 hover:bg-blue-700 border-2 border-black cursor-pointer transition-all duration-200 active:scale-95"
        onClick={() => setActiveSection('pelicanul-ast')}
      >
        <div className="flex items-center justify-center gap-3 py-8 px-6">
          <Users className="h-6 w-6 text-white" />
          <span className="text-white font-bold text-lg tracking-wide">
            ȘOFERI PELICANUL AST
          </span>
        </div>
      </Card>
    </div>
  );
};

export default BazaDeDate;
