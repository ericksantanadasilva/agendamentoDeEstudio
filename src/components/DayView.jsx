import { useEffect, useState } from 'react';

const studios = ['Estudio 170', 'Estudio 120', 'Estudio Remoto'];

const DayView = ({ events }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const startHour = 6;
  const endHour = 23;

  const getMinutesFromStart = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return (hours - startHour) * 60 + minutes;
  };

  const totalMinutes = (endHour - startHour) * 60;
  const currentMinutes = getMinutesFromStart(currentTime);
  const currentPosition = (currentMinutes / totalMinutes) * 100;

  return (
    <div className='relative border rounded-lg overflow-hidden'>
      {/* cabeçalho dos estúdios */}
      <div className='grid grid-cols-3 text-center font-semibold border-b bg-gray-100 dark:bg-neutral-800'>
        {studios.map((studio) => (
          <div key={studio} className='p-2'>
            {studio}
          </div>
        ))}
      </div>

      {/* corpo com horários */}
      <div className='relative h-[1500px] grid grid-cols-3 border-t'>
        {/* linhas de hora */}
        {[...Array(endHour - startHour + 1)].map((_, i) => {
          const hour = startHour + i;
          return (
            <div
              key={hour}
              className='absolute left-0 w-full border-t borer-gray-200 text-xs text-gray-400'
              style={{ top: `${((i * 60) / totalMinutes) * 100}%` }}
            >
              <div className='absolute -left-10'>{hour}</div>
            </div>
          );
        })}

        {/* linha vermelha do horario atual */}
        <div
          className='absolute left-0 w-full border-t-2 border-red-500'
          style={{ top: `${currentPosition}%` }}
        />

        {/* eventos */}
        {events.map((event, i) => {
          const start = new Date(event.start);
          const end = new Date(event.end);
          const startMins = getMinutesFromStart(start);
          const endMins = getMinutesFromStart(end);
          const top = (startMins / totalMinutes) * 100;
          const height = ((endMins - startMins) / totalMinutes) * 100;
          const colIndex = studios.indexOf(event.studio);

          return (
            <div
              key={i}
              className='absolute mx-1 p-1 rounded text-white bg-blue-600'
              style={{
                top: `${top}%`,
                height: `${height}%`,
                left: `${(colIndex / 3) * 100}%`,
                width: `${100 / 3}%`,
              }}
            >
              {event.title}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DayView;
