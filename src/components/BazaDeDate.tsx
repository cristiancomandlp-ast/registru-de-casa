import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Users, Phone, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSoferiPelicanulAst, SoferPelicanulAst } from '@/hooks/useSoferiPelicanulAst';
import { useAdmin } from '@/hooks/useAdmin';
import SoferPelicanulAstForm from './SoferPelicanulAstForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const BazaDeDate = () => {
  const [activeSection, setActiveSection] = useState<'pelicanul' | 'pelicanul-ast' | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSofer, setEditingSofer] = useState<SoferPelicanulAst | null>(null);
  const [deletingSoferId, setDeletingSoferId] = useState<string | null>(null);
  const { soferi, isLoading, addSofer, updateSofer, deleteSofer } = useSoferiPelicanulAst();
  const { isAdmin } = useAdmin();

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

  const handleAddSofer = (soferData: Omit<SoferPelicanulAst, 'id' | 'created_at' | 'updated_at'>) => {
    addSofer.mutate(soferData, {
      onSuccess: () => {
        setShowForm(false);
      },
    });
  };

  const handleUpdateSofer = (soferData: Omit<SoferPelicanulAst, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingSofer) {
      updateSofer.mutate(
        { id: editingSofer.id, ...soferData },
        {
          onSuccess: () => {
            setShowForm(false);
            setEditingSofer(null);
          },
        }
      );
    }
  };

  const handleDeleteSofer = () => {
    if (deletingSoferId) {
      deleteSofer.mutate(deletingSoferId, {
        onSuccess: () => {
          setDeletingSoferId(null);
        },
      });
    }
  };

  const handlePhoneCall = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  if (activeSection === 'pelicanul-ast') {
    if (showForm) {
      return (
        <div>
          <Button
            variant="outline"
            onClick={() => {
              setShowForm(false);
              setEditingSofer(null);
            }}
            className="mb-4"
          >
            ← Înapoi
          </Button>
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-center">
              {editingSofer ? 'EDITEAZĂ ȘOFER' : 'ADAUGĂ ȘOFER NOU'}
            </h2>
            <SoferPelicanulAstForm
              sofer={editingSofer || undefined}
              onSubmit={editingSofer ? handleUpdateSofer : handleAddSofer}
              onCancel={() => {
                setShowForm(false);
                setEditingSofer(null);
              }}
            />
          </Card>
        </div>
      );
    }

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
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">ȘOFERI PELICANUL AST</h2>
            <Button onClick={() => setShowForm(true)}>
              ADAUGĂ ȘOFER
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Se încarcă...</div>
          ) : soferi && soferi.length > 0 ? (
            <div className="space-y-4">
              {soferi.map((sofer) => (
                <Card key={sofer.id} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">Indicativ</p>
                      <p className="font-medium">{sofer.indicativ_alocat}</p>
                    </div>
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
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">Denumire Societate</p>
                      <p className="font-medium">{sofer.denumire_societate}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">Marca Auto</p>
                      <p className="font-medium">{sofer.marca_auto}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">Număr Auto</p>
                      <p className="font-medium">{sofer.numar_auto}</p>
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
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">Localitate</p>
                      <p className="font-medium">{sofer.localitate}</p>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex gap-2 mt-4 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingSofer(sofer);
                          setShowForm(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editează
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeletingSoferId(sofer.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Șterge
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nu există șoferi adăugați. Apasă butonul "ADAUGĂ ȘOFER" pentru a adăuga primul șofer.
            </div>
          )}
        </Card>

        <AlertDialog open={!!deletingSoferId} onOpenChange={() => setDeletingSoferId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmare ștergere</AlertDialogTitle>
              <AlertDialogDescription>
                Sigur doriți să ștergeți acest șofer? Această acțiune nu poate fi anulată.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Anulează</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteSofer}>Șterge</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
