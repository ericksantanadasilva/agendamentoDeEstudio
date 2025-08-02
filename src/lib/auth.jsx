import { supabase } from './supabase';

export const handleGoogleLogin = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'http://192.168.0.103:5173/agenda',
    },
  });

  if (error) {
    console.error('Erro ao fazer login com o Google: ', error.message);
  }
};

export const handleRegisterWithEmail = async (email, password, navigate) => {
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    alert('Erro ao cadastrar ' + error.message);
  } else {
    alert('Cadastro realizado! Você pode fazer login agora.');
    navigate('/');
  }
};

export const handleLoginWithEmail = async (email, password, navigate) => {
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    alert('Erro ao fazer login: ' + error.message);
  } else {
    navigate('/agenda');
  }
};

export const logout = async () => {
  await supabase.auth.signOut();
};

export default handleGoogleLogin;
