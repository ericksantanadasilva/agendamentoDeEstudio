import { supabase } from '../../lib/supabase';

const handleGoogleLogin = async () => {
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

export default handleGoogleLogin;
