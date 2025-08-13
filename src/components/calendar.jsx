import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import '@fullcalendar/core/locales/pt-br';
import { useEffect, useState } from 'react';
import '../styles/fullcalendar-overrides.css';
import { supabase } from '../lib/supabase';
import EventsByDateModal from './EventsByDateModal';
import EventModal from './EventModal';

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [eventsOfSelectedDay, setEventsOfSelectedDay] = useState([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase.from('agendamentos').select('*');

    if (error) {
      console.error('Erro ao carregar agendamentos: ', error);
      return;
    }

    const formatted = data.map((evento) => {
      const startDateTime = `${evento.date}T${evento.start}`;
      const endDateTime = `${evento.date}T${evento.end}`;

      return {
        id: evento.id,
        title: `${evento.materia} - ${evento.gravacao}`,
        start: startDateTime,
        end: endDateTime,
        extendedProps: {
          studio: evento.studio,
          tecnico: evento.tecnico,
          gravacao: evento.gravacao,
          materia: evento.materia,
          professor: evento.professor,
          tipo: evento.tipo,
          user_email: evento.user_email,
          user_id: evento.user_id,
        },
      };
    });
    setEvents(formatted);
  };

  const handleDateClick = (info) => {
    setSelectedDate(info.dateStr);
    setSelectedEvent(null);
    setCreateModalOpen(true);
  };

  const handleEventClick = (info) => {
    const clickedDate = info.event.startStr.slice(0, 10); //pega só a data YYYY-MM-DD

    const eventosNoDia = events.filter((e) => e.start.startsWith(clickedDate));

    setEventsOfSelectedDay(eventosNoDia);
    setModalOpen(true);
  };

  const getEventColor = (evento) => {
    const chave = `${evento.studio}:${evento.tipo}`;

    const cores = {
      'Estudio 170:Transmissão': 'bg-blue-600',
      'Estudio 170:Gravação': 'bg-green-600',
      'Estudio 120:Transmissão': 'bg-red-600',
      'Estudio 120:Gravação': 'bg-purple-600',
    };

    return cores[chave] || 'bg-gray-400'; //cor padrão caso dê errado
  };

  return (
    <div className='px-4 sm:px-6 lg:px-8 max-w-screen overflow-x-hidden'>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView='dayGridMonth'
        locale='pt-br'
        dayMaxEvents={false}
        views={{
          dayGridMonth: {
            moreLinkText: (n) => ` +${n} eventos`, // Aqui é onde mudamos o texto
          },
        }}
        moreLinkClick={(arg) => {
          const clickedDate = arg.date; // objeto Date
          const clickedDateISO = clickedDate.toISOString().slice(0, 10); // YYYY-MM-DD

          const eventosNoDia = events.filter((e) => {
            const eventoDate = new Date(e.start).toISOString().slice(0, 10);
            return eventoDate === clickedDateISO;
          });

          setEventsOfSelectedDay(eventosNoDia);
          setModalOpen(true);

          return 'none'; // Impede o popover nativo
        }}
        headerToolbar={{
          start: '',
          center: 'title',
          end: 'today prev,next',
        }}
        buttonText={{
          today: 'Hoje',
          month: 'Mês',
          week: 'Semana',
          day: 'Dia',
        }}
        height='auto'
        contentHeight='auto'
        fixedWeekCount={false}
        aspectRatio={1.5}
        dayMaxEventRows={3}
        nowIndicator={true}
        editable={false}
        selectable={false}
        dayCellClassNames={() => 'rounded-md overflow-hidden'}
        eventClassNames={() =>
          'bg-transparent text-gray-800 text-sm px-2 py-1 rounded shadow cursor-pointer'
        }
        dayHeaderClassNames={() => 'text-zinc-100 bg-zinc-800 py-2'}
        events={events}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        eventContent={(arg) => {
          const cor = getEventColor(arg.event.extendedProps);
          return (
            <div className='flex items-center gap-2'>
              <span className={`w-2 h-2 rounded-full ${cor}`}></span>
              <span>{arg.event.title}</span>
            </div>
          );
        }}
      />
      <EventsByDateModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        events={eventsOfSelectedDay}
        onEdit={(event, forcedDate) => {
          if (event) {
            // edição
            setSelectedEvent(event);
            setSelectedDate(event.start);
          } else {
            // novo agendamento
            setSelectedEvent(null);
            setSelectedDate(`${forcedDate}T08:00`);
          }

          setModalOpen(false);
          setCreateModalOpen(true);
        }}
      />
      <EventModal
        open={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setSelectedEvent(null); // limpa ao fechar
        }}
        date={selectedDate ? `${selectedDate}` : null}
        event={selectedEvent}
        onSave={() => {
          setCreateModalOpen(false);
          setSelectedEvent(null);
          fetchEvents();
        }}
      />
    </div>
  );
}
