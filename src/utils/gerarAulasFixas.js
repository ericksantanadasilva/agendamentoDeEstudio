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

// formata Date -> 'YYYY-MM-DD'
function formatDateYYYYMMDD(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// normaliza hora: aceita 'HH:MM' ou 'HH:MM:SS' e garante 'HH:MM:SS'
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
 * - quantidade: número
 * - repetirPor: 'semanas' | 'meses'
 */
export async function gerarAulasFixas({ dataInicial, quantidade, repetirPor }) {
  const { data: aulas, error: errAulas } = await supabase
    .from('aulas_fixas')
    .select('*');

  if (errAulas) {
    console.error('Erro ao buscar aulas_fixas:', errAulas);
    return;
  }
  if (!aulas || aulas.length === 0) return;

  const inicio =
    dataInicial instanceof Date ? new Date(dataInicial) : new Date(dataInicial);
  const fim = new Date(inicio);
  if (repetirPor === 'semanas') fim.setDate(fim.getDate() + quantidade * 7);
  else fim.setMonth(fim.getMonth() + quantidade);

  for (const aula of aulas) {
    const diaTexto = (aula.dia_semana || '').toLowerCase();
    const diaNum = diasSemanaMap[diaTexto];
    if (diaNum === undefined) {
      console.warn('Dia inválido em aulas_fixas:', aula.dia_semana);
      continue;
    }

    const occurrences = gerarDatasOcorrencias(inicio, fim, diaNum);

    // normaliza hora (garante HH:MM:SS)
    const startTime = normalizeTime((aula.hora_inicio || '').slice(0, 8));
    const endTime = normalizeTime((aula.hora_fim || '').slice(0, 8));

    // ajustar estudio -> studio (remove prefixo "estudio " se houver)
    const studio = aula.estudio;

    for (const occ of occurrences) {
      const dateStr = formatDateYYYYMMDD(occ);

      // Verifica overlap no mesmo dia:
      // overlap se existing.start < newEnd AND existing.end > newStart
      const { data: conflitos, error: errConflito } = await supabase
        .from('agendamentos')
        .select('*')
        .eq('date', dateStr) // mesmo dia
        .eq('studio', studio) // mesmo estúdio
        .lt('start', endTime) // existing.start < newEnd
        .gt('end', startTime); // existing.end > newStart

      if (errConflito) {
        console.error('Erro checando conflito:', errConflito);
        // se quiser abortar toda a geração, descomente:
        // throw errConflito;
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

      // Inserir agendamento (date: date, start: time, end: time)
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
        // continua com as próximas ocorrências
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

function gerarDatasOcorrencias(inicio, fim, diaSemana) {
  const datas = [];
  const first = new Date(inicio);
  while (first.getDay() !== diaSemana) first.setDate(first.getDate() + 1);
  let current = new Date(first);
  while (current <= fim) {
    datas.push(new Date(current));
    current.setDate(current.getDate() + 7);
  }
  return datas;
}
