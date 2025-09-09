import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import authService, { User } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar si hay un usuario guardado al iniciar la app
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      console.log('Checking auth status...');
      
      // Verificar si hay un usuario guardado
      const savedUser = await authService.getCurrentUser();
      console.log('Saved user from storage:', savedUser);
      
      if (savedUser && authService.isAuthenticated()) {
        console.log('User found and authenticated, setting user state');
        setUser(savedUser);
        
        // Intentar refrescar la autenticación
        try {
          await authService.refreshAuth();
          console.log('Auth refreshed successfully');
        } catch (error) {
          console.log('Auth refresh failed, user will need to login again');
          await handleLogout();
        }
      } else {
        console.log('No user found or not authenticated, clearing state');
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null);
    } finally {
      setLoading(false);
      console.log('Auth check completed');
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const authData = await authService.login(email, password);
      console.log('Login success, setting user:', authData.record);
      setUser(authData.record as unknown as User);
    } catch (error) {
      console.error('Login error in context:', error);
      throw error; // Re-throw para que el componente pueda manejar el error
    }
  };

  const handleRegister = async (userData: any) => {
    try {
      const authData = await authService.register(userData);
      console.log('Register success, setting user:', authData.record);
      setUser(authData.record as unknown as User);
    } catch (error) {
      console.error('Register error in context:', error);
      throw error; // Re-throw para que el componente pueda manejar el error
    }
  };

  const handleLogout = async () => {
    try {
      console.log('Logout initiated...');
      await authService.logout();
      console.log('Logout service completed, clearing user state...');
      setUser(null);
      console.log('User state cleared successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Aún así limpiar el estado local como fallback
      console.log('Forcing user state clear due to error...');
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
