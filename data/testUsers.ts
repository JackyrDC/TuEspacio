import { User } from '../types/types';

// Usuarios de prueba para testing de avatares por género
export const testUsers: User[] = [
  {
    id: 'test_user_1',
    email: 'maria.test@gmail.com',
    name: 'María García',
    type: 'Inquilino',
    genre: 'femenino',
    isActive: true,
    phone: '+504 9876-5432',
    bio: 'Estudiante de medicina',
    created: new Date('2024-01-01'),
    updated: new Date('2024-09-17')
  },
  {
    id: 'test_user_2',
    email: 'carlos.test@gmail.com',
    name: 'Carlos Rodríguez',
    type: 'Inquilino',
    genre: 'masculino',
    isActive: true,
    phone: '+504 8765-4321',
    bio: 'Estudiante de ingeniería',
    created: new Date('2024-01-01'),
    updated: new Date('2024-09-17')
  },
  {
    id: 'test_user_3',
    email: 'ana.owner@gmail.com',
    name: 'Ana Morales',
    type: 'Propietario',
    genre: 'femenino',
    isActive: true,
    phone: '+504 7654-3210',
    bio: 'Propietaria de múltiples inmuebles',
    created: new Date('2024-01-01'),
    updated: new Date('2024-09-17')
  },
  {
    id: 'test_user_4',
    email: 'juan.owner@gmail.com',
    name: 'Juan Pérez',
    type: 'Propietario',
    genre: 'masculino',
    isActive: true,
    phone: '+504 6543-2109',
    bio: 'Inversionista inmobiliario',
    created: new Date('2024-01-01'),
    updated: new Date('2024-09-17')
  }
];

// Función helper para obtener usuario de prueba por email
export const getTestUserByEmail = (email: string): User | undefined => {
  return testUsers.find(user => user.email === email);
};

// Función helper para simular login con usuarios de prueba
export const isTestUser = (email: string): boolean => {
  return testUsers.some(user => user.email === email);
};