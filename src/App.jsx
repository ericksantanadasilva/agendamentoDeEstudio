import { useEffect } from 'react';
import { supabase } from './lib/supabase';
import { populateTables } from './lib/populateTables';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import LoginPage from './pages/LoginPage/LoginPage';
import CalendarPage from './pages/CalendarPage/CalendarPage';
import ProtectedRoute from './components/ProtectedRoute';
import RegisterPage from './pages/LoginPage/RegisterPage';
import UserPage from './pages/UserPage/UserPage';
import AdminPage from './pages/AdminPage/AdminPage';
import ManagementPage from './pages/ManagementPage/ManagementPage';

export default function App() {
  // Este useEffect vai popular as tabelas para qualquer usuário logado
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await populateTables(user);
      }
    };
    fetchUser();
  }, []);

  return (
    <UserProvider>
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
          <Route
            path='/admin'
            element={
              <ProtectedRoute requireAdmin>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/Gerencia'
            element={
              <ProtectedRoute requireManagement>
                <ManagementPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}
