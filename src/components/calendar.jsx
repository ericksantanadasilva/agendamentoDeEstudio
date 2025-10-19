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

export default function Calendar({ darkMode }) {
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
    if (error) return console.error(error);

    const formatted = data.map((evento) => ({
      id: evento.id,
      title: `${evento.materia} - ${evento.gravacao}`,
      start: `${evento.date}T${evento.start}`,
      end: `${evento.date}T${evento.end}`,
      extendedProps: { ...evento },
    }));

    setEvents(formatted);
  };

  const handleDateClick = (info) => {
    setSelectedDate(info.dateStr);
    setSelectedEvent(null);
    setCreateModalOpen(true);
  };

  const handleEventClick = (info) => {
    const clickedDate = info.event.startStr.slice(0, 10);
    const eventosNoDia = events.filter((e) => e.start.startsWith(clickedDate));
    setEventsOfSelectedDay(eventosNoDia);
    setModalOpen(true);
  };

  const getEventColor = (evento) => {
    const cores = darkMode
      ? {
          'Estudio 120': 'bg-purple-400',
          'Estudio 170': 'bg-green-400',
          Remoto: 'bg-red-400',
        }
      : {
          'Estudio 120': 'bg-purple-600',
          'Estudio 170': 'bg-green-600',
          Remoto: 'bg-red-600',
        };

    return cores[evento.studio] || (darkMode ? 'bg-gray-500' : 'bg-gray-400');
  };

  return (
    <div className='px-4 sm:px-6 lg:px-8 max-w-screen overflow-x-hidden'>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView='dayGridMonth'
        locale='pt-br'
        dayMaxEvents={false}
        views={{ dayGridMonth: { moreLinkText: (n) => `+${n} eventos` } }}
        moreLinkClick={(arg) => {
          const clickedDateISO = arg.date.toISOString().slice(0, 10);
          setEventsOfSelectedDay(
            events.filter((e) => e.start.startsWith(clickedDateISO))
          );
          setModalOpen(true);
          return 'none';
        }}
        headerToolbar={{ start: '', center: 'title', end: 'today prev,next' }}
        buttonText={{ today: 'Hoje', month: 'Mês', week: 'Semana', day: 'Dia' }}
        height='auto'
        contentHeight='auto'
        fixedWeekCount={false}
        aspectRatio={1.5}
        dayMaxEventRows={3}
        nowIndicator
        editable={false}
        selectable={false}
        dayCellClassNames={() => 'rounded-md overflow-hidden'}
        eventClassNames={() =>
          'bg-transparent text-gray-800 dark:text-gray-200 text-sm px-2 py-1 rounded shadow dark:shadow-neutral-900 cursor-pointer'
        }
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
          setSelectedEvent(event || null);
          setSelectedDate(event?.start || `${forcedDate}T08:00`);
          setModalOpen(false);
          setCreateModalOpen(true);
        }}
      />

      <EventModal
        open={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setSelectedEvent(null);
        }}
        date={selectedDate}
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
