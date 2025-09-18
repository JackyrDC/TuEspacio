import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { Colors, Sizes } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import FavoriteButton from '../components/FavoriteButton';
import EmptyState from '../components/EmptyState';
import LoadingComponent from '../components/LoadingComponent';
import favoritesService, { FavoriteWithProperty } from '../../services/favorites.service';
import { RootStackParamList } from '../types/navigation';

type FavoritesScreenNavigationProp = NavigationProp<RootStackParamList>;

type FilterType = 'all' | 'casa' | 'departamento' | 'local comercial' | 'oficina';
type SortType = 'recent' | 'price-low' | 'price-high' | 'title';

export default function FavoritesScreen() {
  const navigation = useNavigation<FavoritesScreenNavigationProp>();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteWithProperty[]>([]);
  const [filteredFavorites, setFilteredFavorites] = useState<FavoriteWithProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<FilterType>('all');
  const [currentSort, setCurrentSort] = useState<SortType>('recent');
  const [showFilters, setShowFilters] = useState(false);

  // Cargar favoritos cuando la pantalla se enfoca
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  // Aplicar filtros y ordenamiento cuando cambien los favoritos o filtros
  useEffect(() => {
    applyFiltersAndSort();
  }, [favorites, currentFilter, currentSort]);

  const loadFavorites = async () => {
    if (!user?.id) {
      console.log('❌ No hay usuario autenticado');
      setLoading(false);
      return;
    }

    try {
      console.log('📋 Cargando favoritos del usuario:', user.id);
      const userFavorites = await favoritesService.getUserFavorites(user.id);
      console.log('✅ Favoritos cargados:', userFavorites.length);
      console.log('📄 Favoritos completos:', JSON.stringify(userFavorites, null, 2));
      setFavorites(userFavorites);
    } catch (error) {
      console.error('❌ Error cargando favoritos:', error);
      Alert.alert('Error', 'No se pudieron cargar tus favoritos');
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    console.log('🔄 Aplicando filtros y ordenamiento...');
    console.log('📊 Favoritos originales:', favorites.length);
    console.log('🏷️ Filtro actual:', currentFilter);
    console.log('🔀 Orden actual:', currentSort);
    
    let filtered = [...favorites];

    // Aplicar filtro por tipo
    if (currentFilter !== 'all') {
      filtered = filtered.filter(favorite => {
        const property = favorite.property || favorite.expand?.places;
        console.log('🔍 Filtrando propiedad:', property?.type?.type, 'vs', currentFilter);
        return property?.type?.type === currentFilter;
      });
    }

    console.log('📊 Después de filtrar:', filtered.length);

    // Aplicar ordenamiento
    filtered.sort((a, b) => {
      const propertyA = a.property || a.expand?.places;
      const propertyB = b.property || b.expand?.places;

      switch (currentSort) {
        case 'recent':
          return new Date(b.created).getTime() - new Date(a.created).getTime();
        case 'price-low':
          const priceA = propertyA?.price || 0;
          const priceB = propertyB?.price || 0;
          return priceA - priceB;
        case 'price-high':
          const priceA2 = propertyA?.price || 0;
          const priceB2 = propertyB?.price || 0;
          return priceB2 - priceA2;
        case 'title':
          return (propertyA?.title || '').localeCompare(propertyB?.title || '');
        default:
          return 0;
      }
    });

    console.log('📊 Después de ordenar:', filtered.length);
    setFilteredFavorites(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  };

  const handleRemoveFavorite = async (propertyId: string) => {
    if (!user?.id) return;

    try {
      await favoritesService.removeFromFavorites(user.id, propertyId);
      setFavorites(prev => prev.filter(fav => fav.property?.id !== propertyId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const handlePropertyPress = (propertyId: string) => {
    navigation.navigate('PropertyDetail', { propertyId });
  };

  const FilterButton = ({ filter, label }: { filter: FilterType; label: string }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        currentFilter === filter && styles.filterButtonActive
      ]}
      onPress={() => setCurrentFilter(filter)}
    >
      <Text style={[
        styles.filterButtonText,
        currentFilter === filter && styles.filterButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const SortButton = ({ sort, label }: { sort: SortType; label: string }) => (
    <TouchableOpacity
      style={[
        styles.sortButton,
        currentSort === sort && styles.sortButtonActive
      ]}
      onPress={() => setCurrentSort(sort)}
    >
      <Text style={[
        styles.sortButtonText,
        currentSort === sort && styles.sortButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const FavoriteCard = ({ favorite }: { favorite: FavoriteWithProperty }) => {
    console.log('🔍 FavoriteCard - Favorito recibido:', favorite);
    console.log('🔍 FavoriteCard - Propiedad:', favorite.property);
    console.log('🔍 FavoriteCard - Expand:', favorite.expand);
    
    // Intentar obtener la propiedad de diferentes formas
    const property = favorite.property || favorite.expand?.places;
    
    console.log('🔍 FavoriteCard - Propiedad final:', property);
    
    if (!property) {
      console.log('❌ FavoriteCard - No se encontró propiedad, mostrando fallback');
      // Mostrar un card de fallback si no hay propiedad
      return (
        <View style={styles.favoriteCard}>
          <View style={styles.propertyImageContainer}>
            <Text style={styles.propertyImage}>❓</Text>
          </View>
          <View style={styles.propertyInfo}>
            <Text style={styles.propertyTitle}>Propiedad no disponible</Text>
            <Text style={styles.propertyType}>ID: {typeof favorite.property === 'string' ? favorite.property : 'N/A'}</Text>
            <View style={styles.favoriteInfo}>
              <Text style={styles.favoriteDate}>
                ❤️ Agregado {new Date(favorite.created).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>
      );
    }

    // Usar el precio real del tipo Places
    const displayPrice = property.price && property.price > 0 ? property.price : 'Consultar';
    
    // Obtener el tipo de propiedad
    const propertyType = property.type?.type || 'No especificado';

    return (
      <TouchableOpacity 
        style={styles.favoriteCard}
        onPress={() => handlePropertyPress(property.id)}
      >
        <View style={styles.propertyImageContainer}>
          <Text style={styles.propertyImage}>
            {propertyType === 'casa' ? '🏡' : 
             propertyType === 'departamento' ? '🏠' : 
             propertyType === 'local comercial' ? '🏪' : 
             propertyType === 'oficina' ? '🏢' : '🏠'}
          </Text>
          
          {/* Botón de favoritos */}
          <View style={styles.favoriteButtonContainer}>
            <FavoriteButton 
              propertyId={property.id}
              size={20}
              onToggle={(isFavorite) => {
                if (!isFavorite) {
                  handleRemoveFavorite(property.id);
                }
              }}
            />
          </View>
        </View>

        <View style={styles.propertyInfo}>
          <Text style={styles.propertyTitle}>{property.title}</Text>
          <Text style={styles.propertyType}>🏠 {propertyType}</Text>
          
          <View style={styles.propertyDetails}>
            <Text style={styles.propertyPrice}>
              L. {typeof displayPrice === 'number' ? displayPrice.toLocaleString() : displayPrice}
              <Text style={styles.priceUnit}>/mes</Text>
            </Text>
          </View>

          <View style={styles.favoriteInfo}>
            <Text style={styles.favoriteDate}>
              ❤️ Agregado {new Date(favorite.created).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mis Favoritos</Text>
          <View style={styles.headerSpacer} />
        </View>

        <EmptyState
          icon="person-outline"
          title="Inicia Sesión"
          description="Debes iniciar sesión para ver tus propiedades favoritas"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Favoritos</Text>
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={loadFavorites}
          disabled={loading}
        >
          <Ionicons name="refresh" size={20} color={Colors.white} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.filterToggleButton} 
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="options" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Filtros y Ordenamiento */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersRow}>
            <FilterButton filter="all" label="Todos" />
            <FilterButton filter="casa" label="Casas" />
            <FilterButton filter="departamento" label="Departamentos" />
            <FilterButton filter="local comercial" label="Locales" />
            <FilterButton filter="oficina" label="Oficinas" />
          </ScrollView>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortRow}>
            <SortButton sort="recent" label="Más recientes" />
            <SortButton sort="price-low" label="Precio menor" />
            <SortButton sort="price-high" label="Precio mayor" />
            <SortButton sort="title" label="A-Z" />
          </ScrollView>
        </View>
      )}

      {/* Content */}
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <LoadingComponent message="Cargando tus favoritos..." />
        ) : favorites.length === 0 ? (
          <EmptyState
            icon="heart-outline"
            title="Sin Favoritos"
            description="Aún no has agregado propiedades a tus favoritos. Explora propiedades y guarda las que más te gusten."
            buttonText="Explorar Propiedades"
            onButtonPress={() => navigation.navigate('Home')}
          />
        ) : filteredFavorites.length === 0 ? (
          <EmptyState
            icon="filter-outline"
            title="Sin Resultados"
            description="No hay favoritos que coincidan con los filtros seleccionados."
            buttonText="Limpiar Filtros"
            onButtonPress={() => {
              setCurrentFilter('all');
              setCurrentSort('recent');
            }}
          />
        ) : (
          <View style={styles.favoritesList}>
            <View style={styles.statsContainer}>
              <Text style={styles.statsText}>
                {filteredFavorites.length} de {favorites.length} {favorites.length === 1 ? 'favorito' : 'favoritos'}
              </Text>
            </View>
            
            {filteredFavorites.map((favorite) => (
              <FavoriteCard key={favorite.id} favorite={favorite} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.md,
    elevation: 4,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: Sizes.sm,
    borderRadius: Sizes.borderRadius,
    backgroundColor: Colors.primary + '20',
  },
  headerTitle: {
    fontSize: Sizes.fontLG,
    fontWeight: 'bold',
    color: Colors.white,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40, // Same width as back button
  },
  refreshButton: {
    padding: Sizes.sm,
    borderRadius: Sizes.borderRadius,
    backgroundColor: Colors.primary + '20',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    padding: Sizes.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  statsText: {
    fontSize: Sizes.fontMD,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  favoritesList: {
    paddingBottom: Sizes.xl,
  },
  favoriteCard: {
    backgroundColor: Colors.white,
    borderRadius: Sizes.borderRadiusLG,
    marginHorizontal: Sizes.lg,
    marginVertical: Sizes.sm,
    elevation: 3,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  propertyImageContainer: {
    height: 80,
    backgroundColor: Colors.background,
    borderTopLeftRadius: Sizes.borderRadiusLG,
    borderTopRightRadius: Sizes.borderRadiusLG,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  propertyImage: {
    fontSize: 40,
  },
  favoriteButtonContainer: {
    position: 'absolute',
    top: Sizes.sm,
    right: Sizes.sm,
    zIndex: 10,
  },
  propertyInfo: {
    padding: Sizes.md,
  },
  propertyTitle: {
    fontSize: Sizes.fontMD,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Sizes.xs,
  },
  propertyLocation: {
    fontSize: Sizes.fontSM,
    color: Colors.textSecondary,
    marginBottom: Sizes.xs,
  },
  propertyType: {
    fontSize: Sizes.fontSM,
    color: Colors.textSecondary,
    marginBottom: Sizes.sm,
  },
  propertyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Sizes.sm,
  },
  propertyPrice: {
    fontSize: Sizes.fontLG,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  priceUnit: {
    fontSize: Sizes.fontSM,
    fontWeight: 'normal',
    color: Colors.textSecondary,
  },
  favoriteInfo: {
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    paddingTop: Sizes.sm,
    marginTop: Sizes.sm,
  },
  favoriteDate: {
    fontSize: Sizes.fontXS,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  // Nuevos estilos para filtros
  filterToggleButton: {
    padding: Sizes.sm,
    borderRadius: Sizes.borderRadius,
    backgroundColor: Colors.primary + '20',
    marginLeft: Sizes.sm,
  },
  filtersContainer: {
    backgroundColor: Colors.white,
    paddingVertical: Sizes.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  filtersRow: {
    paddingHorizontal: Sizes.lg,
    marginBottom: Sizes.sm,
  },
  sortRow: {
    paddingHorizontal: Sizes.lg,
  },
  filterButton: {
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    borderRadius: Sizes.borderRadius,
    backgroundColor: Colors.background,
    marginRight: Sizes.sm,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterButtonText: {
    fontSize: Sizes.fontSM,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  sortButton: {
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.xs,
    borderRadius: Sizes.borderRadius,
    backgroundColor: Colors.background,
    marginRight: Sizes.sm,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  sortButtonActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  sortButtonText: {
    fontSize: Sizes.fontXS,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  sortButtonTextActive: {
    color: Colors.white,
    fontWeight: 'bold',
  },
});