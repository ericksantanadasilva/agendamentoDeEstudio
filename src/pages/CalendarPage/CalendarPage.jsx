import Sidebar from '../../components/Sidebar';
import Calendar from '../../components/calendar';

export default function CalendarPage() {
  return (
    <div className='flex h-screen'>
      <Sidebar />
      <main className='flex-1 p4 overflow-auto bg-gray-100'>
        <Calendar />
      </main>
    </div>
  );
}
