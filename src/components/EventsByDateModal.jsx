import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusIcon } from '@heroicons/react/24/outline';

export const EventsByDateModal = ({ isOpen, onClose, events = [], onEdit }) => {
  const formatTime = (time) =>
    new Date(time).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

  const studio170Events = events.filter(
    (event) => event.extendedProps?.studio === 'Estudio 170'
  );

  const studio120Events = events.filter(
    (event) => event.extendedProps?.studio === 'Estudio 120'
  );

  const remoteEvents = events.filter(
    (event) => event.extendedProps?.studio === 'Remoto'
  );

  const renderEvent = (event) => (
    <div
      key={event.id}
      className='bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:bg-gray-50 transition cursor-pointer text-sm space-y-1 dark:bg-neutral-900 dark:border-neutral-700 dark:hover:bg-neutral-800'
      onClick={() => onEdit(event)}
    >
      <div className='font-semibold text-gray-800 dark:text-gray-200'>
        {formatTime(event.start)} - {formatTime(event.end)}
      </div>
      <div className='flex items-center gap-2 text-gray-600 dark:text-gray-400'>
        🎬 <span>{event.extendedProps?.gravacao}</span>
      </div>
      <div className='flex items-center gap-2 text-gray-600 dark:text-gray-400'>
        📚 <span>{event.extendedProps?.materia}</span>
      </div>
      <div className='flex items-center gap-2 text-gray-600 dark:text-gray-400'>
        👨‍🏫 <span>{event.extendedProps?.professor}</span>
      </div>
      <div className='flex items-center gap-2 text-gray-600 dark:text-gray-400'>
        🎥 <span>{event.extendedProps?.tecnico}</span>
      </div>
      <div className='flex items-center gap-2 text-gray-600 dark:text-gray-400'>
        🏠 <span>{event.extendedProps?.studio}</span>
      </div>
      <div className='flex items-center gap-2 text-gray-600 dark:text-gray-400'>
        ▶ <span>{event.extendedProps?.tipo}</span>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='md:max-w-3xl w-full max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <div className='flex items-center gap-2'>
            <DialogTitle className='text-xl font-bold'>
              Eventos do Dia
            </DialogTitle>
            <button
              className='bg-green-500 hover:bg-green-600 text-white rounded-full w-7 h-7 flex items-center justify-center shadow transition'
              onClick={() => {
                if (events.length > 0) {
                  const date = events[0].start.slice(0, 10); // pega a data do primeiro evento
                  onEdit(null, date); // vamos passar null para indicar novo agendamento
                }
              }}
              title='Novo Agendamento'
            >
              <PlusIcon className='h-5 w-5 text-white' />
            </button>
          </div>
          <DialogDescription>
            Clique em um evento para editar.
          </DialogDescription>
        </DialogHeader>

        <div className='flex flex-col md:grid md:grid-cols-3 gap-4'>
          <ScrollArea className='p-1'>
            <h3 className='text-lg font-semibold mb-2'>Estúdio 170</h3>
            {studio170Events.length > 0 ? (
              studio170Events.map(renderEvent)
            ) : (
              <p className='text-sm text-gray-500'>Nenhum evento.</p>
            )}
          </ScrollArea>

          <ScrollArea className='p-1'>
            <h3 className='text-lg font-semibold mb-2'>Estúdio 120</h3>
            {studio120Events.length > 0 ? (
              studio120Events.map(renderEvent)
            ) : (
              <p className='text-sm text-gray-500'>Nenhum evento.</p>
            )}
          </ScrollArea>

          <ScrollArea className='p-1'>
            <h3 className='text-lg font-semibold mb-2'>Remoto</h3>
            {remoteEvents.length > 0 ? (
              remoteEvents.map(renderEvent)
            ) : (
              <p className='text-sm text-gray-500'>Nenhum evento.</p>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventsByDateModal;
