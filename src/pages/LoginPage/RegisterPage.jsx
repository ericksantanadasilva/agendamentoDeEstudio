import { use, useState } from 'react';
import {
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  KeyIcon,
  IdentificationIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { handleRegisterWithEmail } from '../../lib/auth';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleRegisterWithEmail(
      form.email,
      form.password,
      form.name,
      navigate
    );
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-blue-700 to-fuchsia-500 flex items-center justify-center'>
      <div className='bg-white rounded-3xl shadow-xl w-full max-w-sm p-8 text-center'>
        <img src='logo.png' alt='logo foco medicina' className='mx-auto mb-4' />
        <h2 className='text-xl font-bold text-gray-700 mb-4'>Criar Conta</h2>

        <form onSubmit={handleSubmit}>
          <div className='flex items-center border rounded-md px-3 py-2 mb-3'>
            <IdentificationIcon className='h-5 w-5 text-gray-400' />
            <input
              type='text'
              placeholder='Nome'
              name='name'
              value={form.name}
              onChange={handleChange}
              className='ml-2 outline-none flex-1 bg-transparent'
              required
            />
          </div>
          <div className='flex items-center border rounded-md px-3 py-2 mb-3'>
            <UserIcon className='h-5 w-5 text-gray-400' />
            <input
              type='email'
              placeholder='Email'
              name='email'
              value={form.email}
              onChange={handleChange}
              className='ml-2 outline-none flex-1 bg-transparent'
              required
            />
          </div>

          <div className='flex items-center border rounded-md px-3 py-2 mb-3'>
            <KeyIcon className='h-5 w-5 text-gray-400' />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder='Senha'
              name='password'
              value={form.password}
              onChange={handleChange}
              className='ml-2 outline-none flex-1 bg-transparent'
              required
            />
            <button
              type='button'
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeSlashIcon className='h-5 w-5 text-gray-400' />
              ) : (
                <EyeIcon className='h-5 w-5 text-gray-400' />
              )}
            </button>
          </div>

          <button
            type='submit'
            className='bg-purple-600 hover:bg-purple-700 text-white w-full py-2 rounded-md font-semibold'
          >
            Cadastrar
          </button>
        </form>

        <p className='mt-4 text-sm text-gray-500'>
          Já tem uma conta?{' '}
          <a href='/' className='text-purple-600 hover:underline font-medium'>
            Entrar
          </a>
        </p>
      </div>
    </div>
  );
}
