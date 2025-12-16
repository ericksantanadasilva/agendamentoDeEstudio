import { supabase } from '../lib/supabase';

// mapa de dias em texto -> número do JS
const diasSemanaMap = {
  domingo: 0,
  segunda: 1,
  terca: 2,
  terça: 2,
  quarta: 3,
  quinta: 4,
  sexta: 5,
  sabado: 6,
  sábado: 6,
};

// ========================
// HELPERS DE DATA
// ========================

// parse seguro para datas vindas de input type="date"
function parseLocalDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// formata Date -> 'YYYY-MM-DD'
function formatDateYYYYMMDD(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// normaliza hora: aceita 'HH:MM' ou 'HH:MM:SS'
function normalizeTime(t) {
  if (!t) return null;
  const parts = t.split(':');
  if (parts.length === 2)
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:00`;
  if (parts.length === 3)
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(
      2,
      '0'
    )}:${parts[2].padStart(2, '0')}`;
  return t;
}

/**
 * gerarAulasFixas
 * - dataInicial: 'YYYY-MM-DD' ou Date
 * - dataFinal: 'YYYY-MM-DD' ou Date
 */
export async function gerarAulasFixas({ dataInicial, dataFinal }) {
  const { data: aulas, error: errAulas } = await supabase
    .from('aulas_fixas')
    .select('*');

  if (errAulas) {
    console.error('Erro ao buscar aulas_fixas:', errAulas);
    return;
  }
  if (!aulas || aulas.length === 0) return;

  const inicio =
    dataInicial instanceof Date ? dataInicial : parseLocalDate(dataInicial);

  const fim = dataFinal instanceof Date ? dataFinal : parseLocalDate(dataFinal);

  // inclui o último dia no intervalo
  fim.setHours(23, 59, 59, 999);

  for (const aula of aulas) {
    const diaTexto = (aula.dia_semana || '').toLowerCase();
    const diaNum = diasSemanaMap[diaTexto];

    if (diaNum === undefined) {
      console.warn('Dia inválido em aulas_fixas:', aula.dia_semana);
      continue;
    }

    const occurrences = gerarDatasNoIntervalo(inicio, fim, diaNum);

    const startTime = normalizeTime((aula.hora_inicio || '').slice(0, 8));
    const endTime = normalizeTime((aula.hora_fim || '').slice(0, 8));

    const studio = aula.estudio;

    for (const occ of occurrences) {
      const dateStr = formatDateYYYYMMDD(occ);

      const { data: conflitos, error: errConflito } = await supabase
        .from('agendamentos')
        .select('*')
        .eq('date', dateStr)
        .eq('studio', studio)
        .lt('start', endTime)
        .gt('end', startTime);

      if (errConflito) {
        console.error('Erro checando conflito:', errConflito);
        continue;
      }

      if (conflitos?.length > 0) {
        console.log(
          'Conflito — ignorando:',
          dateStr,
          startTime,
          endTime,
          'studio:',
          studio
        );
        continue;
      }

      const { error: errInsert } = await supabase.from('agendamentos').insert([
        {
          date: dateStr,
          start: startTime,
          end: endTime,
          studio: studio,
          materia: aula.materia,
          gravacao: aula.proposta,
          professor: aula.professor,
          tecnico: aula.tecnico,
        },
      ]);

      if (errInsert) {
        console.error('Erro inserindo agendamento:', errInsert);
      } else {
        console.log(
          'Agendamento criado:',
          dateStr,
          startTime,
          endTime,
          'studio:',
          studio
        );
      }
    }
  }
}

/**
 * Gera todas as datas de um dia da semana
 * dentro do intervalo [inicio, fim]
 */
function gerarDatasNoIntervalo(inicio, fim, diaSemana) {
  const datas = [];
  let current = new Date(inicio);

  // avança até o primeiro dia da semana correto
  while (current.getDay() !== diaSemana) {
    current.setDate(current.getDate() + 1);
  }

  while (current <= fim) {
    datas.push(new Date(current));
    current.setDate(current.getDate() + 7);
  }

  return datas;
}
