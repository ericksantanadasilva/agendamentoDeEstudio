import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import '@fullcalendar/core/locales/pt-br';
import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import '../styles/fullcalendar-overrides.css';
import { supabase } from '../lib/supabase';
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

function Calendar({ darkMode, onDayClick, onUpdated }, ref) {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [eventsOfSelectedDay, setEventsOfSelectedDay] = useState([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [feriados, setFeriados] = useState([]);
  const [feriadoAtivo, setFeriadoAtivo] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const fetchEvents = async () => {
    const { data: agendamentos, error: errAg } = await supabase
      .from('agendamentos')
      .select('*');
    if (errAg) return console.error(errAg);

    // bloqueios
    const { data: bloqueios, error: errBl } = await supabase
      .from('estudio_bloqueios')
      .select('*');
    if (errBl) return console.error(errBl);

    const formattedAgendamentos = agendamentos.map((evento) => ({
      id: evento.id,
      title: `${evento.materia} - ${evento.gravacao}`,
      start: `${evento.date}T${evento.start}`,
      end: `${evento.date}T${evento.end}`,
      studio: evento.studio,
      extendedProps: { ...evento },
    }));

    const formattedBloqueios = bloqueios.map((bloqueio) => ({
      id: `bloqueio-${bloqueio.id}`,
      title: `Bloqueio do ${bloqueio.estudio}`,
      start: `${bloqueio.data}T${bloqueio.horario_inicio}`,
      end: `${bloqueio.data}T${bloqueio.horario_fim}`,
      studio: bloqueio.estudio,
      extendedProps: { tipo: 'bloqueio', ...bloqueio },
    }));

    const formatted = [...formattedAgendamentos, ...formattedBloqueios];

    setEvents(formatted);

    if (selectedDate && onDayClick) {
      const eventsOfDay = formatted.filter((ev) => {
        const startDate = ev.start.split('T')[0];
        return startDate === selectedDate;
      });
      onDayClick(selectedDate, eventsOfDay);
    }
  };

  useImperativeHandle(ref, () => ({
    reloadEvents() {
      return fetchEvents();
    },
  }));

  useEffect(() => {
    fetchEvents();
  }, [darkMode]);

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

  let lastClickTime = useRef(0);

  const handleDateClick = (info) => {
    const dataClicada = info.dateStr;
    const feriado = feriados.find((f) => f.start === dataClicada);

    const eventosNoDia = events.filter((e) => e.start.startsWith(dataClicada));
    setSelectedDate(dataClicada);
    setEventsOfSelectedDay(eventosNoDia);
    if (onDayClick) onDayClick(dataClicada, eventosNoDia);

    const now = Date.now();
    if (feriado) {
      if (now - lastClickTime.current < 300) {
        setFeriadoAtivo(feriado);
        return;
      }
    }

    if (now - lastClickTime.current < 300) {
      setSelectedEvent(null);
      setCreateModalOpen(true);
    }
    lastClickTime.current = now;
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
    // setModalOpen(true);

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
        eventClassNames={(arg) => {
          const tipo = arg.event.extendedProps?.tipo;
          const isBloqueio = tipo === 'bloqueio';

          if (isBloqueio) {
            return 'bg-red-400 dark:bg-red-400 text-gray-800 dark:text-gray-200 text-sm px-2 py-1 rounded shadow-none cursor-default pointer-events-none';
          }
          return 'bg-transparent text-gray-800 dark:text-gray-200 text-sm px-2 py-1 rounded shadow dark:shadow-neutral-900 cursor-pointer';
        }}
        events={[...events, ...feriados]}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        eventContent={(arg) => {
          const tipo = arg.event.extendedProps?.tipo;
          const isBloqueio = tipo === 'bloqueio';

          if (isBloqueio) {
            return (
              <div className='flex items-center justify-center w-full'>
                <span>{arg.event.title}</span>
              </div>
            );
          }

          const cor = getEventColor(arg.event.extendedProps);
          return (
            <div className='flex items-center gap-2'>
              <span className={`w-2 h-2 rounded-full ${cor}`}></span>
              <span>{arg.event.title}</span>
            </div>
          );
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
          onUpdated && onUpdated();
        }}
      />

      <EventModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedEvent(null);
        }}
        date={selectedDate}
        event={selectedEvent}
        onSave={() => {
          setEditModalOpen(false);
          setSelectedEvent(null);
          fetchEvents(); // ← AGORA O DELETE ATUALIZA DE FATO
          onUpdated && onUpdated();
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

export default forwardRef(Calendar);
