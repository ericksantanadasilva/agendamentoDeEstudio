import Sidebar from '../../components/Sidebar';
import Calendar from '../../components/calendar';
import Header from '../../components/Header';
import { useState, useEffect } from 'react';
import DayView from '../../components/DayView';

export default function CalendarPage(darkMode, setDarkMode) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayEvents, setDayEvents] = useState([]);

  const onToggleSidebar = () => setIsSidebarOpen(true);
  const onCloseSidebar = () => setIsSidebarOpen(false);

  return (
    <div className='flex flex-col min-h-screen bg-gray-50 text-gray-900 dark:bg-neutral-950 dark:text-gray-100'>
      <Header
        onToggleSidebar={onToggleSidebar}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
      <div className='flex flex-1 overflow-hidden'>
        <Sidebar isOpen={isSidebarOpen} onClose={onCloseSidebar} />
        <div className='flex-1 flex flex-col p-2 overflow-auto pt-18'>
          <div className='flex-1 overflow-auto'>
            <Calendar
              darkMode={darkMode}
              onDayClick={(date, events) => {
                setSelectedDate(date);
                setDayEvents(events);
              }}
            />
          </div>
          {/* DayView abaixo do calendário */}
          {selectedDate && (
            <div className='mt-4 border-t pt-4'>
              <h2 className='text-lg font-semibold mb-2'>
                Agenda do dia{' '}
                {new Date(`${selectedDate}T12:00:00`).toLocaleDateString(
                  'pt-BR'
                )}
              </h2>
              <DayView events={dayEvents} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
