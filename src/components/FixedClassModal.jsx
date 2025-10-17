import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';

export default function FixedClassModal({ open, onClose, onSaved, editData }) {
  const [form, setForm] = useState(
    editData || {
      materia: '',
      proposta: 'Aula Fixa',
      tipo: '',
      dia_semana: '',
      hora_inicio: '',
      hora_fim: '',
      professor: '',
      tecnico: '',
      estudio: '',
    }
  );
  const [materiaList, setMateriaList] = useState([]);

  const fetchRegras = async () => {
    const { data, error } = await supabase.from('regras_duracao').select('*');
    if (error) return console.error('Erro ao carregar regras:', error);
    const materiasUnicas = [...new Set(data.map((r) => r.materia))];
    setMateriaList(materiasUnicas);
  };

  useEffect(() => {
    if (open) fetchRegras();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    if (editData) {
      setForm(editData);
    } else {
      setForm({
        materia: '',
        proposta: 'Aula Fixa',
        tipo: '',
        dia_semana: '',
        hora_inicio: '',
        hora_fim: '',
        professor: '',
        tecnico: '',
        estudio: '',
      });
    }
  }, [open, editData]);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleSave = async () => {
    if (
      !form.materia ||
      !form.tipo ||
      !form.dia_semana ||
      !form.hora_inicio ||
      !form.hora_fim
    )
      return alert('Por favor, preencha todos os campos obrigatórios.');

    if (editData) {
      await supabase.from('aulas_fixas').update(form).eq('id', editData.id);
    } else {
      await supabase.from('aulas_fixas').insert([form]);
    }

    onSaved();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>
            {editData ? 'Editar Aula Fixa' : 'Nova Aula Fixa'}
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-3'>
          <div>
            <Label className='mb-1.5'>Matéria</Label>
            <Select
              value={form.materia}
              onValueChange={(v) => handleChange('materia', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder='Selecione a matéria' />
              </SelectTrigger>
              <SelectContent>
                {materiaList.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className='mb-1.5'>Proposta</Label>
            <Input
              value={form.proposta}
              onChange={(e) => handleChange('proposta', e.target.value)}
            />
          </div>

          <div>
            <Label className='mb-1.5'>Tipo</Label>
            <Select
              value={form.tipo}
              onValueChange={(v) => handleChange('tipo', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder='Selecione o tipo' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='Gravação'>Gravação</SelectItem>
                <SelectItem value='Transmissão'>Transmissão</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className='mb-1.5'>Dia da Semana</Label>
            <Select
              value={form.dia_semana}
              onValueChange={(v) => handleChange('dia_semana', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder='Selecione o dia' />
              </SelectTrigger>
              <SelectContent>
                {[
                  'Segunda',
                  'Terça',
                  'Quarta',
                  'Quinta',
                  'Sexta',
                  'Sábado',
                  'Domingo',
                ].map((dia) => (
                  <SelectItem key={dia} value={dia}>
                    {dia}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='flex gap-2'>
            <div className='flex-1'>
              <Label className='mb-1.5'>Hora Início</Label>
              <Input
                type='time'
                value={form.hora_inicio}
                onChange={(e) => handleChange('hora_inicio', e.target.value)}
              />
            </div>
            <div className='flex-1'>
              <Label className='mb-1.5'>Hora Fim</Label>
              <Input
                type='time'
                value={form.hora_fim}
                onChange={(e) => handleChange('hora_fim', e.target.value)}
              />
            </div>
          </div>

          <div className='flex gap-2'>
            <div className='flex-1'>
              <Label className='mb-1.5'>Professor</Label>
              <Input
                value={form.professor}
                onChange={(e) => handleChange('professor', e.target.value)}
              />
            </div>
            <div className='flex-1'>
              <Label className='mb-1.5'>Técnico</Label>
              <Input
                value={form.tecnico}
                onChange={(e) => handleChange('tecnico', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label className='mb-1.5'>Estúdio</Label>
            <Select
              value={form.estudio}
              onValueChange={(v) => handleChange('estudio', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder='Selecione o estúdio' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='Estudio 170'>Estúdio 170</SelectItem>
                <SelectItem value='Estudio 120'>Estúdio 120</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className='mt-4 flex justify-between'>
          <Button variant='outline' onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
