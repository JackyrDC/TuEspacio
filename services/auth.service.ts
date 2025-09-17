import AsyncStorage from '@react-native-async-storage/async-storage';
import pb from "../config/pocketbase";
import { User } from "../types/types";
import { getTestUserByEmail, isTestUser } from "../data/testUsers";

export interface RegisterData {
  email: string;
  password: string;
  passwordConfirm: string;
  name: string; // Requerido según types.ts
  role?: 'Inquilino' | 'Propietario' | 'Administrador'; // Valores específicos según types.ts
}

const login = async (email: string, password: string) => {
  try {
    // Para desarrollo: permitir login con usuarios de prueba
    if (isTestUser(email) && password === 'test123') {
      const testUser = getTestUserByEmail(email);
      if (testUser) {
        await AsyncStorage.setItem("user", JSON.stringify(testUser));
        await AsyncStorage.setItem("token", "test_token_" + testUser.id);
        
        return {
          record: testUser,
          token: "test_token_" + testUser.id
        };
      }
    }

    // Verificar que PocketBase esté disponible
    if (!pb || !pb.collection) {
      throw new Error('Cliente PocketBase no disponible');
    }
    
    try {
      await pb.health.check();
    } catch (healthError) {
      console.error('Verificación de salud de PocketBase falló:', healthError);
      throw new Error(`No se puede conectar al servidor PocketBase en ${pb.baseUrl}. Asegúrate de que el servidor esté funcionando y accesible.`);
    }
    
    const authData = await pb.collection("users").authWithPassword(email, password);
    
    await AsyncStorage.setItem("user", JSON.stringify(authData.record));
    await AsyncStorage.setItem("token", authData.token);
    
    return authData;
  } catch (error: any) {
    console.error("=== INICIO DE SESIÓN FALLIDO ===");
    console.error("Tipo de error:", error.constructor.name);
    console.error("Mensaje de error:", error.message || error);
    console.error("Detalles del error:", JSON.stringify(error, null, 2));
    
    // Proporcionar errores más específicos
    if (error.message?.includes('fetch')) {
      throw new Error('No se pudo conectar al servidor. Verifica tu conexión a internet.');
    } else if (error.status === 400) {
      // Revisar detalles del error de autenticación
      if (error.response?.data || error.message?.includes('password')) {
        throw new Error('Email o contraseña incorrectos. Verifica tus credenciales.');
      } else {
        throw new Error('Email o contraseña incorrectos.');
      }
    } else if (error.status === 404) {
      throw new Error('Servidor no encontrado. Contacta al administrador.');
    } else {
      throw new Error(error.message || 'Error de conexión. Intenta de nuevo.');
    }
  }
};

const register = async (userData: RegisterData) => {
  try {
    try {
      await pb.health.check();
    } catch (healthError) {
      console.error('Verificación de salud de PocketBase falló:', healthError);
      throw new Error(`No se puede conectar al servidor PocketBase en ${pb.baseUrl}. Asegúrate de que el servidor esté funcionando y accesible.`);
    }
    
    // Validar el rol antes de enviar
    const validRoles = ['Inquilino', 'Propietario', 'Administrador'];
    const userRole = userData.role || 'Inquilino';
    
    if (!validRoles.includes(userRole)) {
      throw new Error(`Rol inválido: ${userRole}. Debe ser uno de: ${validRoles.join(', ')}`);
    }
    
    console.log(`Registrando usuario con rol: ${userRole}`);
    
    // Verificar si el email ya existe antes de intentar crear
    try {
      const existingUsers = await pb.collection("users").getList(1, 1, {
        filter: `email = "${userData.email}"`
      });
      
      if (existingUsers.items && existingUsers.items.length > 0) {
        throw new Error('Este email ya está registrado. Intenta con otro email diferente.');
      }
    } catch (checkError: any) {
      // Si es el error que creamos arriba, re-lanzarlo
      if (checkError.message?.includes('email ya está registrado')) {
        throw checkError;
      }
      // Si es otro error (como error de conexión), continuar con el registro
      console.log('No se pudo verificar emails existentes, continuando con registro...');
    }
    
    // Preparar datos del usuario - campo type ahora es texto simple
    const userCreateData = {
      email: userData.email,
      password: userData.password,
      passwordConfirm: userData.passwordConfirm,
      name: userData.name,
      type: userRole, // Campo de texto simple con el rol
      isActive: true, // Por defecto activar el usuario
    };
    
    console.log('Datos a enviar para crear usuario:', userCreateData);
    
    // Crear el usuario
    const createdUser = await pb.collection("users").create(userCreateData);
    
    console.log('Usuario creado exitosamente:', createdUser);
    console.log('Type guardado en DB:', createdUser.type);
    console.log('isActive guardado en DB:', createdUser.isActive);
    
    // Auto-login después del registro
    const authData = await pb.collection("users").authWithPassword(
      userData.email, 
      userData.password
    );
    
    console.log('Datos de autenticación después del login:', authData.record);
    console.log('Type en authData:', authData.record.type);
    console.log('isActive en authData:', authData.record.isActive);
    
    // Guardar en AsyncStorage
    await AsyncStorage.setItem("user", JSON.stringify(authData.record));
    await AsyncStorage.setItem("token", authData.token);
    
    return authData;
  } catch (error: any) {
    console.error("=== REGISTRO FALLIDO ===");
    console.error("Tipo de error:", error.constructor.name);
    console.error("Mensaje de error:", error.message || error);
    console.error("Detalles del error:", JSON.stringify(error, null, 2));
    
    // Proporcionar errores más específicos
    if (error.message?.includes('fetch')) {
      throw new Error('No se pudo conectar al servidor. Verifica tu conexión a internet.');
    } else if (error.status === 400) {
      // Revisar si es error de email único
      if (error.response?.data?.email?.code === 'validation_not_unique') {
        throw new Error('Este email ya está registrado. Intenta con otro email diferente.');
      }
      // Revisar si es error de campo type requerido
      else if (error.response?.data?.type?.code === 'validation_required') {
        throw new Error('El servidor requiere configuración adicional de tipos de usuario. Por favor, contacta al administrador para completar la configuración.');
      }
      // Otros errores de validación
      else if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.password) {
          throw new Error('La contraseña no cumple con los requisitos mínimos.');
        } else if (errorData.name) {
          throw new Error('El nombre proporcionado no es válido.');
        } else if (errorData.role) {
          throw new Error('El rol seleccionado no es válido.');
        } else {
          // Mostrar información más detallada para debugging
          const errorFields = Object.keys(errorData);
          throw new Error(`Error de validación en campos: ${errorFields.join(', ')}. Verifica la información o contacta al administrador.`);
        }
      } else {
        throw new Error('Los datos proporcionados no son válidos. Verifica la información.');
      }
    } else if (error.status === 404) {
      throw new Error('Servidor no encontrado. Contacta al administrador.');
    } else {
      throw new Error(error.message || 'Error al crear la cuenta. Intenta de nuevo.');
    }
  }
};

const logout = async (): Promise<void> => {
  try {
    // Limpiar PocketBase auth store (esto es síncrono)
    try {
      pb.authStore.clear();
    } catch (pbError) {
      console.error('Error al limpiar PocketBase auth store:', pbError);
      throw new Error(`Fallo al limpiar PocketBase: ${pbError}`);
    }
    
    // Limpiar AsyncStorage
    try {
      await AsyncStorage.multiRemove(['user', 'token']);
      
      // Verificar que se limpiaron
      const remainingUser = await AsyncStorage.getItem('user');
      const remainingToken = await AsyncStorage.getItem('token');
      
    } catch (storageError) {
      console.error('Error al eliminar datos de AsyncStorage:', storageError);
      
      // Intentar limpiar individualmente como fallback
      try {
        await AsyncStorage.removeItem("user");
        await AsyncStorage.removeItem("token");
      } catch (individualError) {
        console.error('Limpieza individual también falló:', individualError);
        throw new Error(`Fallo en limpieza de AsyncStorage: ${individualError}`);
      }
    }
    
  } catch (error) {
    console.error("=== SERVICIO DE AUTENTICACIÓN LOGOUT FALLIDO ===");
    console.error("Detalles del error de logout:", error);
    console.error("Mensaje de error:", error instanceof Error ? error.message : String(error));
    console.error("Stack del error:", error instanceof Error ? error.stack : 'Sin stack trace');
    
    // Re-throw el error para que el contexto pueda manejarlo
    throw error;
  }
};

const getCurrentUser = async (): Promise<User | null> => {
  try {
    const userString = await AsyncStorage.getItem("user");
    if (userString) {
      const localUser = JSON.parse(userString);
      
      // Intentar obtener datos actualizados del servidor
      try {
        if (pb.authStore.isValid && localUser.id) {
          const serverUser = await pb.collection("users").getOne(localUser.id);
          console.log('Usuario desde servidor:', serverUser);
          
          // Actualizar AsyncStorage con datos del servidor
          await AsyncStorage.setItem("user", JSON.stringify(serverUser));
          return serverUser as unknown as User;
        }
      } catch (serverError) {
        console.warn('No se pudo obtener usuario del servidor, usando datos locales:', serverError);
      }
      
      return localUser;
    }
    return null;
  } catch (error) {
    console.error("Error al obtener usuario actual:", error);
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
    console.error("Fallo en renovación de autenticación:", error);
    await logout(); // Limpiar si el refresh falla
  }
};

const checkEmailAvailability = async (email: string): Promise<boolean> => {
  try {
    await pb.health.check();
    
    const existingUsers = await pb.collection("users").getList(1, 1, {
      filter: `email = "${email}"`
    });
    
    return existingUsers.items.length === 0;
  } catch (error) {
    console.error("Error verificando disponibilidad de email:", error);
    // En caso de error, permitir continuar
    return true;
  }
};

const checkUserSchema = async (): Promise<void> => {
  try {
    console.log('=== VERIFICANDO ESQUEMA DE USUARIOS ===');
    
    // Intentar obtener la información de la colección
    const collections = await pb.collections.getFullList();
    const usersCollection = collections.find(col => col.name === 'users');
    
    if (usersCollection) {
      console.log('Colección users encontrada:');
      console.log('Esquema actual:', JSON.stringify(usersCollection.schema, null, 2));
      
      // Verificar si existen los campos que necesitamos
      const hasRoleField = usersCollection.schema.some((field: any) => field.name === 'role');
      const hasIsActiveField = usersCollection.schema.some((field: any) => field.name === 'isActive');
      const hasTypeField = usersCollection.schema.some((field: any) => field.name === 'type');
      
      console.log('Campo role existe:', hasRoleField);
      console.log('Campo isActive existe:', hasIsActiveField);
      console.log('Campo type existe:', hasTypeField);
      
      if (!hasRoleField || !hasIsActiveField || !hasTypeField) {
        console.warn('ADVERTENCIA: Faltan campos requeridos en el esquema de usuarios');
        console.warn('Campos faltantes:', {
          role: !hasRoleField,
          isActive: !hasIsActiveField,
          type: !hasTypeField
        });
      }
    } else {
      console.error('Colección users no encontrada');
    }
  } catch (error) {
    console.error('Error verificando esquema de usuarios:', error);
    console.log('Nota: Esto puede ser normal si no tienes permisos de administrador');
  }
};

const getUserTypeId = async (role: string): Promise<string> => {
  try {
    console.log(`Buscando userType para role: ${role}`);
    
    // Buscar si ya existe el tipo de usuario
    const userTypes = await pb.collection("userTypes").getFullList({
      filter: `role = "${role}"`
    });
    
    if (userTypes.length > 0) {
      console.log('UserType encontrado:', userTypes[0]);
      return userTypes[0].id;
    } else {
      // Crear el tipo de usuario si no existe
      console.log(`Creando nuevo userType para role: ${role}`);
      const newUserType = await pb.collection("userTypes").create({
        role: role
      });
      console.log('Nuevo userType creado:', newUserType);
      return newUserType.id;
    }
  } catch (error) {
    console.error('Error manejando userType:', error);
    
    // Si hay error, intentar con los tipos existentes
    try {
      console.log('Intentando obtener todos los userTypes disponibles...');
      const allUserTypes = await pb.collection("userTypes").getFullList();
      console.log('UserTypes disponibles:', allUserTypes);
      
      if (allUserTypes.length > 0) {
        // Usar el primer tipo disponible como fallback
        console.log('Usando primer userType como fallback:', allUserTypes[0]);
        return allUserTypes[0].id;
      }
    } catch (fallbackError) {
      console.error('Error obteniendo userTypes de fallback:', fallbackError);
    }
    
    throw new Error(`No se pudo obtener o crear userType para role: ${role}`);
  }
};

export default {
  login,
  register,
  logout,
  getCurrentUser,
  isAuthenticated,
  refreshAuth,
  checkEmailAvailability
};
