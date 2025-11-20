import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Users, Phone, Edit, Trash2, Upload, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSoferiPelicanulAst, SoferPelicanulAst } from '@/hooks/useSoferiPelicanulAst';
import { useSoferiPelicanul, SoferPelicanul } from '@/hooks/useSoferiPelicanul';
import { useAdmin } from '@/hooks/useAdmin';
import SoferPelicanulAstForm from './SoferPelicanulAstForm';
import SoferPelicanulForm from './SoferPelicanulForm';
import { GoogleSheetsImportDialog } from './GoogleSheetsImportDialog';
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
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [editingSoferAst, setEditingSoferAst] = useState<SoferPelicanulAst | null>(null);
  const [editingSofer, setEditingSofer] = useState<SoferPelicanul | null>(null);
  const [deletingSoferId, setDeletingSoferId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { soferi: soferiAst, isLoading: isLoadingAst, addSofer: addSoferAst, updateSofer: updateSoferAst, deleteSofer: deleteSoferAst } = useSoferiPelicanulAst();
  const { soferi, isLoading, addSofer, updateSofer, deleteSofer } = useSoferiPelicanul();
  const { isAdmin } = useAdmin();

  const handlePhoneCall = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  if (activeSection === 'pelicanul') {
    return (
      <div>
        {showForm ? (
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-center">
              {editingSofer ? 'EDITEAZĂ ȘOFER' : 'ADAUGĂ ȘOFER NOU'}
            </h2>
            <SoferPelicanulForm
              sofer={editingSofer || undefined}
              onSubmit={(soferData) => {
                if (editingSofer) {
                  updateSofer.mutate(
                    { id: editingSofer.id, ...soferData } as SoferPelicanul,
                    {
                      onSuccess: () => {
                        setShowForm(false);
                        setEditingSofer(null);
                      },
                    }
                  );
                } else {
                  addSofer.mutate(soferData, {
                    onSuccess: () => {
                      setShowForm(false);
                    },
                  });
                }
              }}
              onCancel={() => {
                setShowForm(false);
                setEditingSofer(null);
              }}
            />
          </Card>
        ) : (
          <Card className="p-4 md:p-6">
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
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowImportDialog(true)}
                  className="w-full sm:w-auto text-sm"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">IMPORTĂ FOAIE DE CALCUL</span>
                  <span className="sm:hidden">IMPORTĂ</span>
                </Button>
                <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto text-sm">
                  ADAUGĂ ȘOFER
                </Button>
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

                    {isAdmin && (
                      <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingSofer(sofer);
                            setShowForm(true);
                          }}
                          className="w-full sm:w-auto"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editează
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeletingSoferId(sofer.id)}
                          className="w-full sm:w-auto"
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
        )}

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
              <AlertDialogAction onClick={() => {
                if (deletingSoferId) {
                  deleteSofer.mutate(deletingSoferId, {
                    onSuccess: () => {
                      setDeletingSoferId(null);
                    },
                  });
                }
              }}>Șterge</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <GoogleSheetsImportDialog
          open={showImportDialog}
          onOpenChange={setShowImportDialog}
          tableName="soferi_pelicanul"
          onSuccess={() => {
            // Data will refresh automatically via queryClient.invalidateQueries
          }}
        />
      </div>
    );
  }


  if (activeSection === 'pelicanul-ast') {
    return (
      <div>
        {showForm ? (
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-center">
              {editingSoferAst ? 'EDITEAZĂ ȘOFER' : 'ADAUGĂ ȘOFER NOU'}
            </h2>
            <SoferPelicanulAstForm
              sofer={editingSoferAst || undefined}
              onSubmit={(soferData) => {
                if (editingSoferAst) {
                  updateSoferAst.mutate(
                    { id: editingSoferAst.id, ...soferData } as SoferPelicanulAst,
                    {
                      onSuccess: () => {
                        setShowForm(false);
                        setEditingSoferAst(null);
                      },
                    }
                  );
                } else {
                  addSoferAst.mutate(soferData, {
                    onSuccess: () => {
                      setShowForm(false);
                    },
                  });
                }
              }}
              onCancel={() => {
                setShowForm(false);
                setEditingSoferAst(null);
              }}
            />
          </Card>
        ) : (
          <Card className="p-4 md:p-6">
            <div className="mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">ȘOFERI PELICANUL AST</h2>
              
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
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowImportDialog(true)}
                  className="w-full sm:w-auto text-sm"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">IMPORTĂ FOAIE DE CALCUL</span>
                  <span className="sm:hidden">IMPORTĂ</span>
                </Button>
                <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto text-sm">
                  ADAUGĂ ȘOFER
                </Button>
              </div>
            </div>

            {isLoadingAst ? (
              <div className="text-center py-8">Se încarcă...</div>
            ) : soferiAst && soferiAst.length > 0 ? (
              <div className="space-y-4">
                {soferiAst
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
                      <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingSoferAst(sofer);
                            setShowForm(true);
                          }}
                          className="w-full sm:w-auto"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editează
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeletingSoferId(sofer.id)}
                          className="w-full sm:w-auto"
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
        )}

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
              <AlertDialogAction onClick={() => {
                if (deletingSoferId) {
                  deleteSoferAst.mutate(deletingSoferId, {
                    onSuccess: () => {
                      setDeletingSoferId(null);
                    },
                  });
                }
              }}>Șterge</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <GoogleSheetsImportDialog
          open={showImportDialog}
          onOpenChange={setShowImportDialog}
          tableName="soferi_pelicanul_ast"
          onSuccess={() => {
            // Data will refresh automatically via queryClient.invalidateQueries
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 md:gap-4 max-w-2xl mx-auto">
      {activeSection && (
        <Button
          onClick={() => {
            setActiveSection(null);
            setShowForm(false);
            setEditingSofer(null);
            setEditingSoferAst(null);
            setSearchQuery('');
          }}
          className="mb-4 bg-red-600 hover:bg-red-700 text-white border-2 border-black w-full sm:w-auto"
        >
          ← Înapoi
        </Button>
      )}
      <Card
        className="bg-amber-600 hover:bg-amber-700 border-2 border-black cursor-pointer transition-all duration-200 active:scale-95"
        onClick={() => setActiveSection('pelicanul')}
      >
        <div className="flex items-center justify-center gap-2 md:gap-3 py-6 md:py-8 px-4 md:px-6">
          <Users className="h-5 w-5 md:h-6 md:w-6 text-white flex-shrink-0" />
          <span className="text-white font-bold text-base md:text-lg tracking-wide">
            ȘOFERI PELICANUL
          </span>
        </div>
      </Card>

      <Card
        className="bg-blue-600 hover:bg-blue-700 border-2 border-black cursor-pointer transition-all duration-200 active:scale-95"
        onClick={() => setActiveSection('pelicanul-ast')}
      >
        <div className="flex items-center justify-center gap-2 md:gap-3 py-6 md:py-8 px-4 md:px-6">
          <Users className="h-5 w-5 md:h-6 md:w-6 text-white flex-shrink-0" />
          <span className="text-white font-bold text-base md:text-lg tracking-wide">
            ȘOFERI PELICANUL AST
          </span>
        </div>
      </Card>
    </div>
  );
};

export default BazaDeDate;
