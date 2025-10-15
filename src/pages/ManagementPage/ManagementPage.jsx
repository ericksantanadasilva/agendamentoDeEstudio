import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

const ManagementPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const onToggleSidebar = () => setIsSidebarOpen(true);
  const onCloseSidebar = () => setIsSidebarOpen(false);

  return (
    <div>
      <Sidebar isOpen={isSidebarOpen} onClose={onCloseSidebar} />
      <div className='flex flex-col flex-1'>
        <Header onToggleSidebar={onToggleSidebar} />
      </div>

      <div className='p-6 space-y-4'>
        <h1 className='text-2xl font-bold mb-4'>Gerência</h1>

        <Accordion type='multiple' className='space-y-2'>
          {/* seçao permissões */}
          <AccordionItem value='permissoes'>
            <AccordionTrigger className='text-lg font-semibold'>
              Permissões de Edição e Cancelamento
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardHeader>
                  <CardTitle>Gerenciar permissões dos usúarios</CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div className='flex justify-between items-center py-2 border-b'>
                    <div>
                      <p className='font-medium'>Erick Sant'ana</p>
                      <div className='flex gap-4 text-sm text-gray-500 mt-1'>
                        <div className='flex items-center gap-2'>
                          <Switch checked={true} disabled />
                          <span>Pode Editar</span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Switch checked={false} disabled />
                          <span>Pode cancelar</span>
                        </div>
                      </div>
                    </div>
                    <Button size='sm' variant='outline'>
                      Alterar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          {/* seção escala */}
          <AccordionItem value='escala'>
            <AccordionTrigger className='text-lg font-semibold'>
              Escala de Funcionários
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardHeader>
                  <CardTitle>Editar escala dos técnicos</CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div className='flex justify-between items-center py-2 border-b'>
                    <div>
                      <p className='font-medium'>Erick Sant'Ana</p>
                      <p className='text-sm text-gray-500'>
                        Quarta - 14:00 às 18:00 - Estúdio 120
                      </p>
                    </div>
                    <Button size='sm' variant='outline'>
                      Editar
                    </Button>
                  </div>

                  <div className='flex justify-between items-center py-2 border-b'>
                    <div>
                      <p className='font-medium'>Julia</p>
                      <p className='text-sm text-gray-500'>
                        Segunda — 08:00 às 12:00 — Estúdio 170
                      </p>
                    </div>
                    <Button size='sm' variant='outline'>
                      Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          {/* seção aulas padrão */}
          <AccordionItem value='aulas'>
            <AccordionTrigger className='text-lg font-semibold'>
              Aulas Padrões Semanais
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardHeader>
                  <CardTitle>Gerenciar aulas fixas semanais</CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div className='flex justify-between items-center py-2 border-b'>
                    <div>
                      <p className='font-medium'>Português — Top 5 ENEM</p>
                      <p className='text-sm text-gray-500'>
                        Tipo: Gravação | Quarta — 14:00 às 15:00
                      </p>
                      <p className='text-sm text-gray-500'>
                        Prof: Ana Lima | Tec: Lara | Estúdio 170
                      </p>
                    </div>
                    <Button size='sm' variant='outline'>
                      Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default ManagementPage;
