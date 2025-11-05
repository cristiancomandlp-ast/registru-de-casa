import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
          <div className="text-center py-8 text-gray-600">
            Secțiunea ȘOFERI PELICANUL AST - în curând
          </div>
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
