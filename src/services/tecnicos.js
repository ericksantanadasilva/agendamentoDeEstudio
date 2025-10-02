import { supabase } from '@/lib/supabase';
import { horaParaMinutos, minutosParaHora } from '@/utils/horario';

export async function buscarTecnicos(estudio, diaSemana, horaInicio, horaFim) {
  const { data, error } = await supabase
    .from('escala_tecnicos')
    .select('*')
    .eq('estudio', estudio)
    .eq('dia_semana', diaSemana)
    .eq('ativo', true);

  if (error) {
    console.error('Erro ao buscar tecnicos:', error);
    return { erro: 'Erro ao buscar técnicos', blocos: [] };
  }

  const tecnicosFiltrados = data.filter((t) => t.estudio && t.dia_semana);

  if (tecnicosFiltrados.length === 0) {
    return { erro: '❌ Nenhum técnico disponível', blocos: [] };
  }

  const inicio = horaParaMinutos(horaInicio);
  const fim = horaParaMinutos(horaFim);

  const tecnicosOrdenados = tecnicosFiltrados
    .map((t) => ({
      ...t,
      inicioMin: horaParaMinutos(t.hora_inicio),
      fimMin: horaParaMinutos(t.hora_fim),
      nome: t.tecnico_nome || t.nome || 'Desconhecido',
    }))
    .sort((a, b) => a.inicioMin - b.inicioMin);

  let atual = inicio;
  const resultado = [];

  while (atual < fim) {
    const disponiveis = tecnicosOrdenados.filter(
      (t) => t.inicioMin <= atual && t.fimMin > atual
    );

    console.log(
      'minuto atual:',
      minutosParaHora(atual),
      'Disponiveis:',
      disponiveis.map((t) => `${t.nome} (${t.inicioMin}-${t.fimMin})`)
    );

    if (disponiveis.length === 0) {
      console.warn(
        'nenhum técnico disponível para o horário:',
        minutosParaHora(atual)
      );
      return {
        erro: '❌ Nenhum técnico disponível para o horário selecionado',
        blocos: [],
      };
    }

    const proxFim = Math.min(...disponiveis.map((t) => t.fimMin), fim);

    resultado.push({
      inicio: minutosParaHora(atual),
      fim: minutosParaHora(proxFim),
      tecnicos: disponiveis.map((t) => t.nome),
    });

    atual = proxFim;
  }

  console.log('Resultado final: ', resultado);

  const tecnicosCobrindoTudo = tecnicosOrdenados
    .filter((t) => t.inicioMin <= inicio && t.fimMin >= fim)
    .map((t) => t.tecnico_nome);

  if (tecnicosCobrindoTudo.length > 0) {
    console.log('tecnicos cobrindo todo o periodo: ', tecnicosCobrindoTudo);
    return {
      erro: null,
      blocos: resultado,
      tecnicos: tecnicosCobrindoTudo,
    };
  }

  //se nao houver técnico único, retorna todos em revezamento
  const todosTecnicos = [...new Set(resultado.flatMap((b) => b.tecnicos))];
  console.log('Revezamento necessário:', todosTecnicos);

  return { erro: null, blocos: resultado, tecnicos: todosTecnicos };
}
