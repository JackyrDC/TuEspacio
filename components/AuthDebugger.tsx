import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const AuthDebugger: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();

  const handleTestLogout = async () => {
    console.log('=== TESTING LOGOUT ===');
    console.log('Current user before logout:', user);
    console.log('Is authenticated before logout:', isAuthenticated);
    
    try {
      await logout();
      console.log('Logout completed');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Auth Debugger</Text>
      <Text>User: {user ? user.email : 'No user'}</Text>
      <Text>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</Text>
      
      <TouchableOpacity style={styles.button} onPress={handleTestLogout}>
        <Text style={styles.buttonText}>Test Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#ff4444',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
  },
});

export default AuthDebugger;
