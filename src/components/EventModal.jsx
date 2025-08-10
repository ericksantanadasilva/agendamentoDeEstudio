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
import { format, add } from 'date-fns';
import { supabase } from '../lib/supabase';

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
  });

  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');

  useEffect(() => {
    if (open) fetchRegras();
  }, [open]);

  useEffect(() => {
    if (open) {
      if (event) {
        const start = new Date(event.start);
        const end = new Date(event.end);
        setForm({
          materia: event.extendedProps.materia,
          proposta: event.extendedProps.gravacao,
          professor: event.extendedProps.professor || '',
          tecnico: event.extendedProps.tecnico || '',
          startTime: format(start, 'HH:mm'),
          endTime: format(end, 'HH:mm'),
          studio: event.extendedProps.studio,
          tipo: event.extendedProps.tipo,
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
    calcularHorarioFim();
  }, [form.proposta, form.materia, form.startTime]);

  const fetchRegras = async () => {
    const { data, error } = await supabase.from('regras_duracao').select('*');
    if (error) return console.error('Erro ao carregar regras:', error);
    setRegrasDuracao(data);
    const materiasUnicas = [...new Set(data.map((r) => r.materia))];
    setMateriaList(materiasUnicas);
  };

  const calcularHorarioFim = () => {
    if (!form.materia || !form.proposta || !form.startTime) return;
    const regra = regrasDuracao.find(
      (r) => r.materia === form.materia && r.proposta === form.proposta
    );
    if (!regra) return;
    const inicio = new Date(`${date.split('T')[0]}T${form.startTime}`);
    const [durH, durM] = regra.duracao_em_horas.split(':');
    const fim = add(inicio, { hours: +durH, minutes: +durM });
    setForm((prev) => ({ ...prev, endTime: format(fim, 'HH:mm') }));
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setError('');
    setWarning('');

    // Verificação de campos obrigatórios
    const obrigatorios = [
      'materia',
      'proposta',
      'tipo',
      'professor',
      'tecnico',
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
      date: date.split('T')[0],
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

    const { error: saveError } = isEdit
      ? await supabase.from('agendamentos').update(payload).eq('id', event.id)
      : await supabase.from('agendamentos').insert(payload);

    if (saveError) {
      setError('Erro ao salvar agendamento');
      return;
    }

    onSave();
    onClose();
  };

  const handleDelete = async () => {
    if (!event) return;

    const confirmDelete = confirm(
      'Tem certeza que deseja cancelar este agendamento?'
    );
    if (!confirmDelete) return;

    const { error: deleteError } = await supabase
      .from('agendamentos')
      .delete()
      .eq('id', event.id);

    if (deleteError) {
      setError('Erro ao cancelar agendamento');
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
          <Input
            placeholder='Técnico'
            value={form.tecnico}
            onChange={(e) => handleChange('tecnico', e.target.value)}
          />

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
            </SelectContent>
          </Select>

          {/* MENSAGENS */}
          {warning && <div className='text-yellow-500 text-sm'>{warning}</div>}
          {error && <div className='text-red-500 text-sm'>{error}</div>}

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
