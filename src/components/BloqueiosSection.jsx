import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Input } from './ui/input';

const BloqueiosSection = () => {
  const [bloqueios, setBloqueios] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const [estudio, setEstudio] = useState('');
  const [data, setData] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFim, setHoraFim] = useState('');
  const [motivo, setMotivo] = useState('');

  async function fetchBloqueios() {
    const { data, error } = await supabase
      .from('estudio_bloqueios')
      .select('*')
      .order('data', { ascending: true })
      .order('horario_inicio', { ascending: true });

    if (!error) setBloqueios(data);
  }

  useEffect(() => {
    fetchBloqueios();
  }, []);

  function abrirCriar() {
    setEditing(null);
    setEstudio('');
    setData('');
    setHoraInicio('');
    setHoraFim('');
    setMotivo('');
    setOpenModal(true);
  }

  function abrirEditar(item) {
    setEditing(item.id);
    setEstudio(item.estudio);
    setData(item.data);
    setHoraInicio(item.inicio.slice(0, 5));
    setHoraFim(item.fim.slice(0, 5));
    setMotivo(item.motivo);
    setOpenModal(true);
  }

  const inicioTimestamp = `${data}T${horaInicio}:00Z`;
  const fimTimestamp = `${data}T${horaFim}:00Z`;

  async function salvar() {
    if (!estudio || !data || !horaInicio || !horaFim) return;

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    const payload = {
      estudio,
      data,
      horario_inicio: horaInicio + ':00',
      horario_fim: horaFim + ':00',
      motivo,
      criado_por: userId,
    };

    if (editing) {
      const { error } = await supabase
        .from('estudio_bloqueios')
        .update(payload)
        .eq('id', editing);

      if (error) console.log('Erro Update:', error);
    } else {
      const { error } = await supabase
        .from('estudio_bloqueios')
        .insert(payload);
      if (error) console.log('Erro Insert:', error);
    }

    setOpenModal(false);
    fetchBloqueios();
  }

  async function excluir(id) {
    await supabase.from('estudio_bloqueios').delete().eq('id', id);
    fetchBloqueios();
  }
  return (
    <div className='border rounded-lg p-4 mt-4'>
      <div className='flex items-center justify-between mb-3'>
        <h2 className='font-semibold text-lg'>Bloqueios de Estúdio</h2>
        <Button size='sm' onClick={abrirCriar}>
          Adicionar Bloqueio
        </Button>
      </div>

      <div className='flex flex-col gap-3'>
        {bloqueios.map((b) => (
          <div
            key={b.id}
            className='flex items-center justify-between border p-4 rounded-lg'
          >
            <div>
              <h3 className='font-semibold'>{b.estudio}</h3>
              <p className='text-sm text-muted-foreground'>
                {new Date(`${b.data}T00:00:00`).toLocaleDateString('pt-BR')} -{' '}
                {b.horario_inicio.slice(0, 5)} às {b.horario_fim.slice(0, 5)}
              </p>
              {b.motivo && (
                <p className='text-sm text-muted-foreground'>
                  Motivo: {b.motivo}
                </p>
              )}
            </div>
            <div className='flex gap-2'>
              <Button
                size='sm'
                variant='outline'
                onClick={() => abrirEditar(b)}
              >
                Editar
              </Button>
              <Button
                size='sm'
                variant='destructive'
                onClick={() => excluir(b.id)}
              >
                Excluir
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Editar Bloqueio' : 'Novo Bloqueio'}
            </DialogTitle>
          </DialogHeader>

          <div className='flex flex-col gap-4 mt-2'>
            <div>
              <Label className='text-sm font-medium'>Estúdio</Label>
              <Select value={estudio} onValueChange={setEstudio}>
                <SelectTrigger>
                  <SelectValue placeholder='Selecione o estúdio' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='Estudio 120'>Estúdio 120</SelectItem>
                  <SelectItem value='Estudio 170'>Estúdio 170</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className='text-sm font-medium'>Data</Label>
              <Input
                type='date'
                value={data}
                onChange={(e) => setData(e.target.value)}
              />
            </div>

            <div className='flex gap-3'>
              <div className='flex-1'>
                <Label className='text-sm font-medium'>Hora início</Label>
                <Input
                  type='time'
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                />
              </div>

              <div className='flex-1'>
                <Label className='text-sm font-medium'>Hora fim</Label>
                <Input
                  type='time'
                  value={horaFim}
                  onChange={(e) => setHoraFim(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label className='text-sm font-medium'>Motivo (opcional)</Label>
              <Input
                placeholder='Ex: Manutenção, limpeza...'
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={salvar} className='w-full mt-3'>
              {editing ? 'Salvar Alterações' : 'Criar Bloqueio'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BloqueiosSection;
