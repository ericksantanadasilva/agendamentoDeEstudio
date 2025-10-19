import Sidebar from '../../components/Sidebar';
import Calendar from '../../components/calendar';
import Header from '../../components/Header';
import { useState, useEffect } from 'react';

export default function CalendarPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const onToggleSidebar = () => setIsSidebarOpen(true);
  const onCloseSidebar = () => setIsSidebarOpen(false);

  // Aplica a classe dark no html
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className='flex flex-col min-h-screen bg-gray-50 text-gray-900 dark:bg-neutral-950 dark:text-gray-100'>
      <Header onToggleSidebar={onToggleSidebar} darkMode={darkMode} />
      <div className='flex flex-1 overflow-hidden'>
        <Sidebar isOpen={isSidebarOpen} onClose={onCloseSidebar} />
        <div className='flex-1 p-2 overflow-auto pt-18'>
          <Calendar darkMode={darkMode} />
        </div>
      </div>

      {/* Toggle de tema */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className='fixed bottom-4 right-4 p-2 bg-gray-200 dark:bg-gray-700 rounded shadow text-gray-800 dark:text-gray-100'
      >
        {darkMode ? 'Modo Claro' : 'Modo Escuro'}
      </button>
    </div>
  );
}
