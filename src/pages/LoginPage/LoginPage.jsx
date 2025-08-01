import { useState } from 'react';
import {
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';
import handleGoogleLogin from './auth';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className='min-h-screen bg-gradient-to-b from-blue-700 to-fuchsia-500 flex items-center justify-center'>
      <div className='bg-white rounded-3xl shadow-xl w-full max-w-sm p-8 text-center'>
        <img src='logo.png' alt='logo foco medicina' />

        <button
          onClick={handleGoogleLogin}
          className='w-full flex items-center justify-center gap-2 border rounded-md py-2 text-gray-700 hover:bg-gray-100 transition mb-4'
        >
          <img src='google.svg' alt='logo Google' className='h-5 w-5' />
          <span>Continuar com o Google</span>
        </button>

        <div className='flex items-center border rounded-md px-3 py-2 mb-3'>
          <UserIcon className='h-5 w-5 text-gray-400' />
          <input
            type='email'
            placeholder='Email'
            id='email'
            name='email'
            className='ml-2 outline-none flex-1 bg-transparent'
            autoComplete='email'
            required
          />
        </div>

        <div className='flex items-center border rounded-md px-3 py-2 mb-1'>
          <KeyIcon className='h-5 w-5 text-gray-400' />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder='Senha'
            name='password'
            id='password'
            className='ml-2 outline-none flex-1 bg-transparent'
            autoComplete='current-password'
            required
          />
          <button type='button' onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? (
              <EyeSlashIcon className='h-5 w-5 text-gray-400' />
            ) : (
              <EyeIcon className='h-5 w-5 text-gray-400' />
            )}
          </button>
        </div>

        <p className='text-sm text-gray-500 mb-4 cursor-pointer hover:underline'>
          Esqueceu o seu usuário ou senha?
        </p>

        <button className='bg-purple-600 hover:bg-purple-700 text-white w-full py-2 rounded-md font-semibold cursor-pointer'>
          Acessar
        </button>
      </div>
    </div>
  );
}
