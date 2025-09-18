import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Alert,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Colors, Sizes } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import CustomButton from '../components/CustomButton';
import FavoriteButton from '../components/FavoriteButton';
import placesService from '../../services/places.service';
import { Places } from '../../types/types';
import { RootStackParamList } from '../types/navigation';
import { getUserAvatar } from '../utils/userUtils';

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user, logout } = useAuth();
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [properties, setProperties] = useState<Places[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProperties();
  }, []);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      performSearch();
    }, 300); // Debounce de 300ms

    return () => clearTimeout(delayedSearch);
  }, [searchText]);

  // Manejar cambios en filtros rápidos
  useEffect(() => {
    performSearch();
  }, [selectedFilter]);

  const performSearch = async () => {
    try {
      setLoading(true);
      // Usar filterPlaces que maneja tanto búsqueda como filtros en PocketBase
      const searchResult = await placesService.filterPlaces(selectedFilter, searchText);
      
      // Convertir los datos reales de PocketBase a nuestro formato
      const formattedProperties: Places[] = searchResult.items?.map((place: any) => ({
        id: place.id,
        title: place.title || 'Propiedad sin título',
        description: place.description || '',
        type: { 
          id: place.id + '_type',
          type: place.property_type || 'departamento',
          created: new Date(place.created),
          updated: new Date(place.updated)
        },
        status: { 
          id: place.id + '_status',
          status: place.property_status || 'disponible',
          created: new Date(place.created),
          updated: new Date(place.updated)
        },
        owner: place.expand?.owner || { 
          id: place.owner || 'unknown',
          name: 'Propietario',
          email: '',
          isActive: true,
          created: new Date(place.created),
          updated: new Date(place.updated)
        },
        location: place.location ? {
          lat: place.location.lat || 0,
          lng: place.location.lon || place.location.lng || 0  // ← Priorizar "lon" sobre "lng"
        } : { lat: 0, lng: 0 },
        size: place.size || 0,
        price: place.price || place.monthlyPrice || 0, // Usar el campo price de PocketBase
        photos: place.photos || [],
        created: new Date(place.created),
        updated: new Date(place.updated),
      })) || [];
      
      setProperties(formattedProperties);
    } catch (error) {
      console.error('HomeScreen: Error al buscar propiedades:', error);
      Alert.alert(
        'Error',
        'No se pudieron buscar las propiedades. Intenta de nuevo.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const loadProperties = async () => {
    try {
      setLoading(true);
      
      // Test de conexión primero
      console.log('🧪 HomeScreen: Iniciando carga de propiedades...');
      const isConnected = await placesService.testConnection();
      if (!isConnected) {
        Alert.alert(
          'Error de conexión',
          'No se pudo conectar a la base de datos. Verifica tu conexión a internet.',
          [
            { text: 'Reintentar', onPress: loadProperties },
            { text: 'OK' }
          ]
        );
        return;
      }
      
      const placesData = await placesService.getPlaces();
      
      // Convertir los datos reales de PocketBase a nuestro formato
      const formattedProperties: Places[] = placesData.items?.map((place: any) => ({
        id: place.id,
        title: place.title || 'Propiedad sin título',
        description: place.description || '',
        type: { 
          id: place.id + '_type',
          type: place.property_type || 'departamento',
          created: new Date(place.created),
          updated: new Date(place.updated)
        },
        status: { 
          id: place.id + '_status',
          status: place.property_status || 'disponible',
          created: new Date(place.created),
          updated: new Date(place.updated)
        },
        owner: place.expand?.owner || { 
          id: place.owner || 'unknown',
          name: 'Propietario',
          email: '',
          isActive: true,
          created: new Date(place.created),
          updated: new Date(place.updated)
        },
        location: place.location ? {
          lat: place.location.lat || 0,
          lng: place.location.lon || place.location.lng || 0  // ← Priorizar "lon" sobre "lng"
        } : { lat: 0, lng: 0 },
        size: place.size || 0,
        price: place.price || place.monthlyPrice || 0, // Usar el campo price de PocketBase
        photos: place.photos || [],
        created: new Date(place.created),
        updated: new Date(place.updated),
      })) || [];
      
      console.log(`🏠 HomeScreen: ${formattedProperties.length} propiedades cargadas exitosamente`);
      setProperties(formattedProperties);
      
    } catch (error) {
      console.error('HomeScreen: Error al cargar propiedades:', error);
      Alert.alert(
        'Error',
        'No se pudieron cargar las propiedades. Intenta de nuevo.',
        [
          { text: 'Reintentar', onPress: loadProperties },
          { text: 'OK' }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProperties();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar sesión', onPress: logout, style: 'destructive' },
      ]
    );
  };

  const handleProfilePress = () => {
    // Navegar a la pantalla de perfil
    navigation.navigate('Profile');
  };

  const filters = [
    { id: 'near-unah', label: 'Cerca UNAH', icon: '🎓' },
    { id: 'economic', label: 'Económico', icon: '💰' },
    { id: 'furnished', label: 'Amueblado', icon: '🛋️' },
    { id: 'wifi', label: 'WiFi', icon: '📶' },
    { id: 'studio', label: 'Estudio', icon: '🏠' },
  ];

  const QuickFilterButton = ({ filter }: { filter: typeof filters[0] }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === filter.id && styles.filterButtonActive
      ]}
      onPress={() => setSelectedFilter(selectedFilter === filter.id ? null : filter.id)}
    >
      <Text style={styles.filterIcon}>{filter.icon}</Text>
      <Text style={[
        styles.filterText,
        selectedFilter === filter.id && styles.filterTextActive
      ]}>
        {filter.label}
      </Text>
    </TouchableOpacity>
  );

  const PropertyCard = ({ property }: { property: Places }) => {
    // Función auxiliar para determinar disponibilidad
    const isAvailable = typeof property.status === 'string' 
      ? property.status === 'disponible' 
      : property.status?.status === 'disponible';
    
    // Usar el precio real de PocketBase
    const realPrice = property.price || (property as any).monthlyPrice;
    const displayPrice = realPrice && realPrice > 0 ? realPrice : 'Consultar';
    
    // Usar dirección real de PocketBase
    const realAddress = (property as any).address || (property as any).city || (property as any).neighborhood;
    const displayLocation = realAddress || 'Ubicación no disponible';
    
    return (
      <TouchableOpacity 
        style={styles.propertyCard}
        onPress={() => navigation.navigate('PropertyDetail', { propertyId: property.id })}
      >
        <View style={styles.propertyImageContainer}>
          <Text style={styles.propertyImage}>
            {property.type?.type === 'casa' ? '🏡' : 
             property.type?.type === 'departamento' ? '🏠' : 
             property.type?.type === 'local comercial' ? '🏪' : 
             property.type?.type === 'oficina' ? '🏢' : '🏠'}
          </Text>
          {!isAvailable && (
            <View style={styles.unavailableBadge}>
              <Text style={styles.unavailableText}>No disponible</Text>
            </View>
          )}
          {isAvailable && (
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>⭐ Nuevo</Text>
            </View>
          )}
          {/* Botón de favoritos */}
          <View style={styles.favoriteButtonContainer}>
            <FavoriteButton 
              propertyId={property.id} 
              size={20}
              onToggle={(isFavorite) => {
                console.log(`Property ${property.id} ${isFavorite ? 'added to' : 'removed from'} favorites`);
              }}
            />
          </View>
        </View>
        <View style={styles.propertyInfo}>
          <Text style={styles.propertyTitle}>{property.title}</Text>
          <Text style={styles.propertyLocation}>📍 {displayLocation}</Text>
          <Text style={styles.propertyDistance}>🏠 {property.type?.type || 'Tipo no especificado'}</Text>
          <View style={styles.propertyDetails}>
            <Text style={styles.propertyPrice}>
              {typeof displayPrice === 'number' ? `L. ${displayPrice.toLocaleString()}/mes` : displayPrice}
            </Text>
            <Text style={styles.propertyBedrooms}>📐 {property.size || 0} m²</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <View>
              <Text style={styles.greeting}>¡Hola!</Text>
              <Text style={styles.username}>{user?.name || user?.email || 'Usuario'}</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.favoritesButton} onPress={() => navigation.navigate('Favorites')}>
                <Ionicons name="heart" size={20} color={Colors.white} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.profileButton} onPress={handleProfilePress}>
                <Image
                  source={getUserAvatar(user)}
                  style={styles.profileIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar apartamentos..."
              placeholderTextColor={Colors.textSecondary}
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
        </View>

        {/* Quick Filters */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Filtros rápidos</Text>
            {selectedFilter && (
              <TouchableOpacity 
                onPress={() => setSelectedFilter(null)}
                style={styles.clearFilterButton}
              >
                <Text style={styles.clearFilterText}>Limpiar</Text>
              </TouchableOpacity>
            )}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
            {filters.map((filter) => (
              <QuickFilterButton key={filter.id} filter={filter} />
            ))}
          </ScrollView>
        </View>

        {/* Results Counter */}
        {!loading && (
          <View style={styles.resultsCounter}>
            <Text style={styles.resultsText}>
              {properties.length} {properties.length === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}
              {(searchText || selectedFilter) && (
                <Text style={styles.filterIndicator}>
                  {searchText && ` • "${searchText}"`}
                  {selectedFilter && ` • ${filters.find(f => f.id === selectedFilter)?.label}`}
                </Text>
              )}
            </Text>
          </View>
        )}

        {/* Featured Properties */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Propiedades destacadas</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Ver todas</Text>
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>
                {searchText ? 'Buscando propiedades...' : 'Cargando propiedades...'}
              </Text>
            </View>
          ) : properties.length > 0 ? (
            properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchText ? '🔍' : selectedFilter ? '🔧' : '🏠'}
              </Text>
              <Text style={styles.emptyTitle}>
                {searchText && selectedFilter 
                  ? `No se encontraron propiedades para "${searchText}" con el filtro aplicado`
                  : searchText 
                  ? `No se encontraron propiedades para "${searchText}"`
                  : selectedFilter
                  ? `No hay propiedades disponibles para este filtro`
                  : 'No hay propiedades disponibles'
                }
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchText || selectedFilter
                  ? 'Intenta con otros criterios de búsqueda' 
                  : 'Vuelve a intentar más tarde'
                }
              </Text>
              {searchText || selectedFilter ? (
                <TouchableOpacity 
                  style={styles.retryButton} 
                  onPress={() => {
                    setSearchText('');
                    setSelectedFilter(null);
                  }}
                >
                  <Text style={styles.retryButtonText}>Limpiar filtros</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.retryButton} onPress={loadProperties}>
                  <Text style={styles.retryButtonText}>Reintentar</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Accesos rápidos</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Map')}
            >
              <Text style={styles.actionIcon}>🗺️</Text>
              <Text style={styles.actionText}>Mapa</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>❤️</Text>
              <Text style={styles.actionText}>Favoritos</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>📝</Text>
              <Text style={styles.actionText}>Aplicaciones</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>💬</Text>
              <Text style={styles.actionText}>Mensajes</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Sizes.lg,
    paddingTop: Sizes.md,
    paddingBottom: Sizes.xl,
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: Sizes.fontMD,
    color: Colors.white + 'CC',
    marginBottom: Sizes.xs,
  },
  username: {
    fontSize: Sizes.fontLG,
    fontWeight: 'bold',
    color: Colors.white,
  },
  favoritesButton: {
    backgroundColor: Colors.white + '20',
    borderRadius: 20,
    padding: Sizes.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileButton: {
    backgroundColor: Colors.white + '20',
    borderRadius: 25,
    padding: Sizes.sm,
  },
  profileIcon: {
    width: 24,
    height: 24,
    tintColor: Colors.white,
  },
  searchContainer: {
    paddingHorizontal: Sizes.lg,
    marginTop: -Sizes.lg,
    marginBottom: Sizes.lg,
  },
  searchBar: {
    backgroundColor: Colors.white,
    borderRadius: Sizes.borderRadiusLG,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    shadowColor: Colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: Sizes.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Sizes.fontMD,
    color: Colors.textPrimary,
  },
  section: {
    paddingHorizontal: Sizes.lg,
    marginBottom: Sizes.lg,
  },
  sectionTitle: {
    fontSize: Sizes.fontLG,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Sizes.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Sizes.md,
  },
  seeAllText: {
    fontSize: Sizes.fontMD,
    color: Colors.primary,
    fontWeight: '600',
  },
  filtersContainer: {
    marginHorizontal: -Sizes.lg,
    paddingHorizontal: Sizes.lg,
  },
  filterButton: {
    backgroundColor: Colors.white,
    borderRadius: Sizes.borderRadiusLG,
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    marginRight: Sizes.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterIcon: {
    fontSize: 16,
    marginRight: Sizes.xs,
  },
  filterText: {
    fontSize: Sizes.fontSM,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: Colors.white,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: Sizes.xxl,
  },
  loadingText: {
    fontSize: Sizes.fontMD,
    color: Colors.textSecondary,
    marginTop: Sizes.md,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Sizes.xxl,
  },
  emptyText: {
    fontSize: 48,
    marginBottom: Sizes.md,
  },
  emptyTitle: {
    fontSize: Sizes.fontLG,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Sizes.sm,
  },
  emptySubtitle: {
    fontSize: Sizes.fontMD,
    color: Colors.textSecondary,
    marginBottom: Sizes.lg,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    borderRadius: Sizes.borderRadius,
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.sm,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: Sizes.fontMD,
    fontWeight: '600',
  },
  propertyCard: {
    backgroundColor: Colors.white,
    borderRadius: Sizes.borderRadiusLG,
    marginBottom: Sizes.md,
    shadowColor: Colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  unavailableBadge: {
    position: 'absolute',
    top: Sizes.sm,
    right: Sizes.sm,
    backgroundColor: Colors.error,
    borderRadius: Sizes.borderRadius,
    paddingHorizontal: Sizes.sm,
    paddingVertical: Sizes.xs,
  },
  unavailableText: {
    fontSize: Sizes.fontXS,
    color: Colors.white,
    fontWeight: '600',
  },
  ratingBadge: {
    position: 'absolute',
    top: Sizes.sm,
    right: Sizes.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: Sizes.borderRadius,
    paddingHorizontal: Sizes.sm,
    paddingVertical: Sizes.xs,
  },
  ratingText: {
    fontSize: Sizes.fontXS,
    color: Colors.white,
    fontWeight: '600',
  },
  favoriteButtonContainer: {
    position: 'absolute',
    top: Sizes.sm,
    left: Sizes.sm,
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
  propertyDistance: {
    fontSize: Sizes.fontSM,
    color: Colors.textSecondary,
    marginBottom: Sizes.sm,
  },
  propertyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  propertyPrice: {
    fontSize: Sizes.fontLG,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  propertyBedrooms: {
    fontSize: Sizes.fontSM,
    color: Colors.textSecondary,
  },
  quickActions: {
    paddingHorizontal: Sizes.lg,
    marginBottom: Sizes.lg,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: Colors.white,
    borderRadius: Sizes.borderRadiusLG,
    width: '48%',
    paddingVertical: Sizes.lg,
    alignItems: 'center',
    marginBottom: Sizes.sm,
    shadowColor: Colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: Sizes.sm,
  },
  actionText: {
    fontSize: Sizes.fontMD,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  bottomSpacing: {
    height: Sizes.xl,
  },
  clearFilterButton: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: Sizes.sm,
    paddingVertical: Sizes.xs,
    borderRadius: Sizes.borderRadius,
  },
  clearFilterText: {
    color: Colors.white,
    fontSize: Sizes.fontXS,
    fontWeight: '600',
  },
  resultsCounter: {
    backgroundColor: Colors.lightGray,
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    marginHorizontal: Sizes.md,
    borderRadius: Sizes.borderRadius,
    marginBottom: Sizes.md,
  },
  resultsText: {
    fontSize: Sizes.fontSM,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  filterIndicator: {
    color: Colors.primary,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentsButton: {
    padding: Sizes.sm,
    marginRight: Sizes.sm,
    backgroundColor: Colors.primary + '15',
    borderRadius: Sizes.borderRadius,
  },
});