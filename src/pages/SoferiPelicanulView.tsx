import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Phone, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSoferiPelicanul } from '@/hooks/useSoferiPelicanul';

const SoferiPelicanulView = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { soferi, isLoading } = useSoferiPelicanul();

  const handlePhoneCall = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <Card className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">ȘOFERI PELICANUL</h2>
          
          {/* Search Bar */}
          <div className="relative mb-3 md:mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Caută după indicativ, nume, telefon..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Se încarcă...</div>
        ) : soferi && soferi.length > 0 ? (
          <div className="space-y-4">
            {soferi
              .filter((sofer) => {
                const query = searchQuery.toLowerCase();
                return (
                  sofer.indicativ_alocat.toLowerCase().includes(query) ||
                  sofer.nume_sofer.toLowerCase().includes(query) ||
                  sofer.telefon_sofer.includes(query) ||
                  sofer.numar_auto.toLowerCase().includes(query) ||
                  sofer.denumire_societate.toLowerCase().includes(query)
                );
              })
              .map((sofer) => (
              <Card key={sofer.id} className="p-3 md:p-4">
                {/* Primul rând: Indicativ, Număr Înmatriculare, Status */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-4 mb-3">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Indicativ</p>
                    <p className="font-medium">{sofer.indicativ_alocat}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Număr Înmatriculare</p>
                    <p className="font-medium">{sofer.numar_auto}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Status</p>
                    <p className={`font-medium ${sofer.status === 'ACTIV' ? 'text-green-600' : 'text-red-600'}`}>
                      {sofer.status || 'ACTIV'}
                    </p>
                  </div>
                </div>

                {/* Al doilea rând: Denumire Societate, Administrator, Telefon Administrator */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-4 mb-3">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Denumire Societate</p>
                    <p className="font-medium">{sofer.denumire_societate}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Administrator</p>
                    <p className="font-medium">{sofer.administrator}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Telefon Administrator</p>
                    <Button
                      variant="link"
                      className="p-0 h-auto font-medium"
                      onClick={() => handlePhoneCall(sofer.telefon_administrator)}
                    >
                      <Phone className="h-4 w-4 mr-1" />
                      {sofer.telefon_administrator}
                    </Button>
                  </div>
                </div>

                {/* Al treilea rând: Nume Șofer, Telefon Șofer */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Nume Șofer</p>
                    <p className="font-medium">{sofer.nume_sofer}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Telefon Șofer</p>
                    <Button
                      variant="link"
                      className="p-0 h-auto font-medium"
                      onClick={() => handlePhoneCall(sofer.telefon_sofer)}
                    >
                      <Phone className="h-4 w-4 mr-1" />
                      {sofer.telefon_sofer}
                    </Button>
                  </div>
                </div>
                
                {sofer.detalii && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-semibold text-muted-foreground">Detalii</p>
                    <p className="font-medium whitespace-pre-wrap">{sofer.detalii}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Nu există șoferi adăugați.
          </div>
        )}
      </Card>
    </div>
  );
};

export default SoferiPelicanulView;
