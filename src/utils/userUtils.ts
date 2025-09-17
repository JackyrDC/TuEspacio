import { User } from '../../types/types';

/**
 * Obtiene el avatar apropiado basado en el género del usuario
 * @param user - El objeto usuario
 * @returns La imagen del avatar apropiada
 */
export const getUserAvatar = (user: User | null | undefined) => {
  if (!user) {
    return require('../../assets/icons/user.png');
  }

  if (user.avatar && user.avatar.trim() !== '') {
    return { uri: user.avatar };
  }

  switch (user.genre) {
    case 'femenino':
      return require('../../assets/icons/user_f.png');
    case 'masculino':
      return require('../../assets/icons/user.png');
    default:
      return require('../../assets/icons/user.png');
  }
};

/**
 * @param user - El objeto usuario
 * @returns Las iniciales del usuario (máximo 2 caracteres)
 */
export const getUserInitials = (user: User | null | undefined): string => {
  if (!user || !user.name) {
    return 'U';
  }

  const names = user.name.trim().split(' ');
  if (names.length >= 2) {
    return (names[0][0] + names[1][0]).toUpperCase();
  } else if (names.length === 1) {
    return names[0].substring(0, 2).toUpperCase();
  }
  
  return 'U';
};

/**
 * @param user - El objeto usuario
 * @returns El nombre del usuario o un fallback apropiado
 */
export const getUserDisplayName = (user: User | null | undefined): string => {
  if (!user) {
    return 'Usuario';
  }

  if (user.name && user.name.trim() !== '') {
    return user.name;
  }

  if (user.email) {
    return user.email.split('@')[0];
  }

  return 'Usuario';
};