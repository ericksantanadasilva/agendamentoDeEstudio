import { use, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Bars3Icon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';

export const Header = ({ onToggleSidebar }) => {
  const [userName, setUserName] = useState('');
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark'
  );

  // Aplica a classe dark no <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    const fetchUserName = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Se você estiver salvando o nome em 'user.user_metadata.name' (com Google)
        const nameFromMetadata = user.user_metadata?.name;

        // Se estiver salvando nome manualmente no cadastro (ex: em 'full_name')
        const nameFromCustomField = user.user_metadata?.full_name;

        const fullName = nameFromMetadata || nameFromCustomField || 'Usuario';
        const firstName = fullName.split(' ')[0];
        const capitalized =
          firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();

        setUserName(capitalized);
      }
    };
    fetchUserName();
  }, []);

  return (
    <header className='w-full flex items-center justify-between px-4 md:px-6 py-2 bg-[#f8f9fa] shadow-sm fixed top-0 left-0 z-50 h-16 dark:bg-neutral-950 border-b'>
      {/* Botao Sidebar */}
      <button
        onClick={onToggleSidebar}
        className='text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white'
      >
        <Bars3Icon className='h-6 w-6' />
      </button>

      {/* Logo centralizada */}
      <div className='absolute left-1/2 transform -translate-1/2 mt-9'>
        <img
          src={darkMode ? 'logo_branco.png' : 'logo pequeno.png'}
          alt='Logo'
          className='h-10'
        />
      </div>

      {/* espaço pra balancear a logo */}
      <div className='w-7 md:w-8' />

      {/* Lado direito */}
      <div className='flex items-center gap-4 mr-4 dark:text-gray-200'>
        <span className='hidden sm:block'>Olá, {userName}</span>

        {/* Toggle Dark/Light */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className='p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition'
          title={darkMode ? 'Modo claro' : 'Modo escuro'}
        >
          {darkMode ? (
            <SunIcon className='h-5 w-5 text-yellow-400' />
          ) : (
            <MoonIcon className='h-5 w-5 text-gray-800' />
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
