import { supabase } from './supabase';

export const populateTables = async (user) => {
  if (!user?.id) return;

  const userId = user.id;
  const email = user.email;
  const name =
    user.user_metadata?.name || user.user_metadata?.full_name || email;

  // Verifica se o usuário já existe
  const { data: existingUser, error: fetchError } = await supabase
    .from('users')
    .select('id, is_admin, is_management')
    .eq('id', userId)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Erro ao buscar usuário:', fetchError);
    return;
  }

  // Só cria se o usuário não existir
  if (!existingUser) {
    await supabase.from('users').insert({
      id: userId,
      email,
      is_admin: false,
      is_management: false,
    });
  }

  // Atualiza ou cria permissões do usuário
  await supabase.from('permissoes_usuarios').upsert({
    user_id: userId,
    nome: name,
    pode_editar: false,
    pode_cancelar: false,
  });
};
