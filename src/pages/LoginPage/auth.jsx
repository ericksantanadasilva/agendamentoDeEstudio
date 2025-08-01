import { supabase } from '../../lib/supabase';

export const handleGoogleLogin = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'http://localhost:5173/agenda',
    },
  });

  if (error) {
    console.error('Erro ao fazer login com o Google: ', error.message);
  }
};

export const handleRegisterWithEmail = async (email, password) => {
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    alert('Erro ao cadastrar ' + error.message);
  } else {
    alert('Cadastro realizado! Você pode fazer login agora.');
    window.location.href = '/';
  }
};

export const handleLoginWithEmail = async (email, password) => {
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    alert('Erro ao fazer login: ' + error.message);
  } else {
    window.location.href = '/agenda';
  }
};

export default handleGoogleLogin;
