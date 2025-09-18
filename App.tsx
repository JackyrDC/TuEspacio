import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import CustomSplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import CompleteProfileScreen from './src/screens/CompleteProfileScreen';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { Colors } from './src/constants/Colors';

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const { isAuthenticated, isLoading, needsProfileCompletion, markProfileCompleted } = useAuth();

  // Log para depuración
  useEffect(() => {
  }, [isAuthenticated, isLoading, needsProfileCompletion]);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  const handleLoginSuccess = () => {
    // El contexto se encargará del estado de autenticación
  };

  const handleCompleteProfile = () => {
    markProfileCompleted();
  };

  const handleSkipProfile = () => {
    markProfileCompleted();
  };

  // Mostrar splash screen
  if (showSplash) {
    return <CustomSplashScreen onFinish={handleSplashFinish} />;
  }

  // Mostrar loading mientras verifica autenticación
  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: Colors.primary 
      }}>
        <ActivityIndicator size="large" color={Colors.white} />
      </View>
    );
  }

  // Mostrar login si no está autenticado
  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // Mostrar completar perfil si acaba de registrarse
  if (needsProfileCompletion) {
    return (
      <CompleteProfileScreen 
        onComplete={handleCompleteProfile}
        onSkip={handleSkipProfile}
      />
    );
  }

  // Mostrar app principal si está autenticado
  return <AppNavigator />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppContent />
        <StatusBar style="auto" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
