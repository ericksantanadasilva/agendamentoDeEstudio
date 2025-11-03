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
import { gerarFeriadosRJ } from '@/utils/feriadosRJ';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from './ui/alert-dialog';

export default function Calendar({ darkMode, onDayClick }) {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [eventsOfSelectedDay, setEventsOfSelectedDay] = useState([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [feriados, setFeriados] = useState([]);
  const [feriadoAtivo, setFeriadoAtivo] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, [darkMode]);

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

  const gerarFeriadosDoAno = (ano) => {
    return gerarFeriadosRJ(ano).map((f) => ({
      ...f,
      start: (f.start || '').split('T')[0],
      className: 'feriado',
      isFeriado: true,
    }));
  };

  const gerarFeriadosParaIntervalo = (startDate, endDate) => {
    const startYear = new Date(startDate).getFullYear();
    const endYear = new Date(endDate).getFullYear();
    let anos = [];
    for (let y = startYear; y <= endYear; y++) anos.push(y);

    const todos = anos.flatMap((y) => gerarFeriadosDoAno(y));

    const map = new Map();
    todos.forEach((f) => {
      const key = `${f.start}::${f.title}`;
      if (!map.has(key)) map.set(key, f);
    });
    setFeriados(Array.from(map.values()));
  };

  const handleDateClick = (info) => {
    const dataClicada = info.dateStr;
    const feriado = feriados.find((f) => f.start === dataClicada);

    if (feriado) {
      setFeriadoAtivo(feriado);
      return;
    }

    const eventosNoDia = events.filter((e) => e.start.startsWith(dataClicada));
    setSelectedDate(dataClicada);
    setEventsOfSelectedDay(eventosNoDia);
    // setSelectedEvent(null);
    // setCreateModalOpen(true);

    if (onDayClick) onDayClick(dataClicada, eventosNoDia);
  };

  const handleEventClick = (info) => {
    const clickedDate = info.event.startStr.slice(0, 10);
    const feriado = feriados.find((f) => f.start === clickedDate);

    if (feriado) {
      setFeriadoAtivo(feriado);
      return;
    }
    const eventosNoDia = events.filter((e) => e.start.startsWith(clickedDate));
    setEventsOfSelectedDay(eventosNoDia);
    setModalOpen(true);

    if (onDayClick) onDayClick(clickedDate, eventosNoDia);
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
    <div className='px-4 sm:px-6 lg:px-8 max-w-screen overflow-hidden'>
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
        datesSet={(arg) => {
          gerarFeriadosParaIntervalo(arg.start, arg.end);
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
        selectable={true}
        dayCellClassNames={() => 'rounded-md overflow-hidden'}
        eventClassNames={() =>
          'bg-transparent text-gray-800 dark:text-gray-200 text-sm px-2 py-1 rounded shadow dark:shadow-neutral-900 cursor-pointer'
        }
        events={[...events, ...feriados]}
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

      <AlertDialog
        open={!!feriadoAtivo}
        onOpenChange={() => setFeriadoAtivo(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Feriado: {feriadoAtivo?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              Este dia é um feriado. Agendamentos não podem ser feitos em
              feriados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Fechar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
