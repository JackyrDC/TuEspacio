import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import OwnerDashboardScreen from '../screens/OwnerDashboardScreen';
import AddPropertyScreen from '../screens/AddPropertyScreen';
import PropertyManagementScreen from '../screens/PropertyManagementScreen';
import ApplicationsManagementScreen from '../screens/ApplicationsManagementScreen';
import UserDocumentsScreen from '../screens/UserDocumentsScreen';
import CompleteProfileScreen from '../screens/CompleteProfileScreen';
import MapScreen from '../screens/MapScreen';
import PropertyDetailScreen from '../screens/PropertyDetailScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../types/navigation';

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user, needsProfileCompletion, needsDocumentCompletion, markProfileCompleted, markDocumentsCompleted } = useAuth();
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

  // Si es inquilino y necesita completar documentos, mostrar UserDocumentsScreen
  if (needsDocumentCompletion && user?.type === 'Inquilino') {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="UserDocuments">
            {() => (
              <UserDocumentsScreen onComplete={markDocumentsCompleted} />
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
              name="ApplicationsManagement" 
              component={ApplicationsManagementScreen}
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
            <Stack.Screen 
              name="UserDocuments" 
              component={UserDocumentsScreen}
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}