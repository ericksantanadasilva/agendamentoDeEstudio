import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import '@fullcalendar/core/locales/pt-br';
import { useEffect, useState } from 'react';
import '../styles/fullcalendar-overrides.css';
import { supabase } from '../lib/supabase';

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
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
            tipo: evento.tipo,
            user_email: evento.user_email,
            user_id: evento.user_id,
          },
        };
      });
      setEvents(formatted);
      console.log('dados recebidos do supabase: ', data);
      console.log('Eventos formatados: ', formatted);
    };
    fetchEvents();
  }, []);

  const handleDateClick = (info) => {
    setSelectedDate(info.dateStr);
    setSelectedEvent(null);
    // abrir modal de criação aqui
    console.log('abrir modal de criação para ', info.dateStr);
  };

  const handleEventClick = (info) => {
    setSelectedEvent(info.event.extendedProps);
    setSelectedDate(null);
    //abrir modal de ediçao aqui
    console.log('abrir modal de ediçao para ', info.event.extendedProps);
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
    </div>
  );
}
