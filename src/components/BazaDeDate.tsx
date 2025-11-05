import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const BazaDeDate = () => {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">BAZĂ DE DATE</h2>
      
      <Tabs defaultValue="pelicanul" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="pelicanul" className="text-sm font-semibold">
            ȘOFERI PELICANUL
          </TabsTrigger>
          <TabsTrigger value="pelicanul-ast" className="text-sm font-semibold">
            ȘOFERI PELICANUL AST
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pelicanul">
          <div className="text-center py-8 text-gray-600">
            Secțiunea ȘOFERI PELICANUL - în curând
          </div>
        </TabsContent>

        <TabsContent value="pelicanul-ast">
          <div className="text-center py-8 text-gray-600">
            Secțiunea ȘOFERI PELICANUL AST - în curând
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default BazaDeDate;
