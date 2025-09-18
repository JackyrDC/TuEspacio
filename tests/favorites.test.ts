// Prueba del servicio de favoritos
// Este archivo se puede usar para probar que el servicio funciona correctamente

import favoritesService from '../services/favorites.service';

export const testFavoritesService = async () => {
  console.log('🧪 Iniciando pruebas del servicio de favoritos...');
  
  // IDs de prueba (reemplazar con IDs reales)
  const testUserId = 'test-user-id';
  const testPropertyId = 'test-property-id';
  
  try {
    // 1. Verificar estado inicial
    console.log('1️⃣ Verificando estado inicial...');
    const isFavoriteInitial = await favoritesService.checkIsFavorite(testUserId, testPropertyId);
    console.log('Estado inicial:', isFavoriteInitial ? 'ES FAVORITO' : 'NO ES FAVORITO');
    
    // 2. Agregar a favoritos
    console.log('2️⃣ Agregando a favoritos...');
    const addResult = await favoritesService.addToFavorites(testUserId, testPropertyId);
    console.log('Resultado agregar:', addResult);
    
    // 3. Verificar que se agregó
    console.log('3️⃣ Verificando que se agregó...');
    const isFavoriteAfterAdd = await favoritesService.checkIsFavorite(testUserId, testPropertyId);
    console.log('Después de agregar:', isFavoriteAfterAdd ? 'ES FAVORITO ✅' : 'NO ES FAVORITO ❌');
    
    // 4. Obtener lista de favoritos
    console.log('4️⃣ Obteniendo lista de favoritos...');
    const userFavorites = await favoritesService.getUserFavorites(testUserId);
    console.log('Cantidad de favoritos:', userFavorites.length);
    
    // 5. Toggle favorito (debería quitar)
    console.log('5️⃣ Haciendo toggle (quitar)...');
    const toggleResult = await favoritesService.toggleFavorite(testUserId, testPropertyId);
    console.log('Resultado toggle:', toggleResult);
    
    // 6. Verificar que se quitó
    console.log('6️⃣ Verificando que se quitó...');
    const isFavoriteAfterToggle = await favoritesService.checkIsFavorite(testUserId, testPropertyId);
    console.log('Después de quitar:', isFavoriteAfterToggle ? 'ES FAVORITO ❌' : 'NO ES FAVORITO ✅');
    
    console.log('✅ Pruebas completadas exitosamente');
    return true;
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
    return false;
  }
};

// Función para limpiar datos de prueba
export const cleanupTestData = async (userId: string) => {
  try {
    console.log('🧹 Limpiando datos de prueba...');
    await favoritesService.clearUserFavorites(userId);
    console.log('✅ Datos de prueba limpiados');
  } catch (error) {
    console.error('❌ Error limpiando datos de prueba:', error);
  }
};