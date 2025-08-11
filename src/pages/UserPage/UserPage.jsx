import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import EventModal from '@/components/EventModal';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function UserPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState(null);
  const [user, setUser] = useState(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const onToggleSidebar = () => setIsSidebarOpen(true);
  const onCloseSidebar = () => setIsSidebarOpen(false);

  //busca o usuário logado
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      }
    };
    getUser();
  }, []);

  //busca agendamentos do usuario
  const fetchEvents = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('agendamentos')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true })
      .order('start', { ascending: true });

    if (error) {
      console.error(error);
    } else {
      setEvents(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user]);

  const handleSave = () => {
    setEditingEvent(null);
    fetchEvents();
  };

  //exclui o agendamento
  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este agendamento?')) return;

    const { error } = await supabase.from('agendamentos').delete().eq('id', id);
    if (error) {
      alert('Erro ao excluir agendamento');
      console.error(error);
    } else {
      setEvents(events.filter((event) => event.id !== id));
    }
  };

  return (
    <div className='flex h-screen'>
      <Header onToggleSidebar={onToggleSidebar} />
      <div className="'flex flex-col flex-1">
        <Sidebar isOpen={isSidebarOpen} onClose={onCloseSidebar} />
        <div className='p-6 overflow-auto'>
          <h1 className='text-2xl font-bold mb-4'>Meus Agendamentos</h1>

          {loading ? (
            <p>Carregando...</p>
          ) : events.length === 0 ? (
            <p className='text-gray-500'>Você não possui agendamentos.</p>
          ) : (
            <div className='bg-gray-50 rounded-lg shadow-md overflow-hidden text-gray-900'>
              <table className='w-full text-left border-collapse'>
                <thead className='bg-gray-100'>
                  <tr>
                    <th className='p-3'>Data</th>
                    <th className='p-3'>Horário</th>
                    <th className='p-3'>Estúdio</th>
                    <th className='p-3'>Matéria</th>
                    <th className='p-3'>Proposta</th>
                    <th className='p-3'>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => {
                    const startDate = new Date(`${event.date}T${event.start}`);
                    const endDate = new Date(`${event.date}T${event.end}`);
                    return (
                      <tr key={event.id} className='border-b'>
                        <td className='p-3'>
                          {startDate.toLocaleDateString('pt-BR')}
                        </td>
                        <td className='p-3'>
                          {startDate.toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          -{' '}
                          {endDate.toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className='p-3'>{event.studio}</td>
                        <td className='p-3'>{event.materia}</td>
                        <td className='p-3'>{event.gravacao}</td>
                        <td className='p-3 flex gap-2'>
                          <button
                            className='p-2 rounded bg-blue-500 text-white hover:bg-blue-600'
                            onClick={() => setEditingEvent(event)}
                          >
                            <PencilIcon className='h-5 w-5' />
                          </button>
                          <button
                            className='p-2 rounded bg-red-500 text-white hover:bg-red-600'
                            onClick={() => handleDelete(event.id)}
                          >
                            <TrashIcon className='h-5 w-5' />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {editingEvent && (
        <EventModal
          open={!!editingEvent}
          onClose={() => setEditingEvent(null)}
          event={editingEvent}
          date={editingEvent ? editingEvent.date : null}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
