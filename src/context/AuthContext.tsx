import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService, { RegisterData } from '../../services/auth.service';
import { User } from '../../types/types';
import pb from '../../config/pocketbase';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  needsProfileCompletion: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  markProfileCompleted: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);

  const isAuthenticated = user !== null;

  // Verificar sesión al cargar la app
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      
      // Primero probar la conexión con PocketBase
      try {
        await pb.health.check();
      } catch (error) {
        console.error('Conexión PocketBase falló, no se puede proceder con verificación de autenticación');
        return;
      }
      
      // Verificar si hay un usuario guardado y si la sesión es válida
      if (authService.isAuthenticated()) {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        } else {
          // Si no hay usuario pero la sesión es válida, limpiar
          await authService.logout();
        }
      }
    } catch (error) {
      console.error('Error al verificar estado de autenticación:', error);
      // En caso de error, limpiar la sesión
      try {
        await authService.logout();
      } catch (logoutError) {
        console.error('Error durante logout de limpieza:', logoutError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const authData = await authService.login(email, password);
      console.log('Login exitoso, usuario:', authData.record);
      setUser(authData.record as unknown as User);
    } catch (error) {
      console.error('Error de login en contexto:', error);
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const authData = await authService.register(userData);
      setUser(authData.record as unknown as User);
      // Marcar que necesita completar el perfil después del registro
      setNeedsProfileCompletion(true);
    } catch (error) {
      console.error('Error de registro en contexto:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Error de logout en contexto:', error);
      // Incluso si hay error, limpiar el estado local
      setUser(null);
      throw error;
    }
  };

  const refreshAuth = async () => {
    try {
      await authService.refreshAuth();
      
      // Verificar si todavía estamos autenticados después del refresh
      if (authService.isAuthenticated()) {
        const currentUser = await authService.getCurrentUser();
        console.log('Usuario autenticado después de refresh:', currentUser);
        setUser(currentUser);
      } else {
        console.log('No hay usuario autenticado después de refresh');
        setUser(null);
      }
    } catch (error) {
      console.error('Error de renovación de autenticación:', error);
      setUser(null);
      throw error;
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Actualizar el perfil en PocketBase
      const updatedUser = await pb.collection("users").update(user.id, userData);
      
      // Actualizar el estado local
      setUser(prev => prev ? { ...prev, ...updatedUser } : null);
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      throw error;
    }
  };

  const markProfileCompleted = () => {
    setNeedsProfileCompletion(false);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    needsProfileCompletion,
    login,
    register,
    logout,
    refreshAuth,
    updateProfile,
    markProfileCompleted,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}