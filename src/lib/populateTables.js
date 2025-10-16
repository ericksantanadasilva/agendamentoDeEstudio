import { is } from 'date-fns/locale';
import { supabase } from './supabase';

export const populateTables = async (user) => {
  if (!user?.id) return;

  const userId = user.id;
  const email = user.email;
  const name =
    user.user_metadata?.name || user.user_metadata?.full_name || email;

  await supabase.from('users').upsert({
    id: userId,
    email,
    is_admin: false,
  });

  await supabase.from('permissoes_usuarios').upsert({
    user_id: userId,
    nome: name,
    pode_editar: false,
    pode_cancelar: false,
  });
};
