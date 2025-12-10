import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/lib/supabase';
import FixedClassModal from '@/components/FixedClassModal';
import { formatTime } from '@/utils/formatTime';
import BloqueiosSection from '@/components/BloqueiosSection';
import { ModalGerarAulasFixas } from '@/components/ModalGerarAulasFixas';
import { RegrasDuracaoSection } from '@/components/RegrasDuracaoSection';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

  const [aulas, setAulas] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const [openGerar, setOpenGerar] = useState(false);

  useEffect(() => {
    fetchPermissions();
    fetchEscala();
    fetchAulas();
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

  const handleDeleteAula = async (id) => {
    if (!id) {
      alert('Erro: nenhuma aula selecionada.');
      return;
    }

    const confirmar = confirm('Tem certeza que deseja excluir esta aula fixa?');
    if (!confirmar) return;

    const { error } = await supabase.from('aulas_fixas').delete().eq('id', id);

    if (error) {
      console.error('Erro ao excluir aula fixa:', error);
      alert('Erro ao excluir aula.');
      return;
    }
    fetchAulas();
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

  const fetchAulas = async () => {
    const { data } = await supabase
      .from('aulas_fixas')
      .select('*')
      .order('dia_semana');
    setAulas(data || []);
  };

  return (
    <div className='min-h-screen bg-white dark:bg-neutral-950'>
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
                <CardHeader className='border-b text-base'>
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
                  <CardTitle className='text-base'>
                    Editar escala dos técnicos
                  </CardTitle>
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
                      <div
                        className='flex justify-between items-center py-2 border-b'
                        key={item.id}
                      >
                        <div>
                          <p className='font-medium'>{item.tecnico_nome}</p>
                          <p className='text-sm text-gray-500'>
                            {item.dia_semana} - {formatTime(item.hora_inicio)}{' '}
                            às {formatTime(item.hora_fim)} - {item.estudio}
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
                  <Card className='w-full max-w-md p-0'>
                    <CardHeader>
                      <CardTitle className='text-xl font-semibold mt-3'>
                        {editItem ? 'Editar Escala' : 'Nova Escala'}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className='space-y-4'>
                      <Input
                        placeholder='Nome do técnico'
                        value={form.tecnico_nome}
                        onChange={(e) =>
                          setForm({ ...form, tecnico_nome: e.target.value })
                        }
                      />

                      <Input
                        placeholder='Dia da semana'
                        value={form.dia_semana}
                        onChange={(e) =>
                          setForm({ ...form, dia_semana: e.target.value })
                        }
                      />

                      <div className='flex gap-2'>
                        <Input
                          type='time'
                          value={form.hora_inicio}
                          onChange={(e) =>
                            setForm({ ...form, hora_inicio: e.target.value })
                          }
                        />

                        <Input
                          type='time'
                          value={form.hora_fim}
                          onChange={(e) =>
                            setForm({ ...form, hora_fim: e.target.value })
                          }
                        />
                      </div>

                      <Select
                        value={form.estudio}
                        onValueChange={(value) =>
                          setForm({ ...form, estudio: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Selecione o estúdio' />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value='Estudio 170'>
                            Estudio 170
                          </SelectItem>
                          <SelectItem value='Estudio 120'>
                            Estudio 120
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </CardContent>

                    <CardFooter className='flex justify-end gap-2 mb-4'>
                      <Button variant='outline' onClick={handleCancel}>
                        Cancelar
                      </Button>

                      <Button onClick={handleSave}>
                        {editItem ? 'Salvar alterações' : 'Adicionar'}
                      </Button>
                    </CardFooter>
                  </Card>
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
                <CardHeader className='flex justify-between items-center py-2 border-b'>
                  <CardTitle className='text-base'>
                    Gerenciar aulas fixas semanais
                  </CardTitle>
                  <div className='flex items-center gap-2'>
                    <Button size='sm' onClick={() => setOpenGerar(true)}>
                      Gerar Aulas Fixas
                    </Button>

                    <Button
                      size='sm'
                      onClick={() => {
                        setEditData(null);
                        setModalOpen(true);
                      }}
                    >
                      + Adicionar
                    </Button>
                  </div>

                  <ModalGerarAulasFixas
                    open={openGerar}
                    onClose={() => setOpenGerar(false)}
                  />
                </CardHeader>
                <CardContent className='space-y-3'>
                  {aulas.map((aula) => (
                    <div
                      key={aula.id}
                      className='flex justify-between items-center py-2 border-b'
                    >
                      <div>
                        <p className='font-medium'>
                          {aula.materia} — {aula.proposta}
                        </p>
                        <p className='text-sm text-gray-500'>
                          Tipo: {aula.tipo} | {aula.dia_semana} —{' '}
                          {formatTime(aula.hora_inicio)} às{' '}
                          {formatTime(aula.hora_fim)}
                        </p>
                        <p className='text-sm text-gray-500'>
                          Prof: {aula.professor} | Tec: {aula.tecnico} |{' '}
                          {aula.estudio}
                        </p>
                      </div>
                      <div className='flex gap-2'>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() => {
                            setEditData(aula);
                            setModalOpen(true);
                          }}
                        >
                          Editar
                        </Button>
                        <Button
                          variant='destructive'
                          onClick={() => handleDeleteAula(aula.id)}
                          size='sm'
                        >
                          Excluir
                        </Button>
                      </div>
                    </div>
                  ))}

                  <FixedClassModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onSaved={fetchAulas}
                    editData={editData}
                  />
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value='bloqueios'>
            <AccordionTrigger className='text-lg font-semibold'>
              Bloqueio de Estúdios
            </AccordionTrigger>

            <AccordionContent>
              <BloqueiosSection />
            </AccordionContent>
          </AccordionItem>

          <RegrasDuracaoSection />
        </Accordion>
      </div>
    </div>
  );
};

export default ManagementPage;
