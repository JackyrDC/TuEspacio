import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sizes } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import favoritesService from '../../services/favorites.service';

interface FavoriteButtonProps {
  propertyId: string;
  size?: number;
  style?: object;
  onToggle?: (isFavorite: boolean) => void;
}

export default function FavoriteButton({ 
  propertyId, 
  size = 24, 
  style,
  onToggle 
}: FavoriteButtonProps) {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkFavoriteStatus();
  }, [propertyId]);

  const checkFavoriteStatus = async () => {
    if (!user?.id || !propertyId) return;

    try {
      const favorite = await favoritesService.checkIsFavorite(user.id, propertyId);
      setIsFavorite(!!favorite);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user?.id) {
      Alert.alert(
        'Inicia Sesión',
        'Debes iniciar sesión para agregar propiedades a favoritos',
        [{ text: 'OK' }]
      );
      return;
    }

    if (loading) return;

    setLoading(true);
    try {
      const result = await favoritesService.toggleFavorite(user.id, propertyId);
      setIsFavorite(result.isFavorite);
      
      // Callback opcional para notificar al componente padre
      onToggle?.(result.isFavorite);

      // Mostrar feedback al usuario
      const message = result.action === 'added' 
        ? '❤️ Agregado a favoritos' 
        : '💔 Removido de favoritos';
      
      // Mostrar mensaje discreto (podrías usar una toast library aquí)
      console.log(message);
      
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'No se pudo actualizar favoritos. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handleToggleFavorite}
      disabled={loading}
      activeOpacity={0.7}
    >
      <Ionicons
        name={isFavorite ? 'heart' : 'heart-outline'}
        size={size}
        color={isFavorite ? Colors.error : Colors.textSecondary}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Sizes.xs,
    borderRadius: 20,
    backgroundColor: Colors.white,
    shadowColor: Colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
});