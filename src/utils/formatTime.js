export function formatTime(time) {
  if (!time) return '';

  // se vier no formato "HH:MM:SS", corta os segundos
  if (/^\d{2}:\d{2}:\d{2}$/.test(time)) {
    return time.slice(0, 5); // "HH:MM"
  }

  // se vier no formato "HH:MM", mantém
  if (/^\d{2}:\d{2}$/.test(time)) {
    return time;
  }

  // fallback — se for uma data ISO ou outro formato
  const date = new Date(time);
  if (!isNaN(date)) {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // se não for nada reconhecido, retorna o original
  return time;
}
