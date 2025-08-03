import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Bars3Icon } from '@heroicons/react/24/outline';

export const Header = ({ onToggleSidebar }) => {
  const [userName, setUserName] = useState('');
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
    <header className='w-full flex items-center justify-between px-4 md:px-6 py-2 bg-[#f8f9fa] shadow-sm fixed top-0 left-0 z-50 h-16'>
      {/* Botao Sidebar */}
      <button
        onClick={onToggleSidebar}
        className='text-gray-700 hover:text-gray-900'
      >
        <Bars3Icon className='h-6 w-6' />
      </button>

      {/* Logo centralizada */}
      <div className='absolute left-1/2 transform -translate-1/2 mt-9'>
        <img src='logo pequeno.png' alt='Logo' className='h-10' />
      </div>

      {/* espaço pra balancear a logo */}
      <div className='w-7 md:w-8' />

      {/* Saudação */}
      <div className='text-sm md:text-base text-gray-700 mr-5 mt-1'>
        Olá, {userName}
      </div>
    </header>
  );
};

export default Header;
