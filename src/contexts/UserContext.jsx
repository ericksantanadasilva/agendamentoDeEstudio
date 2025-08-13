import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Buscar is_admin na tabela users
        const { data: userData, error } = await supabase
          .from('users')
          .select('id, email, is_admin')
          .eq('id', user.id)
          .single();

        if (!error) {
          setCurrentUser(userData);
        }
      }

      setLoadingUser(false);
    };

    fetchUserData();
  }, []);

  return (
    <UserContext.Provider value={{ currentUser, loadingUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
