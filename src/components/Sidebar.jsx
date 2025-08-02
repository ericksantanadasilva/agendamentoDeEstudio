import { useNavigate } from 'react-router-dom';
import {
  CalendarIcon,
  ArrowLeftEndOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { logout } from '../lib/auth';
import { useState } from 'react';

export const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

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
          <h1 className='text-2xl font-bold mb-6'>Painel</h1>
          <nav>
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
            </ul>
          </nav>
        </div>
        <div className='absolute bottom-4 left-4'>
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
