import { supabase } from '@/lib/supabase';

export async function registrarLog(
  agendamentoId,
  acao,
  dadosAntes,
  dadosDepois
) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error('Usuario não autenticado, não é possivel registrar log.');
      return;
    }

    const { data, error } = await supabase.from('agendamentos_log').insert([
      {
        agendamento_id: agendamentoId,
        acao,
        alterado_por_email: user.email,
        alterado_por_id: user.id,
        dados_anteriores: dadosAntes || null,
        dados_novos: dadosDepois || null,
      },
    ]);

    if (error) {
      console.error('Erro ao registrar log:', error);
    } else {
      console.log('Log registrado com sucesso', data);
    }
  } catch (err) {
    console.error('Erro inesperado ao registrar log:', err);
  }
}
