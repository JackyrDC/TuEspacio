import pb from '../config/pocketbase';
import { Favorites, User, Places } from '../types/types';

export interface FavoriteWithProperty extends Favorites {
  property: Places;
  expand?: {
    places?: Places;
  };
}

class FavoritesService {
  private collectionName = 'favorites';

  private validateUserId(userId: string): boolean {
    return !!(userId && userId.trim().length > 0);
  }

  private validatePropertyId(propertyId: string): boolean {
    return !!(propertyId && propertyId.trim().length > 0);
  }

  async verifyPocketBaseConfiguration(): Promise<void> {
    try {
      console.log('🔍 Verificando configuración de PocketBase...');
      
      try {
        await pb.collection(this.collectionName).getList(1, 1);
        console.log('✅ Colección favorites existe y es accesible');
      } catch (error) {
        console.error('❌ Problema con colección favorites:', error);
      }
      
      try {
        await pb.collection('users').getList(1, 1);
        console.log('✅ Colección users existe y es accesible');
      } catch (error) {
        console.error('❌ Problema con colección users:', error);
      }
      
      try {
        await pb.collection('places').getList(1, 1);
        console.log('✅ Colección places existe y es accesible');
      } catch (error) {
        console.error('❌ Problema con colección places:', error);
      }
      
    } catch (error) {
      console.error('❌ Error verificando configuración:', error);
      throw error;
    }
  }

  async addToFavorites(userId: string, propertyId: string): Promise<Favorites> {
    try {
      if (!this.validateUserId(userId)) {
        throw new Error('ID de usuario inválido');
      }
      if (!this.validatePropertyId(propertyId)) {
        throw new Error('ID de propiedad inválido');
      }

      const existing = await this.checkIsFavorite(userId, propertyId);
      if (existing) {
        return existing;
      }

      const favoriteData = {
        user: userId,
        places: propertyId,
      };

      const record = await pb.collection(this.collectionName).create(favoriteData);
      return record as unknown as Favorites;
    } catch (error) {
      console.error('Error agregando a favoritos:', error);
      throw error;
    }
  }

  async removeFromFavorites(userId: string, propertyId: string): Promise<boolean> {
    try {
      if (!this.validateUserId(userId)) {
        throw new Error('ID de usuario inválido');
      }
      if (!this.validatePropertyId(propertyId)) {
        throw new Error('ID de propiedad inválido');
      }
      
      const favorite = await this.checkIsFavorite(userId, propertyId);
      if (!favorite) {
        return true;
      }

      await pb.collection(this.collectionName).delete(favorite.id!);
      return true;
    } catch (error) {
      console.error('Error removiendo de favoritos:', error);
      throw error;
    }
  }

  async checkIsFavorite(userId: string, propertyId: string): Promise<Favorites | null> {
    try {
      const filter = `user = "${userId}" && places = "${propertyId}"`;
      const records = await pb.collection(this.collectionName).getList(1, 1, {
        filter: filter,
      });

      return records.items.length > 0 ? records.items[0] as unknown as Favorites : null;
    } catch (error) {
      console.error('Error verificando favorito:', error);
      return null;
    }
  }

  async getUserFavorites(userId: string): Promise<FavoriteWithProperty[]> {
    try {
      if (!this.validateUserId(userId)) {
        throw new Error('ID de usuario inválido');
      }
      
      const filter = `user = "${userId}"`;
      const records = await pb.collection(this.collectionName).getList(1, 50, {
        filter: filter,
        expand: 'places',
        sort: '-created',
      });
      
      // Mapear para compatibilidad con la UI
      const mappedFavorites = records.items.map(item => ({
        ...item,
        property: item.expand?.places || item.places,
      }));
      
      return mappedFavorites as unknown as FavoriteWithProperty[];
    } catch (error) {
      console.error('Error cargando favoritos:', error);
      throw error;
    }
  }

  async getUserFavoritePropertyIds(userId: string): Promise<string[]> {
    try {
      const filter = `user = "${userId}"`;
      const records = await pb.collection(this.collectionName).getList(1, 100, {
        filter: filter,
        fields: 'places',
      });

      return records.items.map(item => item.places);
    } catch (error) {
      console.error('Error cargando IDs de favoritos:', error);
      return [];
    }
  }

  async toggleFavorite(userId: string, propertyId: string): Promise<{ isFavorite: boolean; action: 'added' | 'removed' }> {
    try {
      const existing = await this.checkIsFavorite(userId, propertyId);
      
      if (existing) {
        await this.removeFromFavorites(userId, propertyId);
        return { isFavorite: false, action: 'removed' };
      } else {
        await this.addToFavorites(userId, propertyId);
        return { isFavorite: true, action: 'added' };
      }
    } catch (error) {
      console.error('❌ Error en toggle favorito:', error);
      throw error;
    }
  }

  // Limpiar todos los favoritos de un usuario (útil para testing)
  async clearUserFavorites(userId: string): Promise<boolean> {
    try {
      console.log('🧹 Limpiando favoritos del usuario:', userId);
      
      const favorites = await this.getUserFavorites(userId);
      for (const favorite of favorites) {
        await pb.collection(this.collectionName).delete(favorite.id);
      }
      
      console.log(`✅ ${favorites.length} favoritos eliminados`);
      return true;
    } catch (error) {
      console.error('❌ Error limpiando favoritos:', error);
      throw error;
    }
  }

  // Obtener estadísticas de favoritos para una propiedad
  async getPropertyFavoriteCount(propertyId: string): Promise<number> {
    try {
      const filter = `property = "${propertyId}"`;
      const records = await pb.collection(this.collectionName).getList(1, 1, {
        filter: filter,
      });

      return records.totalItems;
    } catch (error) {
      console.error('❌ Error obteniendo conteo de favoritos:', error);
      return 0;
    }
  }
}

// Crear instancia singleton
const favoritesService = new FavoritesService();

export default favoritesService;