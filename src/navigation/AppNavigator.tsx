import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import OwnerDashboardScreen from '../screens/OwnerDashboardScreen';
import AddPropertyScreen from '../screens/AddPropertyScreen';
import PropertyManagementScreen from '../screens/PropertyManagementScreen';
import CompleteProfileScreen from '../screens/CompleteProfileScreen';
import MapScreen from '../screens/MapScreen';
import PropertyDetailScreen from '../screens/PropertyDetailScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../types/navigation';

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user, needsProfileCompletion, markProfileCompleted } = useAuth();
  const isOwner = user?.type === 'Propietario';

  // Si necesita completar el perfil, mostrar CompleteProfileScreen
  if (needsProfileCompletion && user) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="CompleteProfile">
            {() => (
              <CompleteProfileScreen
                onComplete={markProfileCompleted}
                onSkip={markProfileCompleted}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isOwner ? "OwnerDashboard" : "Home"}
        screenOptions={{
          headerShown: false, // Ocultamos el header por defecto
        }}
      >
        {isOwner ? (
          <>
            <Stack.Screen 
              name="OwnerDashboard" 
              component={OwnerDashboardScreen}
            />
            <Stack.Screen 
              name="AddProperty" 
              component={AddPropertyScreen}
            />
            <Stack.Screen 
              name="PropertyManagement" 
              component={PropertyManagementScreen}
            />
            <Stack.Screen 
              name="Home" 
              component={HomeScreen}
            />
          </>
        ) : (
          <>
            <Stack.Screen 
              name="Home" 
              component={HomeScreen}
            />
          </>
        )}
        <Stack.Screen 
          name="Map" 
          component={MapScreen}
        />
        <Stack.Screen 
          name="PropertyDetail" 
          component={PropertyDetailScreen}
        />
        <Stack.Screen 
          name="Profile" 
          component={UserProfileScreen}
        />
        <Stack.Screen 
          name="Favorites" 
          component={FavoritesScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}