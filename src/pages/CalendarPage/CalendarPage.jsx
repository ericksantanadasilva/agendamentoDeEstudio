import Sidebar from '../../components/Sidebar';
import Calendar from '../../components/calendar';
import Header from '../../components/Header';

export default function CalendarPage() {
  return (
    <div className='flex flex-col min-h-screen bg-gray-50 text-gray-900'>
      <Header /> {/* Aqui vai sua logo centralizada e o botão do sidebar */}
      <div className='flex flex-1 overflow-hidden'>
        <Sidebar />
        <div className='flex-1 p-2 overflow-auto'>
          <Calendar />
        </div>
      </div>
    </div>
  );
}
