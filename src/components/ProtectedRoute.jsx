import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function ProtectedRoute({
  children,
  requireAdmin = false,
  requireManagement = false,
}) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setIsAuthenticated(true);

        //buscar dados do usuario
        const { data, error } = await supabase
          .from('users')
          .select('id, email, is_admin, is_management')
          .eq('id', session.user.id)
          .single();

        if (!error && data) {
          setUserData(data);
        }
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  if (loading) return null;

  // Se não tiver logado redireciona para a página de login
  if (!isAuthenticated) {
    return <Navigate to='/' replace />;
  }

  // se exigir admin e o usuário não for admin, redireciona
  if (requireAdmin && !userData?.is_admin) {
    return <Navigate to='/agenda' replace />;
  }

  // Se exigir gerencia e o usuário não for de gerencia, redireciona
  if (requireManagement && !userData?.is_management) {
    return <Navigate to='/agenda' replace />;
  }
  return children;
}
