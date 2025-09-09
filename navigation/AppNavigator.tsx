import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

// Auth Components
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import LoadingScreen from '../components/LoadingScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

// App Screens
import HomeScreen from '../screens/HomeScreen';
import PlacesScreen from '../screens/PlacesScreen';
import ContractsScreen from '../screens/ContractsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PlaceDetailScreen from '../screens/PlaceDetailScreen';
import MapSearchScreen from '../screens/MapSearchScreen';

// Crear navegadores
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Componente simple para iconos de tab
const TabIcon = ({ children, color }: { children: string; color: string }) => (
  <Text style={{ color: color, fontSize: 20 }}>{children}</Text>
);

// Auth Stack (Login/Register)
const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

// Stack Navigator para Places
function PlacesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="PlacesList" 
        component={PlacesScreen} 
        options={{ title: 'Lugares' }}
      />
      <Stack.Screen 
        name="PlaceDetail" 
        component={PlaceDetailScreen} 
        options={{ title: 'Detalles del Lugar' }}
      />
      <Stack.Screen 
        name="MapSearch" 
        component={MapSearchScreen} 
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

// Tab Navigator principal
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          height: 60,
          paddingBottom: 5,
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#757575',
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }: any) => <TabIcon color={color}>🏠</TabIcon>,
        }}
      />
      <Tab.Screen 
        name="Places" 
        component={PlacesStack}
        options={{
          title: 'Lugares',
          tabBarIcon: ({ color }: any) => <TabIcon color={color}>📍</TabIcon>,
        }}
      />
      <Tab.Screen 
        name="Contracts" 
        component={ContractsScreen}
        options={{
          title: 'Contratos',
          tabBarIcon: ({ color }: any) => <TabIcon color={color}>📋</TabIcon>,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }: any) => <TabIcon color={color}>👤</TabIcon>,
        }}
      />
    </Tab.Navigator>
  );
}

// Navigation component that handles auth state
const AppNavigatorContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {user ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
};

// Main App Navigator with Auth Provider
export default function AppNavigator() {
  return (
    <AuthProvider>
      <AppNavigatorContent />
    </AuthProvider>
  );
}
