import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import '@fullcalendar/core/locales/pt-br';
import { useEffect } from 'react';
import '../styles/fullcalendar-overrides.css';

export default function Calendar() {
  useEffect(() => {
    document.body.classList.add('dark'); // Ativa o modo escuro do Tailwind
  }, []);

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
        selectable={true}
        dayCellClassNames={() => 'rounded-md overflow-hidden'}
        eventClassNames={() =>
          'bg-blue-600 text-white text-sm px-2 py-1 rounded shadow'
        }
        dayHeaderClassNames={() => 'text-zinc-100 bg-zinc-800 py-2'}
      />
    </div>
  );
}
