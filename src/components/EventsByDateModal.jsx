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
  console.log('Eventos recebidos no modal: ', events);
  const formatTime = (time) =>
    new Date(time).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

  const leftColumnEvents = events.filter(
    (event) =>
      event.extendedProps?.studio === 'Estudio 170' ||
      (event.extendedProps?.studio === 'Estudio 120' &&
        event.extendedProps?.tipo === 'Transmissão')
  );

  const rightColumnEvents = events.filter(
    (event) =>
      event.extendedProps?.studio === 'Estudio 120' &&
      event.extendedProps?.tipo === 'Gravação'
  );

  const renderEvent = (event) => (
    <div
      key={event.id}
      className='bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:bg-gray-50 transition cursor-pointer text-sm space-y-1'
      onClick={() => onEdit(event)}
    >
      <div className='font-semibold text-gray-800'>
        {formatTime(event.start)} - {formatTime(event.end)}
      </div>
      <div className='flex items-center gap-2 text-gray-600'>
        🎬 <span>{event.extendedProps?.gravacao}</span>
      </div>
      <div className='flex items-center gap-2 text-gray-600'>
        📚 <span>{event.extendedProps?.materia}</span>
      </div>
      <div className='flex items-center gap-2 text-gray-600'>
        👨‍🏫 <span>{event.extendedProps?.professor}</span>
      </div>
      <div className='flex items-center gap-2 text-gray-600'>
        🎥 <span>{event.extendedProps?.tecnico}</span>
      </div>
      <div className='flex items-center gap-2 text-gray-600'>
        🏠 <span>{event.extendedProps?.studio}</span>
      </div>
      <div className='flex items-center gap-2 text-gray-600'>
        ▶ <span>{event.extendedProps?.tipo}</span>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl w-full max-h-[80vh] overflow-y-auto'>
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

        <div className='flex flex-col md:grid md:grid-cols-2 gap-4'>
          <ScrollArea className='p-1'>
            <h3 className='text-lg font-semibold mb-2'>
              Estúdio 170 + Transmissões Estúdio 120
            </h3>
            {leftColumnEvents.length > 0 ? (
              leftColumnEvents.map(renderEvent)
            ) : (
              <p className='text-sm text-gray-500'>Nenhum evento.</p>
            )}
          </ScrollArea>

          <ScrollArea className='p-1'>
            <h3 className='text-lg font-semibold mb-2'>
              Gravações Estúdio 120
            </h3>
            {rightColumnEvents.length > 0 ? (
              rightColumnEvents.map(renderEvent)
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
