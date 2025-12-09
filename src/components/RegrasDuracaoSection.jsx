import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { ModalRegrasDuracao } from './ModalRegrasDuracao';

export function RegrasDuracaoSection() {
  const [regras, setRegras] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  async function carregar() {
    setLoading(true);
    const { data } = await supabase
      .from('regras_duracao')
      .select('*')
      .order('materia', { ascending: true });
    setRegras(data || []);
    setLoading(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  const handleAdd = () => {
    setEditData(null);
    setModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditData(item);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Deseja realmente excluir esta regra?')) return;
    await supabase.from('regras_duracao').delete().eq('id', id);
    carregar();
  };

  return (
    <AccordionItem value='regras_duracao'>
      <AccordionTrigger className='text-lg font-semibold'>
        Regras de Duração (Matéria + Proposta)
      </AccordionTrigger>

      <AccordionContent>
        <Card>
          <CardHeader className='flex justify-between items-center py-2 border-b'>
            <CardTitle className='text-base'>
              Gerenciar regras de duração
            </CardTitle>

            <Button size='sm' onClick={handleAdd}>
              + Adicionar
            </Button>
          </CardHeader>

          <CardContent className='space-y-3'>
            {loading ? (
              <p>Carregando regras...</p>
            ) : regras.length === 0 ? (
              <p>Nenhuma regra cadastrada.</p>
            ) : (
              regras.map((item) => (
                <div
                  className='flex justify-between items-center py-2 border-b'
                  key={item.id}
                >
                  <div>
                    <p className='font-medium'>
                      {item.materia} — {item.proposta}
                    </p>
                    <p className='text-sm text-gray-500'>
                      Duração: {item.duracao_em_horas}h
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

        {/* Modal */}
        <ModalRegrasDuracao
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            carregar();
          }}
          editData={editData}
        />
      </AccordionContent>
    </AccordionItem>
  );
}
