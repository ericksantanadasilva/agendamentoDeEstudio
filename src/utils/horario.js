// Converte 'HH:mm' para minutos desde 00:00
export function horaParaMinutos(hora) {
  const [h, m, s] = hora.split(':').map(Number);
  return h * 60 + m + Math.floor((s || 0) / 60);
}

// Converte minutos desde 00:00 para 'HH:mm'
export function minutosParaHora(minutos) {
  const h = String(Math.floor(minutos / 60)).padStart(2, '0');
  const m = String(minutos % 60).padStart(2, '0');
  return `${h}:${m}`;
}

// Verifica se dois intervalos de tempo se sobrepõem
export function temSobreposicao(inicio1, fim1, inicio2, fim2) {
  return inicio1 < fim2 && inicio2 < fim1;
}
