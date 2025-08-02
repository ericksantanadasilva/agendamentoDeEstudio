import { Bars3Icon } from '@heroicons/react/24/outline';

export const Header = ({ onToggleSidebar }) => {
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
    </header>
  );
};

export default Header;
