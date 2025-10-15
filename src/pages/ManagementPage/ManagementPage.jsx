import { useEffect, useState } from 'react';
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
import { supabase } from '@/lib/supabase';

const ManagementPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const onToggleSidebar = () => setIsSidebarOpen(true);
  const onCloseSidebar = () => setIsSidebarOpen(false);

  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    const { data: permissionsData, error: permError } = await supabase
      .from('permissoes_usuarios')
      .select('*');

    if (permError) {
      console.error('Erro ao buscar permissões:', permError);
      setLoading(false);
      return;
    }

    if (!permissionsData || permissionsData.length === 0) {
      setPermissions([]);
      setLoading(false);
      return;
    }

    //Busca os nomes dos usuários pelo auth.users (join manual)
    const userIds = permissionsData.map((p) => p.user_id);
    const { data: usersData, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .in('id', userIds);

    if (userError) {
      console.error('Erro ao buscar emails de usuários:', userError);
    }

    // Faz o merge entre permissões e nomes
    const merged = permissionsData.map((perm) => {
      const user = usersData?.find((u) => u.id === perm.user_id);
      return { ...perm, email: user ? user.email : 'usuario desconhecido' };
    });

    setPermissions(merged);
    setLoading(false);
  };

  const handlePermissionChange = async (userId, field, value) => {
    //Atualiza visualmente
    setPermissions((prev) =>
      prev.map((p) => (p.user_id === userId ? { ...p, [field]: value } : p))
    );

    //Atualiza no banco
    const { error } = await supabase
      .from('permissoes_usuarios')
      .update({ [field]: value })
      .eq('user_id', userId);

    if (error) {
      console.error(error);
      //reverte visualmente caso falhe
      setPermissions((prev) =>
        prev.map((p) => (p.user_id === userId ? { ...p, [field]: !value } : p))
      );
    }
  };

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
                  {loading ? (
                    <p>carregando permissões...</p>
                  ) : permissions.length === 0 ? (
                    <p>Nenhum usuário encontrado.</p>
                  ) : (
                    permissions.map((user) => (
                      <div
                        key={user.user_id}
                        className='flex justify-between items-center py-2 border-b'>
                        <div>
                          <p className='font-medium'>{user.email}</p>
                          <div className='flex gap-4 text-sm text-gray-500 mt-1'>
                            <div className='flex items-center gap-2'>
                              <Switch
                                checked={user.pode_editar}
                                onCheckedChange={(val) =>
                                  handlePermissionChange(
                                    user.user_id,
                                    'pode_editar',
                                    val
                                  )
                                }
                              />
                              <span>Pode Editar</span>
                            </div>
                            <div className='flex items-center gap-2'>
                              <Switch
                                checked={user.pode_cancelar}
                                onCheckedChange={(val) =>
                                  handlePermissionChange(
                                    user.user_id,
                                    'pode_cancelar',
                                    val
                                  )
                                }
                              />
                              <span>Pode cancelar</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
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
