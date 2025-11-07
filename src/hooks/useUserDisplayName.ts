import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useUserDisplayName = () => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState<string>('Utilizator');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserRole = async () => {
      if (!user) {
        setDisplayName('Utilizator');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching user role:', error);
          setDisplayName('Utilizator');
        } else if (data) {
          // Set display name based on role
          const role = data.role as string;
          if (role === 'admin') {
            setDisplayName('Cristian Coman');
          } else if (role === 'moderator') {
            setDisplayName('Dispecerat');
          } else if (role === 'user') {
            setDisplayName('Guest');
          } else {
            setDisplayName('Utilizator');
          }
        } else {
          // No role found, default to Guest
          setDisplayName('Guest');
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        setDisplayName('Utilizator');
      } finally {
        setLoading(false);
      }
    };

    getUserRole();
  }, [user]);

  return { displayName, loading };
};
