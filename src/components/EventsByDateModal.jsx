import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

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
      className='bg-gray-100 rounded-xl shadow p-2 mb-2 cursor-pointer hover:bg-gray-200 transition text-sm'
      onClick={() => onEdit(event)}
    >
      <div className='font-semibold'>
        {formatTime(event.start)} - {formatTime(event.end)}
      </div>
      <div>🎬 {event.extendedProps?.gravacao}</div>
      <div>📚 {event.extendedProps?.materia}</div>
      <div>👨‍🏫 {event.extendedProps?.professor}</div>
      <div>🎥 {event.extendedProps?.tecnico}</div>
      <div>🏠 Estúdio {event.extendedProps?.studio}</div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl w-full'>
        <DialogHeader>
          <DialogTitle className='text-xl font-bold'>
            Eventos do Dia
          </DialogTitle>
          <DialogDescription>
            Clique em um evento para editar.
          </DialogDescription>
        </DialogHeader>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh]'>
          <ScrollArea className='p-1 max-h-[65vh]'>
            <h3 className='text-lg font-semibold mb-2'>
              Estúdio 170 + Transmissões Estúdio 120
            </h3>
            {leftColumnEvents.length > 0 ? (
              leftColumnEvents.map(renderEvent)
            ) : (
              <p className='text-sm text-gray-500'>Nenhum evento.</p>
            )}
          </ScrollArea>

          <ScrollArea className='p-1 max-h-[65vh]'>
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
