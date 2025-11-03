import { useEffect, useState } from 'react';

const studios = ['Estudio 170', 'Estudio 120', 'Remoto']; // nomes EXATOS esperados

const DayView = ({ events = [] }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(t);
  }, []);

  const startHour = 6;
  const endHour = 23;
  const totalMinutes = (endHour - startHour) * 60;

  const minutesFromStart = (date) => {
    // aceita Date ou string ISO
    const d = typeof date === 'string' ? new Date(date) : date;
    return (d.getHours() - startHour) * 60 + d.getMinutes();
  };

  const currentMins = minutesFromStart(now);
  const currentPosPct = (currentMins / totalMinutes) * 100;

  return (
    <div className='w-full border rounded-lg overflow-hidden bg-white dark:bg-neutral-900'>
      {/* HEADER: coluna vazia (para horas) + área com 3 colunas */}
      <div className='flex items-stretch'>
        {/* spacer (mesma largura da coluna de horas no body) */}
        <div className='w-16' />
        {/* right area header: grid de 3 colunas */}
        <div className='flex-1 grid grid-cols-3'>
          {studios.map((s, i) => (
            <div
              key={s}
              className={`text-center font-semibold p-2 border-b border-r ${
                i === studios.length - 1 ? 'border-r-0' : ''
              } bg-gray-100 dark:bg-neutral-800 text-sm`}
            >
              {s}
            </div>
          ))}
        </div>
      </div>

      {/* BODY */}
      <div
        className='relative flex pb-10'
        style={{ height: '820px' /* ajuste a altura que quiser */ }}
      >
        {/* col horas */}
        <div className='w-16 relative'>
          {[...Array(endHour - startHour + 1)].map((_, i) => {
            const hour = startHour + i;
            const top = ((i * 60) / totalMinutes) * 100;
            return (
              <div
                key={hour}
                className='absolute left-0 right-0 text-xs text-gray-500 dark:text-gray-400'
                style={{ top: `${top}%`, transform: 'translateY(-50%)' }}
              >
                <div className='pr-2 text-right'>{`${hour
                  .toString()
                  .padStart(2, '0')}:00`}</div>
              </div>
            );
          })}
        </div>

        {/* right area: grid de 3 colunas (cada coluna position:relative para eventos absolutos) */}
        <div className='flex-1 relative'>
          {/* linhas horizontais que cruzam todas as colunas */}
          {[...Array(endHour - startHour + 1)].map((_, i) => {
            const top = ((i * 60) / totalMinutes) * 100;
            return (
              <div
                key={'line-' + i}
                className='absolute left-0 right-0 border-t border-gray-200 dark:border-neutral-700'
                style={{ top: `${top}%` }}
              />
            );
          })}

          {/* linha vermelha do horário atual (aparece apenas se estiver dentro do range) */}
          {currentMins >= 0 && currentMins <= totalMinutes && (
            <div
              className='absolute left-0 right-0 pointer-events-none'
              style={{
                top: `${currentPosPct}%`,
                transform: 'translateY(-1px)',
              }}
            >
              <div className='border-t-2 border-red-500' />
            </div>
          )}

          {/* grid de colunas por estúdio — cada célula é relative */}
          <div className='absolute inset-0 grid grid-cols-3'>
            {studios.map((studio, colIndex) => (
              <div
                key={studio}
                className={`relative ${
                  colIndex < studios.length - 1
                    ? 'border-r border-gray-200 dark:border-neutral-700'
                    : ''
                }`}
              >
                {/* eventos desta coluna */}
                {events
                  .filter((e) => e.studio === studio)
                  .map((ev, idx) => {
                    // ev.start / ev.end devem ser strings ISO ou Date
                    const start =
                      typeof ev.start === 'string'
                        ? new Date(ev.start)
                        : ev.start;
                    const end =
                      typeof ev.end === 'string' ? new Date(ev.end) : ev.end;

                    const sMins = minutesFromStart(start);
                    const eMins = minutesFromStart(end);

                    // descartar fora do range
                    if (eMins <= 0 || sMins >= totalMinutes) return null;

                    const topPct = (Math.max(sMins, 0) / totalMinutes) * 100;
                    const bottomPct =
                      (Math.min(eMins, totalMinutes) / totalMinutes) * 100;
                    const heightPct = bottomPct - topPct;

                    return (
                      <div
                        key={idx}
                        className='absolute left-2 right-2 rounded-md bg-blue-600 text-white p-1 shadow text-sm overflow-hidden'
                        style={{
                          top: `${topPct}%`,
                          height: `${heightPct}%`,
                        }}
                        title={`${ev.title} — ${start
                          .getHours()
                          .toString()
                          .padStart(2, '0')}:${start
                          .getMinutes()
                          .toString()
                          .padStart(2, '0')} - ${end
                          .getHours()
                          .toString()
                          .padStart(2, '0')}:${end
                          .getMinutes()
                          .toString()
                          .padStart(2, '0')}`}
                      >
                        <div className='truncate font-medium'>{ev.title}</div>
                        <div className='text-[10px] opacity-80'>
                          {`${start
                            .getHours()
                            .toString()
                            .padStart(2, '0')}:${start
                            .getMinutes()
                            .toString()
                            .padStart(2, '0')} - ${end
                            .getHours()
                            .toString()
                            .padStart(2, '0')}:${end
                            .getMinutes()
                            .toString()
                            .padStart(2, '0')}`}
                        </div>
                      </div>
                    );
                  })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayView;
