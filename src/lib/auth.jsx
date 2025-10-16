import { supabase } from './supabase';
import { populateTables } from './populateTables';

// Login com Google
export const handleGoogleLogin = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: import.meta.env.VITE_REDIRECT_URL,
    },
  });

  if (error) {
    console.error('Erro ao fazer login com o Google: ', error.message);
  }

  // OBS: Se usar redirectTo, o usuário só estará disponível após o redirecionamento.
  // Você deve chamar populateTables depois do retorno, por exemplo:
  // const { data: { user } } = await supabase.auth.getUser();
  // if (user) await populateTables(user);
};

// Registro por email e senha
export const handleRegisterWithEmail = async (
  email,
  password,
  name,
  navigate
) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      },
    },
  });

  if (error) {
    alert('Erro ao cadastrar: ' + error.message);
  } else {
    alert('Cadastro realizado! Você pode fazer login agora.');
    navigate('/');
  }
};

// Login com email e senha
export const handleLoginWithEmail = async (email, password, navigate) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    alert('Erro ao fazer login: ' + error.message);
  } else if (data?.user) {
    await populateTables(data.user); // popula tabelas para usuários existentes
    navigate('/agenda');
  }
};

// Logout
export const logout = async () => {
  await supabase.auth.signOut();
};

export default handleGoogleLogin;
