import { useUser } from '@/contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import {
  CalendarIcon,
  ArrowLeftEndOnRectangleIcon,
  ListBulletIcon,
  XMarkIcon,
  UserPlusIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import { logout } from '../lib/auth';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

export const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user ?? null);
    };
    getUser();
  }, []);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleBackdropClick = () => {
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          className='fixed inset-0 bg-slate-950 opacity-50 z-60'
          onClick={handleBackdropClick}
        ></div>
      )}
      <div
        className={`fixed top-0 left-0 h-full bg-gray-800 text-white w-64 p-4 shadow-lg transform transition-transform duration-300 z-60 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={handleBackdropClick}
          className='absolute top-4 right-4 text-white'
        >
          <XMarkIcon className='h-6 w-6' />
        </button>
        <div>
          <h1 className='text-2xl font-bold mb-6'>Menu</h1>

          <div className='items-center flex gap-2 mb-5 border-b pb-4'>
            <Avatar>
              <AvatarImage
                src={
                  user.user_metadata?.avatar_url ??
                  user.user_metadata?.picture ??
                  undefined
                }
                alt={user.user_metadata?.full_name ?? user.email ?? 'Avatar'}
              />
              <AvatarFallback>
                {user.user_metadata?.full_name?.[0] ?? '?'}
              </AvatarFallback>
            </Avatar>

            <div className='ml-1'>
              <p className='font-bold'>
                {user.user_metadata?.full_name ?? user.email}
              </p>
              <p className='text-xs'>{user.email}</p>
            </div>
          </div>

          <nav className='ml-4'>
            <ul className='space-y-4'>
              <li
                className='flex items-center space-x-2 cursor-pointer hover:text-gray-300'
                onClick={() => {
                  navigate('/agenda');
                  setIsOpen(false);
                }}
              >
                <CalendarIcon className='h-6 w-6' />
                <span>Agenda</span>
              </li>
              <li
                className='flex items-center space-x-2 cursor-pointer hover:text-gray-300'
                onClick={() => {
                  navigate('/meus-agendamentos');
                  setIsOpen(false);
                }}
              >
                <ListBulletIcon className='h-6 w-6' />
                <span>Meus agendamentos</span>
              </li>
              {currentUser?.is_admin && (
                <li
                  className='flex items-center space-x-2 cursor-pointer hover:text-gray-300'
                  onClick={() => {
                    navigate('/admin');
                    onclose();
                  }}
                >
                  <UserPlusIcon className='h-6 w-6' />
                  <span>Admin</span>
                </li>
              )}

              {currentUser?.is_management && (
                <li
                  className='flex items-center space-x-2 cursor-pointer hover:text-gray-300'
                  onClick={() => {
                    navigate('/Gerencia');
                    onclose();
                  }}
                >
                  <WrenchScrewdriverIcon className='h-6 w-6' />
                  <span>Gerência</span>
                </li>
              )}
            </ul>
          </nav>
        </div>
        <div className='absolute bottom-4 left-7'>
          <button
            onClick={handleLogout}
            className='flex items-center space-x-2 text-red-400 hover:text-red-600'
          >
            <ArrowLeftEndOnRectangleIcon className='h-6 w-6' />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
