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

  //escala
  const [escala, setEscala] = useState([]);
  const [loadingEscala, setLoadingEscala] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({
    tecnico_nome: '',
    estudio: '',
    dia_semana: '',
    hora_inicio: '',
    hora_fim: '',
  });

  useEffect(() => {
    fetchPermissions();
    fetchEscala();
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

    // Faz o merge entre permissões e nomes
    const merged = permissionsData.map((perm) => ({
      ...perm,
      displayName: perm.nome || 'usuario sem nome',
    }));

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

  const fetchEscala = async () => {
    const { data, error } = await supabase
      .from('escala_tecnicos')
      .select('*')
      .order('dia_semana', { ascending: true });

    if (error) console.error('Erro ao buscar escala:', error);
    else setEscala(data || []);
    setLoadingEscala(false);
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setForm(item);
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('tem certeza que deseja excluir escala?')) return;

    const { error } = await supabase
      .from('escala_tecnicos')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('Erro ao excluir escala:', error);
    } else {
      setEscala((prev) => prev.filter((e) => e.id !== id));
    }
  };

  const handleCancel = () => {
    setShowAddModal(false);
    setEditItem(null);
    setForm({
      tecnico_nome: '',
      estudio: '',
      dia_semana: '',
      hora_inicio: '',
      hora_fim: '',
    });
  };

  const handleSave = async () => {
    const { tecnico_nome, estudio, dia_semana, hora_inicio, hora_fim } = form;
    if (!tecnico_nome || !estudio || !dia_semana || !hora_inicio || !hora_fim)
      return alert('Preencha todos os campos.');

    if (editItem) {
      const { error } = await supabase
        .from('escala_tecnicos')
        .update(form)
        .eq('id', editItem.id);
      if (error) console.error('Erro ao atualizar:', error);
    } else {
      const { error } = await supabase.from('escala_tecnicos').insert([form]);
      if (error) console.error('Erro ao inserir:', error);
    }

    setShowAddModal(false);
    setEditItem(null);
    fetchEscala();
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
                <CardHeader className='border-b'>
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
                        className='flex justify-between items-center py-2 border-b'
                      >
                        <div>
                          <p className='font-medium'>{user.displayName}</p>
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
                                className='data-[state=checked]:bg-green-500'
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
                                className='data-[state=checked]:bg-green-500'
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
                <CardHeader className='flex justify-between items-center py-2 border-b'>
                  <CardTitle>Editar escala dos técnicos</CardTitle>
                  <Button size='sm' onClick={() => setShowAddModal(true)}>
                    + Adicionar
                  </Button>
                </CardHeader>
                <CardContent className='space-y-3'>
                  {loadingEscala ? (
                    <p>Carregando escala...</p>
                  ) : escala.length === 0 ? (
                    <p>Nenhuma escala cadastrada.</p>
                  ) : (
                    escala.map((item) => (
                      <div className='flex justify-between items-center py-2 border-b'>
                        <div>
                          <p className='font-medium'>{item.tecnico_nome}</p>
                          <p className='text-sm text-gray-500'>
                            {item.dia_semana} - {item.hora_inicio} às{' '}
                            {item.hora_fim} - {item.estudio}
                          </p>
                        </div>
                        <div className='flex gap-2'>
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() => handleEdit(item)}
                          >
                            Editar
                          </Button>
                          <Button
                            size='sm'
                            variant='destructive'
                            onClick={() => handleDelete(item.id)}
                          >
                            Excluir
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Modal de adicionar/editar escala */}
              {showAddModal && (
                <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50'>
                  <div className='bg-white dark:bg-neutral-900 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl'>
                    <h2 className='text-xl font-semibold mb-2'>
                      {editItem ? 'Editar Escala' : 'Nova Escala'}
                    </h2>
                    <div className='space-y-3'>
                      <input
                        type='text'
                        className='w-full p-2 rounded border bg-transparent'
                        placeholder='Nome do técnico'
                        value={form.tecnico_nome}
                        onChange={(e) =>
                          setForm({ ...form, tecnico_nome: e.target.value })
                        }
                      />
                      <input
                        type='text'
                        className='w-full p-2 rounded border bg-transparent'
                        placeholder='Dia da semana'
                        value={form.dia_semana}
                        onChange={(e) =>
                          setForm({ ...form, dia_semana: e.target.value })
                        }
                      />
                      <div className='flex gap-2'>
                        <input
                          type='time'
                          className='w-full p-2 rounded border bg-transparent'
                          value={form.hora_inicio}
                          onChange={(e) =>
                            setForm({ ...form, hora_inicio: e.target.value })
                          }
                        />
                        <input
                          type='time'
                          className='w-full p-2 rounded border bg-transparent'
                          value={form.hora_fim}
                          onChange={(e) =>
                            setForm({ ...form, hora_fim: e.target.value })
                          }
                        />
                      </div>
                      <select
                        className='w-full p-2 rounded border bg-transparent'
                        value={form.estudio}
                        onChange={(e) =>
                          setForm({ ...form, estudio: e.target.value })
                        }
                      >
                        <option value=''>Selecione o estúdio</option>
                        <option value='Estúdio 170'>Estudio 170</option>
                        <option value='Estúdio 120'>Estudio 120</option>
                      </select>
                    </div>

                    <div className='flex justify-end gap-2 mt-4'>
                      <Button variant='outline' onClick={handleCancel}>
                        Cancelar
                      </Button>
                      <Button onClick={handleSave}>
                        {editItem ? 'Salvar alterações' : 'Adicionar'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* seção aulas padrão */}
          <AccordionItem value='aulas'>
            <AccordionTrigger className='text-lg font-semibold'>
              Aulas Padrões Semanais
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardHeader className='border-b'>
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
