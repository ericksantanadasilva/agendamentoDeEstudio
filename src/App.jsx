import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage';
import CalendarPage from './pages/CalendarPage/CalendarPage';
import ProtectedRoute from './components/ProtectedRoute';
import RegisterPage from './pages/LoginPage/RegisterPage';
import UserPage from './pages/UserPage/UserPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<LoginPage />} />
        <Route
          path='/agenda'
          element={
            <ProtectedRoute>
              <CalendarPage />
            </ProtectedRoute>
          }
        />
        <Route path='/register' element={<RegisterPage />} />
        <Route
          path='/meus-agendamentos'
          element={
            <ProtectedRoute>
              <UserPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
