import Sidebar from '../../components/Sidebar';
import Calendar from '../../components/calendar';
import Header from '../../components/Header';
import { useState, useEffect } from 'react';

export default function CalendarPage(darkMode, setDarkMode) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
        <div className='flex-1 p-2 overflow-auto pt-18'>
          <Calendar darkMode={darkMode} />
        </div>
      </div>
    </div>
  );
}
