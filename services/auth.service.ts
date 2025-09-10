import AsyncStorage from '@react-native-async-storage/async-storage';
import pb from "../config/pocketbase";

export interface User {
  id: string;
  email: string;
  name?: string;
  username?: string;
  avatar?: string;
  created: string;
  updated: string;
}

export interface RegisterData {
  email: string;
  password: string;
  passwordConfirm: string;
  name?: string;
  username?: string;
}

const login = async (email: string, password: string) => {
  try {
    const authData = await pb.collection("users").authWithPassword(email, password);
    
    // Guardar en AsyncStorage para React Native
    await AsyncStorage.setItem("user", JSON.stringify(authData.record));
    await AsyncStorage.setItem("token", authData.token);
    
    return authData;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

const register = async (userData: RegisterData) => {
  try {
    // Crear el usuario
    const createdUser = await pb.collection("users").create(userData);
    
    // Auto-login después del registro
    const authData = await pb.collection("users").authWithPassword(
      userData.email, 
      userData.password
    );
    
    // Guardar en AsyncStorage
    await AsyncStorage.setItem("user", JSON.stringify(authData.record));
    await AsyncStorage.setItem("token", authData.token);
    
    return authData;
  } catch (error) {
    console.error("Registration failed:", error);
    throw error;
  }
};

const logout = async (): Promise<void> => {
  try {
    console.log('Starting logout process...');
    
    // Intentar limpiar PocketBase auth store
    try {
      await pb.authStore.clear();
      console.log('PocketBase auth store cleared');
    } catch (pbError) {
      console.error('Error clearing PocketBase auth store:', pbError);
    }
    
    // Intentar limpiar AsyncStorage
    try {
      await AsyncStorage.removeItem("user");
      console.log('User removed from AsyncStorage');
    } catch (storageError) {
      console.error('Error removing user from AsyncStorage:', storageError);
    }
    
    try {
      await AsyncStorage.removeItem("token");
      console.log('Token removed from AsyncStorage');
    } catch (storageError) {
      console.error('Error removing token from AsyncStorage:', storageError);
    }
    
    console.log('Logout process completed');
  } catch (error) {
    console.error("Logout failed:", error);
    // No re-throw para evitar que falle el proceso de logout
    // El contexto se encargará de limpiar el estado local
  }
};

const getCurrentUser = async (): Promise<User | null> => {
  try {
    const userString = await AsyncStorage.getItem("user");
    if (userString) {
      return JSON.parse(userString);
    }
    return null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

const isAuthenticated = (): boolean => {
  return pb.authStore.isValid;
};

const refreshAuth = async (): Promise<void> => {
  try {
    if (pb.authStore.isValid) {
      await pb.collection("users").authRefresh();
    }
  } catch (error) {
    console.error("Auth refresh failed:", error);
    await logout(); // Limpiar si el refresh falla
  }
};

export default {
  login,
  register,
  logout,
  getCurrentUser,
  isAuthenticated,
  refreshAuth
};