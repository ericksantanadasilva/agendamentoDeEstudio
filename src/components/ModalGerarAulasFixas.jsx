import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from '@/components/ui/select';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';

import { gerarAulasFixas } from '@/utils/gerarAulasFixas';

export function ModalGerarAulasFixas({ open, onClose }) {
  const [dataInicial, setDataInicial] = useState('');
  const [quantidade, setQuantidade] = useState(4);
  const [repetirPor, setRepetirPor] = useState('semanas');
  const [loading, setLoading] = useState(false);

  const [openSuccess, setOpenSuccess] = useState(false);

  const handleGerar = async () => {
    if (!dataInicial) return alert('Selecione a data inicial!');

    setLoading(true);

    await gerarAulasFixas({
      dataInicial,
      quantidade: Number(quantidade),
      repetirPor,
    });

    setLoading(false);
    onClose(); // fecha o modal principal
    setOpenSuccess(true); // abre a mensagem elegante
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Gerar aulas fixas</DialogTitle>
          </DialogHeader>

          <div className='space-y-4'>
            <div>
              <label className='text-sm'>Data inicial</label>
              <Input
                type='date'
                value={dataInicial}
                onChange={(e) => setDataInicial(e.target.value)}
              />
            </div>

            <div>
              <label className='text-sm'>Quantidade</label>
              <Input
                type='number'
                min={1}
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
              />
            </div>

            <div>
              <label className='text-sm'>Repetir por</label>
              <Select value={repetirPor} onValueChange={setRepetirPor}>
                <SelectTrigger>
                  <SelectValue placeholder='Selecione' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='semanas'>Semanas</SelectItem>
                  <SelectItem value='meses'>Meses</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleGerar} disabled={loading} className='w-full'>
              {loading ? 'Gerando...' : 'Gerar aulas fixas'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ALERTA DE SUCESSO */}
      <AlertDialog open={openSuccess} onOpenChange={setOpenSuccess}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sucesso!</AlertDialogTitle>
            <AlertDialogDescription>
              As aulas fixas foram geradas com sucesso.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setOpenSuccess(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
