import { use, useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format, add, parseISO } from 'date-fns';
import { supabase } from '../lib/supabase';
import { registrarLog } from '@/utils/registrarLog';
import { buscarTecnicos } from '@/services/tecnicos';
import { ptBR } from 'date-fns/locale';
import { Label } from './ui/label';

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

export default function EventModal({ open, onClose, date, event, onSave }) {
  const isEdit = !!event;
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const [materiaList, setMateriaList] = useState([]);
  const [propostaList, setPropostaList] = useState([]);
  const [regrasDuracao, setRegrasDuracao] = useState([]);

  const [form, setForm] = useState({
    materia: '',
    proposta: '',
    professor: '',
    tecnico: '',
    startTime: '',
    endTime: '',
    studio: '',
    tipo: '',
    selectedDate: '',
  });

  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [tecnicosDisponiveis, setTecnicosDisponiveis] = useState([]);
  const [erroTecnico, setErroTecnico] = useState(null);
  const [debouncedStartTime, setDebouncedStartTime] = useState('');
  const [user, setUser] = useState(null);

  // Carrega regras e matérias
  useEffect(() => {
    if (open) fetchRegras();
  }, [open]);

  useEffect(() => {
    if (open) {
      if (event) {
        const data =
          event.date ||
          (event.extendedProps && event.extendedProps.date) ||
          null;

        let start, end;
        if (data) {
          const isStartFullDate =
            typeof event.start === 'string' && event.start.includes('T');
          const isEndFullDate =
            typeof event.end === 'string' && event.end.includes('T');

          if (isStartFullDate && isEndFullDate) {
            start = new Date(event.start);
            end = new Date(event.end);
          } else {
            start = new Date(`${data}T${event.start || event.startTime}`);
            end = new Date(`${data}T${event.end || event.endTime}`);
          }
        } else {
          start = new Date(event.start);
          end = new Date(event.end);
        }

        if (isNaN(start) || isNaN(end)) {
          console.error('Data inválida para o evento:', event);
          setError('Data ou horário inválido no evento.');
          return;
        }

        const props = event.extendedProps || event;
        setForm({
          materia: props.materia,
          proposta: props.gravacao,
          professor: props.professor || '',
          tecnico: props.tecnico || '',
          startTime: format(start, 'HH:mm'),
          endTime: format(end, 'HH:mm'),
          studio: props.studio,
          tipo: props.tipo,
          selectedDate: format(start, 'yyyy-MM-dd'),
        });
      } else {
        setForm({
          materia: '',
          proposta: '',
          professor: '',
          tecnico: '',
          startTime: '',
          endTime: '',
          studio: '',
          tipo: '',
          selectedDate: date ? date.split('T')[0] : '',
        });
      }
      setError('');
      setWarning('');
    }
  }, [open, event]);

  // Atualiza lista de propostas baseado na matéria
  useEffect(() => {
    const propostasFiltradas = regrasDuracao
      .filter((r) => r.materia === form.materia)
      .map((r) => r.proposta);
    setPropostaList([...new Set(propostasFiltradas)]);
  }, [form.materia, regrasDuracao]);

  useEffect(() => {
    if (debouncedStartTime && form.materia && form.proposta) {
      calcularHorarioFim(debouncedStartTime);
    }
  }, [form.proposta, form.materia, debouncedStartTime]);

  const fetchRegras = async () => {
    const { data, error } = await supabase.from('regras_duracao').select('*');
    if (error) return console.error('Erro ao carregar regras:', error);
    setRegrasDuracao(data);
    const materiasUnicas = [...new Set(data.map((r) => r.materia))];
    setMateriaList(materiasUnicas);
  };

  const calcularHorarioFim = (startTime) => {
    if (!form.materia || !form.proposta || !startTime) return;
    const regra = regrasDuracao.find(
      (r) => r.materia === form.materia && r.proposta === form.proposta
    );
    if (!regra) return;
    const inicio = new Date(`${date.split('T')[0]}T${form.startTime}`);
    const [durH, durM] = regra.duracao_em_horas.split(':');
    const fim = add(inicio, { hours: +durH, minutes: +durM });
    setForm((prev) => ({ ...prev, endTime: format(fim, 'HH:mm') }));
  };

  const checarTecnicos = async () => {
    try {
      if (!form.studio || !debouncedStartTime || !form.selectedDate) return;

      let horaFimParaBuscar = form.endTime;
      const regra = regrasDuracao.find(
        (r) => r.materia === form.materia && r.proposta === form.proposta
      );

      if (regra && debouncedStartTime) {
        const inicioDate = new Date(
          `${form.selectedDate}T${debouncedStartTime}`
        );
        const [durH, durM] = regra.duracao_em_horas.split(':').map(Number);
        const fimDate = add(inicioDate, { hours: durH, minutes: durM });
        horaFimParaBuscar = format(fimDate, 'HH:mm');
        if (form.endTime !== horaFimParaBuscar) {
          setForm((prev) => ({ ...prev, endTime: horaFimParaBuscar }));
        }
      } else {
        if (!form.endTime) return;
        horaFimParaBuscar = form.endTime;
      }

      const dataObj = parseISO(form.selectedDate);
      const diaSemana = format(dataObj, 'EEEE', { locale: ptBR });
      const diasMap = {
        domingo: 'Domingo',
        'segunda-feira': 'Segunda',
        'terça-feira': 'Terça',
        'quarta-feira': 'Quarta',
        'quinta-feira': 'Quinta',
        'sexta-feira': 'Sexta',
        sábado: 'Sábado',
      };
      const diaSemanaFormatado = diasMap[diaSemana.toLowerCase()] || diaSemana;

      const { erro, blocos, tecnicos } = await buscarTecnicos(
        form.studio,
        diaSemanaFormatado,
        debouncedStartTime,
        horaFimParaBuscar
      );

      if (erro) {
        setErroTecnico(erro);
        setForm((prev) => ({ ...prev, tecnico: '' }));
        setTecnicosDisponiveis([]);
        return;
      }

      if (!blocos || blocos.length === 0) {
        setErroTecnico('❌ Nenhum técnico disponível nesse horário.');
        setForm((prev) => ({ ...prev, tecnico: '' }));
        setTecnicosDisponiveis([]);
        return;
      }

      let nomesSelecionados =
        Array.isArray(tecnicos) && tecnicos.length > 0
          ? tecnicos
          : [...new Set(blocos.flatMap((b) => b.tecnicos))];

      setForm((prev) => ({ ...prev, tecnico: nomesSelecionados.join(', ') }));
      setTecnicosDisponiveis(blocos);
      setErroTecnico(null);
    } catch (err) {
      console.error('Erro em checarTecnicos:', err);
      setErroTecnico('Erro ao checar técnicos.');
    }
  };

  useEffect(() => {
    if (
      debouncedStartTime &&
      form.studio &&
      form.selectedDate &&
      form.materia &&
      form.proposta
    ) {
      checarTecnicos();
    } else {
      setForm((prev) => ({ ...prev, tecnico: '' }));
      setTecnicosDisponiveis([]);
      setErroTecnico(null);
    }
  }, [
    debouncedStartTime,
    form.selectedDate,
    form.studio,
    form.materia,
    form.proposta,
    regrasDuracao,
  ]);

  const handleChange = (field, value) => {
    setForm((prev) => {
      const updatedForm = { ...prev, [field]: value };
      const obrigatorios = [
        'materia',
        'proposta',
        'tipo',
        'professor',
        'startTime',
        'studio',
      ];
      const todosPreenchidos = obrigatorios.every(
        (f) => updatedForm[f]?.trim() !== ''
      );
      if (todosPreenchidos && warning) setWarning('');
      if (error) setError('');
      return updatedForm;
    });
  };

  useEffect(() => {
    const handler = setTimeout(
      () => setDebouncedStartTime(form.startTime),
      400
    );
    return () => clearTimeout(handler);
  }, [form.startTime]);

  const handleSave = async () => {
    setError('');
    setWarning('');
    if (!form.tecnico || erroTecnico) return;

    const obrigatorios = [
      'materia',
      'proposta',
      'tipo',
      'professor',
      'startTime',
      'studio',
    ];
    const faltando = obrigatorios.find((f) => !form[f]);
    if (faltando) {
      setWarning('⚠️ Preencha todos os campos.');
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    const userEmail = userData?.user?.email;
    const userId = userData?.user?.id;

    const { data: userAdmin } = await supabase
      .from('users')
      .select('is_admin')
      .eq('email', userEmail)
      .maybeSingle();
    const isAdmin = userAdmin?.is_admin === true;

    if (isEdit && !isAdmin) {
      const { data: oldData } = await supabase
        .from('agendamentos')
        .select('*')
        .eq('id', event.id)
        .single();
      const isOwner =
        String(oldData?.user_id || '').trim() === String(userId || '').trim();
      if (isOwner) {
        const createdAt = new Date(oldData.created_at);
        const now = new Date();
        const diffMin = (now - createdAt) / 60000;
        if (diffMin > 5) {
          const { data: permissao } = await supabase
            .from('permissoes_usuarios')
            .select('pode_editar')
            .eq('user_id', userId)
            .maybeSingle();
          if (!permissao?.pode_editar) {
            setError(
              '❌ Você só pode editar seu agendamento nos primeiros 5 minutos após criá-lo.'
            );
            return;
          }
        }
      } else {
        const { data: permissao } = await supabase
          .from('permissoes_usuarios')
          .select('pode_editar')
          .eq('user_id', userId)
          .maybeSingle();
        if (!permissao?.pode_editar) {
          setError('❌ Você não tem permissão para editar este agendamento.');
          return;
        }
      }
    }

    const novoInicio = new Date(`${date.split('T')[0]}T${form.startTime}`);
    const novoFim = new Date(`${date.split('T')[0]}T${form.endTime}`);

    const { data: agendamentos, error: fetchError } = await supabase
      .from('agendamentos')
      .select('*')
      .eq('date', date.split('T')[0])
      .eq('studio', form.studio);
    if (fetchError) {
      setError('Erro ao verificar conflitos');
      return;
    }

    const { data: bloqueios } = await supabase
      .from('estudio_bloqueios')
      .select('*');

    const conflito = agendamentos.some((ag) => {
      if (isEdit && ag.id === event.id) return false;
      const agStart = new Date(`${ag.date}T${ag.start}`);
      const agEnd = new Date(`${ag.date}T${ag.end}`);
      return (
        (novoInicio >= agStart && novoInicio < agEnd) ||
        (novoFim > agStart && novoFim <= agEnd) ||
        (novoInicio <= agStart && novoFim >= agEnd)
      );
    });
    if (conflito) {
      setError('❌ Conflito de horário com outro evento no mesmo estúdio.');
      return;
    }

    const conflitoBloqueio = bloqueios.some((b) => {
      if (b.estudio !== form.studio) return false;

      const bStart = new Date(`${b.data}T${b.horario_inicio}`);
      const bEnd = new Date(`${b.data}T${b.horario_fim}`);

      return (
        (novoInicio >= bStart && novoInicio < bEnd) ||
        (novoFim > bStart && novoFim <= bEnd) ||
        (novoInicio <= bStart && novoFim >= bEnd)
      );
    });

    if (conflitoBloqueio) {
      setError(
        '❌ Este estúdio está indisponível nesse horário (manutenção/limpeza).'
      );
      return;
    }

    const payload = {
      date: form.selectedDate,
      start: form.startTime,
      end: form.endTime,
      materia: form.materia,
      gravacao: form.proposta,
      tecnico: form.tecnico,
      professor: form.professor,
      studio: form.studio,
      tipo: form.tipo,
      user_email: userData?.user?.email || '',
      user_id: userData?.user?.id || '',
    };

    let response, novoEventoId;
    if (isEdit) {
      const { data: oldData } = await supabase
        .from('agendamentos')
        .select('*')
        .eq('id', event.id)
        .single();
      response = await supabase
        .from('agendamentos')
        .update(payload)
        .eq('id', event.id)
        .select()
        .single();
      if (!response.error) {
        await registrarLog(event.id, 'update', oldData, response.data);
        novoEventoId = response.data.id;
      }
    } else {
      response = await supabase
        .from('agendamentos')
        .insert(payload)
        .select()
        .single();
      if (!response.error) {
        await registrarLog(response.data.id, 'insert', null, response.data);
        novoEventoId = response.data.id;
      }
    }
    if (response.error) {
      setError('Erro ao salvar agendamento');
      return;
    }

    onSave(novoEventoId);
    onClose();
  };

  const handleDeleteConfirm = async () => {
    if (!event) return;
    setOpenDeleteDialog(false);

    const { data: userData } = await supabase.auth.getUser();
    const userEmail = userData?.user?.email;
    const userId = userData?.user?.id;

    const { data: userAdmin } = await supabase
      .from('users')
      .select('is_admin')
      .eq('email', userEmail)
      .maybeSingle();
    const isAdmin = userAdmin?.is_admin === true;

    if (!isAdmin) {
      const { data: oldData } = await supabase
        .from('agendamentos')
        .select('user_id, created_at')
        .eq('id', event.id)
        .single();
      const isOwner = oldData?.user_id === userId;
      const createdAt = new Date(oldData?.created_at);
      const now = new Date();
      const diffMin = (now - createdAt) / 60000;
      if (!(isOwner && diffMin <= 5)) {
        const { data: permissao } = await supabase
          .from('permissoes_usuarios')
          .select('pode_cancelar')
          .eq('user_id', userId)
          .maybeSingle();
        if (!permissao?.pode_cancelar) {
          setError('❌ Você não tem permissão para cancelar este agendamento.');
          return;
        }
      }
    }

    const { data: oldData } = await supabase
      .from('agendamentos')
      .select('*')
      .eq('id', event.id)
      .single();
    const response = await supabase
      .from('agendamentos')
      .delete()
      .eq('id', event.id)
      .select();

    if (!response.error) {
      await registrarLog(event.id, 'delete', oldData, null);
      onSave && onSave(null, 'delete');
      onClose && onClose();
    } else {
      setError('Erro ao cancelar agendamento');
    }
  };

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const TECNICOS_MANUAL_EMAILS = [
    'ericksilva@focomedicina.com',
    'sauloadao@focomedicina.com',
  ];

  const podeEditarTecnico = TECNICOS_MANUAL_EMAILS.includes(user?.email);

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) onClose();
        }}
      >
        <DialogContent className='w-full max-w-md h-auto'>
          <DialogHeader>
            <DialogTitle>
              {isEdit ? 'Editar Agendamento' : 'Novo Agendamento'}
            </DialogTitle>
          </DialogHeader>

          <div className='grid gap-3 pt-2'>
            {/* Data */}
            {isEdit && (
              <Input
                type='date'
                value={form.selectedDate}
                onChange={(e) => handleChange('selectedDate', e.target.value)}
                className='w-full'
              />
            )}

            {/* Matéria e Proposta em coluna */}
            <div className='grid gap-2'>
              <div>
                <Label className='mb-1'>Matéria</Label>
                <Select
                  value={form.materia}
                  onValueChange={(val) => handleChange('materia', val)}
                  className='w-full'
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Selecione a matéria' />
                  </SelectTrigger>
                  <SelectContent>
                    {materiaList.map((mat) => (
                      <SelectItem key={mat} value={mat}>
                        {mat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className='mb-1'>Proposta</Label>
                <Select
                  value={form.proposta}
                  onValueChange={(val) => handleChange('proposta', val)}
                  className='w-full'
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Selecione a proposta' />
                  </SelectTrigger>
                  <SelectContent>
                    {propostaList.map((prop) => (
                      <SelectItem key={prop} value={prop}>
                        {prop}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tipo e Estúdio em linha */}
            <div className='flex gap-2'>
              <div className='flex-1'>
                <Label className='mb-1'>Tipo</Label>
                <Select
                  value={form.tipo}
                  onValueChange={(val) => handleChange('tipo', val)}
                  className='w-full'
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Selecione o tipo' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Gravação'>Gravação</SelectItem>
                    <SelectItem value='Transmissão'>Transmissão</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='flex-1'>
                <Label className='mb-1'>Estúdio</Label>
                <Select
                  value={form.studio}
                  onValueChange={(val) => handleChange('studio', val)}
                  className='w-full'
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Selecione o estúdio' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Estudio 170'>Estudio 170</SelectItem>
                    <SelectItem value='Estudio 120'>Estudio 120</SelectItem>
                    <SelectItem value='Remoto'>Remoto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Horário, Professor e Técnico em layout compacto */}
            <div className='grid gap-2 sm:grid-cols-2'>
              <div>
                <Label className='mb-1'>Hora Início</Label>
                <Input
                  type='time'
                  value={form.startTime}
                  onChange={(e) => handleChange('startTime', e.target.value)}
                />
              </div>
              <div>
                <Label className='mb-1'>Hora Fim</Label>
                <Input
                  type='time'
                  value={form.endTime}
                  disabled
                  placeholder='Fim (automático)'
                />
              </div>
              <div>
                <Label className='mb-1'>Professor</Label>
                <Input
                  placeholder='Professor'
                  value={form.professor}
                  onChange={(e) => handleChange('professor', e.target.value)}
                />
              </div>
              <div>
                <Label className='mb-1'>Técnico</Label>
                <Input
                  placeholder='Técnico'
                  value={form.tecnico}
                  disabled={!podeEditarTecnico}
                  onChange={(e) =>
                    setForm({ ...form, tecnico: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Exibir erros e avisos */}
            {(error || warning || erroTecnico) && (
              <div className='mt-3 space-y-1 text-center'>
                {error && (
                  <p className='text-red-600 text-sm font-medium'>{error}</p>
                )}
                {warning && (
                  <p className='text-yellow-600 text-sm font-medium'>
                    {warning}
                  </p>
                )}
                {erroTecnico && (
                  <p className='text-red-500 text-sm'>{erroTecnico}</p>
                )}
              </div>
            )}

            {/* Botões */}
            <div className='flex gap-2 mt-4'>
              <Button onClick={handleSave} className='flex-1'>
                {isEdit ? 'Salvar Alterações' : 'Criar Agendamento'}
              </Button>
              {isEdit && (
                <Button
                  variant='destructive'
                  onClick={() => setOpenDeleteDialog(true)}
                  className='flex-1'
                >
                  Cancelar Agendamento
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ALERT DIALOG */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Agendamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar este agendamento? Esta ação não
              pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
