import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

export function ModalRegrasDuracao({ open, onClose, editData }) {
  const [materia, setMateria] = useState('');
  const [proposta, setProposta] = useState('');
  const [duracao, setDuracao] = useState('');

  useEffect(() => {
    if (editData) {
      setMateria(editData.materia);
      setProposta(editData.proposta);

      // Garantir que venha sempre "HH:MM"
      setDuracao(editData.duracao_em_horas?.slice(0, 5) || '');
    } else {
      setMateria('');
      setProposta('');
      setDuracao('');
    }
  }, [editData]);

  const salvar = async () => {
    if (!materia || !proposta || !duracao) {
      alert('Preencha todos os campos.');
      return;
    }

    if (editData && editData.id) {
      await supabase
        .from('regras_duracao')
        .update({
          materia,
          proposta,
          duracao_em_horas: duracao, // agora é string
        })
        .eq('id', editData.id);
    } else {
      await supabase.from('regras_duracao').insert({
        materia,
        proposta,
        duracao_em_horas: duracao,
      });
    }

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>
            {editData ? 'Editar regra de duração' : 'Adicionar nova regra'}
          </DialogTitle>
          <DialogDescription className='sr-only'>
            Formulário para adicionar ou editar regras de duração com base em
            matéria e proposta.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div>
            <label className='text-sm'>Matéria</label>
            <Input
              value={materia}
              onChange={(e) => setMateria(e.target.value)}
            />
          </div>

          <div>
            <label className='text-sm'>Proposta</label>
            <Input
              value={proposta}
              onChange={(e) => setProposta(e.target.value)}
            />
          </div>

          <div>
            <label className='text-sm'>Duração (HH:MM)</label>
            <Input
              type='time'
              value={duracao}
              onChange={(e) => setDuracao(e.target.value)}
            />
          </div>

          <Button className='w-full' onClick={salvar}>
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
