import { useEffect, useState } from 'react';
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
import { format, add, set, parseISO } from 'date-fns';
import { supabase } from '../lib/supabase';
import { registrarLog } from '@/utils/registrarLog';
import { buscarTecnicos } from '@/services/tecnicos';
import { ptBR } from 'date-fns/locale';
import { horaParaMinutos } from '@/utils/horario';

export default function EventModal({ open, onClose, date, event, onSave }) {
  const isEdit = !!event;

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
          // concatena data + hora
          start = new Date(`${data}T${event.start || event.startTime}`);
          end = new Date(`${data}T${event.end || event.endTime}`);
        } else {
          // se não tem data, tenta criar direto com start/end
          start = new Date(event.start);
          end = new Date(event.end);
        }

        if (isNaN(start) || isNaN(end)) {
          // trata erro para evitar quebrar a página
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
          selectedDate: date.split('T')[0],
        });
      }
      setError('');
      setWarning('');
    }
  }, [open, event]);

  useEffect(() => {
    const propostasFiltradas = regrasDuracao
      .filter((r) => r.materia === form.materia)
      .map((r) => r.proposta);
    const propostasUnicas = [...new Set(propostasFiltradas)];
    setPropostaList(propostasUnicas);
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
        // monta Date a partir da data selecionada + debouncedStartTime
        const inicioDate = new Date(
          `${form.selectedDate}T${debouncedStartTime}`
        );
        const [durH, durM] = regra.duracao_em_horas.split(':').map(Number);
        const fimDate = add(inicioDate, { hours: durH, minutes: durM });
        horaFimParaBuscar = format(fimDate, 'HH:mm');

        // atualiza o form.endTime na UI se estiver diferente (opcional, mas útil)
        if (form.endTime !== horaFimParaBuscar) {
          setForm((prev) => ({ ...prev, endTime: horaFimParaBuscar }));
        }
      } else {
        //se não tiver regra ainda, aborta; não queremos buscar com fim invalido
        // (ou você pode optar por usar form.endTime se tiver certeza de que está correto)
        if (!form.endTime) return;
        horaFimParaBuscar = form.endTime;
      }

      const dataObj = parseISO(form.selectedDate);

      const diaSemana = format(dataObj, 'EEEE', {
        locale: ptBR,
      });

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

      let nomesSelecionados = [];

      if (Array.isArray(tecnicos) && tecnicos.length > 0) {
        nomesSelecionados = tecnicos;
      } else {
        nomesSelecionados = [...new Set(blocos.flatMap((b) => b.tecnicos))];
      }

      //atualiza estado
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
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedStartTime(form.startTime);
    }, 400);

    return () => clearTimeout(handler);
  }, [form.startTime]);

  const handleSave = async () => {
    setError('');
    setWarning('');

    if (!form.tecnico || erroTecnico) {
      return;
    }

    // Verificação de campos obrigatórios
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

    let response;
    let novoEventoId;
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
        .select() // importante o .select() para obter dados e erro
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
      if (response.error.code === '42501') {
        setError('❌ Você não pode editar agendamentos de outra pessoa.');
      } else {
        setError('Erro ao salvar agendamento');
      }
      return;
    }

    // if (response.data.length === 0) {
    //   // Nenhuma linha afetada = permissão negada ou id inválido
    //   setError('❌ Você não pode editar agendamentos de outra pessoa.');
    //   return;
    // }

    onSave(novoEventoId);
    onClose();
  };

  const handleDelete = async () => {
    if (!event) return;

    const confirmDelete = confirm(
      'Tem certeza que deseja cancelar este agendamento?'
    );
    if (!confirmDelete) return;

    const { data: oldData } = await supabase
      .from('agendamentos')
      .select('*')
      .eq('id', event.id)
      .single();

    const response = await supabase
      .from('agendamentos')
      .delete()
      .eq('id', event.id)
      .select(); // .select() para retornar linhas deletadas

    if (!response.error) {
      await registrarLog(event.id, 'delete', oldData, null);
    }

    if (response.error) {
      if (response.error.code === '42501') {
        setError('❌ Você não pode excluir agendamentos de outra pessoa.');
      } else {
        setError('Erro ao cancelar agendamento');
      }
      return;
    }

    if (response.data.length === 0) {
      // Nenhuma linha deletada = permissão negada ou id inválido
      setError('❌ Você não pode excluir agendamentos de outra pessoa.');
      return;
    }
    onSave();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Editar Agendamento' : 'Novo Agendamento'}
          </DialogTitle>
        </DialogHeader>

        <div className='grid gap-4 pt-2'>
          {/* ALTERAR DATA NO MODO DE EDIÇÃO */}
          {isEdit && (
            <Input
              type='date'
              value={form.selectedDate}
              onChange={(e) => handleChange('selectedDate', e.target.value)}
            />
          )}

          {/* MATÉRIA */}
          <Select
            value={form.materia}
            onValueChange={(val) => handleChange('materia', val)}
          >
            <SelectTrigger>
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

          {/* PROPOSTA */}
          <Select
            value={form.proposta}
            onValueChange={(val) => handleChange('proposta', val)}
          >
            <SelectTrigger>
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

          {/* TIPO */}
          <Select
            value={form.tipo}
            onValueChange={(val) => handleChange('tipo', val)}
          >
            <SelectTrigger>
              <SelectValue placeholder='Selecione o tipo' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='Gravação'>Gravação</SelectItem>
              <SelectItem value='Transmissão'>Transmissão</SelectItem>
            </SelectContent>
          </Select>

          {/* HORÁRIO */}
          <Input
            type='time'
            value={form.startTime}
            onChange={(e) => handleChange('startTime', e.target.value)}
          />
          <Input
            type='time'
            value={form.endTime}
            disabled
            placeholder='Fim (automático)'
          />

          {/* PROFESSOR E TÉCNICO */}
          <Input
            placeholder='Professor'
            value={form.professor}
            onChange={(e) => handleChange('professor', e.target.value)}
          />
          {tecnicosDisponiveis.length > 0 ? (
            <div className='space-y-2'>
              <p className='text-sm text-gray-600'>Técnicos disponíveis</p>
              <ul className='text-sm border rounded p-2 bg-gray-50'>
                {(() => {
                  // cálculo do início e fim em minutos
                  const inicioMin = horaParaMinutos(debouncedStartTime);
                  const fimMin = horaParaMinutos(form.endTime);

                  // técnicos que cobrem todo o período
                  const tecnicosCobremTudo = tecnicosDisponiveis
                    .filter((b) => {
                      return (
                        b.inicio &&
                        b.fim &&
                        horaParaMinutos(b.inicio) <= inicioMin &&
                        horaParaMinutos(b.fim) >= fimMin
                      );
                    })
                    .flatMap((b) => b.tecnicos);

                  // se existir, mostra só eles; senão, mostra todos
                  const nomesParaMostrar =
                    tecnicosCobremTudo.length > 0
                      ? [...new Set(tecnicosCobremTudo)]
                      : [
                          ...new Set(
                            tecnicosDisponiveis.flatMap((b) => b.tecnicos)
                          ),
                        ];

                  return nomesParaMostrar.map((nome, i) => (
                    <li key={i}>{nome}</li>
                  ));
                })()}
              </ul>
            </div>
          ) : (
            <Input placeholder='Técnico' value={form.tecnico} disabled />
          )}

          {/* ESTÚDIO */}
          <Select
            value={form.studio}
            onValueChange={(val) => handleChange('studio', val)}
          >
            <SelectTrigger>
              <SelectValue placeholder='Selecione o estúdio' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='Estudio 170'>Estudio 170</SelectItem>
              <SelectItem value='Estudio 120'>Estudio 120</SelectItem>
              <SelectItem value='Remoto'>Remoto</SelectItem>
            </SelectContent>
          </Select>

          {/* MENSAGENS */}
          {warning && <div className='text-yellow-500 text-sm'>{warning}</div>}
          {error && <div className='text-red-500 text-sm'>{error}</div>}
          {erroTecnico && (
            <div className='text-red-500 text-sm'>{erroTecnico}</div>
          )}

          {/* BOTÃO */}
          <Button onClick={handleSave}>
            {isEdit ? 'Salvar Alterações' : 'Criar Agendamento'}
          </Button>

          {isEdit && (
            <Button
              variant='destructive'
              onClick={handleDelete}
              className='flex-1'
            >
              Cancelar Agendamento
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
