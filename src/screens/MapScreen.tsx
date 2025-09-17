import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  Linking,
  Platform,
} from 'react-native';
import * as Location from 'expo-location';
import { Colors, Sizes } from '../constants/Colors';
import placesService from '../../services/places.service';
import { Places, Geopoint } from '../../types/types';

interface MapScreenProps {
  navigation?: any;
}

export default function MapScreen({ navigation }: MapScreenProps) {
  const [properties, setProperties] = useState<Places[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [userLocation, setUserLocation] = useState<Geopoint | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);

  useEffect(() => {
    requestLocationPermission();
    loadProperties();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationPermission(true);
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        });
      } else {
        setLocationPermission(false);
        Alert.alert(
          'Permisos de ubicación',
          'Para una mejor experiencia, permite el acceso a la ubicación.'
        );
      }
    } catch (error) {
      console.error('Error al obtener permisos de ubicación:', error);
    }
  };

  const loadProperties = async () => {
    try {
      setLoading(true);
      
      const placesData = await placesService.getPlaces();
      
      // Convertir los datos de PocketBase a nuestro formato
      const formattedProperties: Places[] = placesData.items?.map((place: any) => ({
        id: place.id,
        title: place.title || 'Propiedad sin título',
        description: place.description || '',
        type: place.type || { type: 'departamento' },
        status: place.status || { status: 'disponible' },
        owner: place.owner || { name: 'Propietario' },
        location: place.location || { 
          lat: 14.0723 + (Math.random() - 0.5) * 0.02, 
          lng: -87.6431 + (Math.random() - 0.5) * 0.02 
        },
        size: place.size || 0,
        photos: place.photos || [],
        created: place.created,
        updated: place.updated,
      })) || [];

      // Si no hay ubicaciones reales, generar ubicaciones de ejemplo en Comayagua
      const propertiesWithLocations = formattedProperties.map((property, index) => ({
        ...property,
        location: property.location.lat === 0 ? {
          lat: 14.0723 + (Math.random() - 0.5) * 0.02,
          lng: -87.6431 + (Math.random() - 0.5) * 0.02,
        } : property.location
      }));
      
      setProperties(propertiesWithLocations);
    } catch (error) {
      console.error('MapScreen: Error al cargar propiedades:', error);
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

  const getEstimatedPrice = (size: number, type: string) => {
    const basePrice = type === 'departamento' ? 150 : 120;
    return Math.round(size * basePrice);
  };

  const isAvailable = (property: Places) => {
    return typeof property.status === 'string' 
      ? property.status === 'disponible' 
      : property.status?.status === 'disponible';
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getDistanceText = (property: Places) => {
    if (!userLocation) return 'Calculando distancia...';
    
    const distance = calculateDistance(
      userLocation.lat, 
      userLocation.lng, 
      property.location.lat, 
      property.location.lng
    );
    
    return distance < 1 
      ? `${Math.round(distance * 1000)}m` 
      : `${distance.toFixed(1)}km`;
  };

  const openInMaps = (property: Places) => {
    const { lat, lng } = property.location;
    const label = encodeURIComponent(property.title);
    
    const urls = {
      ios: `maps://app?daddr=${lat},${lng}&dirflg=d`,
      android: `geo:0,0?q=${lat},${lng}(${label})`,
      web: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    };
    
    const url = Platform.OS === 'ios' ? urls.ios : urls.android;
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        // Fallback a Google Maps en web
        Linking.openURL(urls.web);
      }
    }).catch(() => {
      Alert.alert('Error', 'No se pudo abrir la aplicación de mapas');
    });
  };

  const openAllPropertiesInMap = () => {
    if (properties.length === 0) return;
    
    // Crear una URL de Google Maps con múltiples marcadores
    const markers = properties.slice(0, 10).map(property => // Límite de 10 para evitar URL muy largas
      `${property.location.lat},${property.location.lng}`
    ).join('|');
    
    const url = `https://www.google.com/maps/dir/?api=1&destination=${properties[0].location.lat},${properties[0].location.lng}&waypoints=${markers}`;
    
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'No se pudo abrir Google Maps');
    });
  };

  const filteredProperties = properties.filter(property =>
    property.title.toLowerCase().includes(searchText.toLowerCase()) ||
    property.type?.type?.toLowerCase().includes(searchText.toLowerCase())
  );

  const PropertyCard = ({ property }: { property: Places }) => (
    <View style={styles.propertyCard}>
      <View style={styles.propertyHeader}>
        <View style={styles.propertyTitleContainer}>
          <Text style={styles.propertyIcon}>
            {property.type?.type === 'casa' ? '🏡' : 
             property.type?.type === 'departamento' ? '🏠' : 
             property.type?.type === 'local comercial' ? '🏪' : 
             property.type?.type === 'oficina' ? '🏢' : '🏠'}
          </Text>
          <View style={styles.propertyTexts}>
            <Text style={styles.propertyTitle}>{property.title}</Text>
            <Text style={styles.propertyLocation}>
              📍 {property.location?.lat ? `${property.location.lat.toFixed(4)}, ${property.location.lng.toFixed(4)}` : 'Ubicación no disponible'}
            </Text>
          </View>
        </View>
        
        <View style={[
          styles.statusBadge,
          isAvailable(property) ? styles.availableBadge : styles.unavailableBadge
        ]}>
          <Text style={styles.statusText}>
            {isAvailable(property) ? 'Disponible' : 'No disponible'}
          </Text>
        </View>
      </View>
      
      <View style={styles.propertyDetails}>
        <View style={styles.propertyInfo}>
          <Text style={styles.propertyPrice}>
            L. {getEstimatedPrice(property.size || 50, property.type?.type || 'departamento').toLocaleString()}/mes
          </Text>
          <Text style={styles.propertySize}>📐 {property.size || 0} m²</Text>
          {userLocation && (
            <Text style={styles.propertyDistance}>
              🚶‍♂️ {getDistanceText(property)} de tu ubicación
            </Text>
          )}
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.mapButton}
            onPress={() => openInMaps(property)}
          >
            <Text style={styles.mapButtonText}>🗺️ Mapas</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.detailsButton}
            onPress={() => navigation?.navigate('PropertyDetail', { propertyId: property.id })}
          >
            <Text style={styles.detailsButtonText}>👁️ Detalles</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Ubicaciones</Text>
        
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={openAllPropertiesInMap}
        >
          <Text style={styles.filterIcon}>🗺️</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar propiedades..."
            placeholderTextColor={Colors.textSecondary}
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* Location Status */}
      <View style={styles.locationStatus}>
        <Text style={styles.locationStatusText}>
          {locationPermission 
            ? `📍 Tu ubicación: ${userLocation ? 'Detectada' : 'Obteniendo...'}`
            : '📍 Ubicación no disponible'
          }
        </Text>
        <Text style={styles.propertiesCount}>
          {filteredProperties.length} propiedades encontradas
        </Text>
      </View>

      {/* Properties List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando propiedades...</Text>
        </View>
      ) : (
        <ScrollView style={styles.propertiesList} showsVerticalScrollIndicator={false}>
          {filteredProperties.length > 0 ? (
            <>
              {filteredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
              
              {/* Open All in Maps Button */}
              <TouchableOpacity 
                style={styles.openAllButton}
                onPress={openAllPropertiesInMap}
              >
                <Text style={styles.openAllButtonText}>🗺️ Ver todas en Google Maps</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🏠</Text>
              <Text style={styles.emptyTitle}>No se encontraron propiedades</Text>
              <Text style={styles.emptySubtitle}>
                {searchText ? 'Intenta con otros términos de búsqueda' : 'No hay propiedades disponibles'}
              </Text>
            </View>
          )}
          
          <View style={styles.bottomSpacing} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    backgroundColor: Colors.white,
    shadowColor: Colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: Sizes.sm,
  },
  backIcon: {
    fontSize: 24,
    color: Colors.primary,
  },
  headerTitle: {
    fontSize: Sizes.fontLG,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  filterButton: {
    padding: Sizes.sm,
  },
  filterIcon: {
    fontSize: 20,
  },
  searchContainer: {
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    backgroundColor: Colors.white,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Sizes.borderRadius,
    paddingHorizontal: Sizes.sm,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: Sizes.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Sizes.sm,
    fontSize: Sizes.fontMD,
    color: Colors.textPrimary,
  },
  locationStatus: {
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    backgroundColor: Colors.primaryLight + '20',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationStatusText: {
    fontSize: Sizes.fontSM,
    color: Colors.primary,
    fontWeight: '500',
  },
  propertiesCount: {
    fontSize: Sizes.fontSM,
    color: Colors.textSecondary,
  },
  propertiesList: {
    flex: 1,
    paddingHorizontal: Sizes.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Sizes.md,
    fontSize: Sizes.fontMD,
    color: Colors.textSecondary,
  },
  propertyCard: {
    backgroundColor: Colors.white,
    borderRadius: Sizes.borderRadiusLG,
    padding: Sizes.md,
    marginVertical: Sizes.sm,
    shadowColor: Colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  propertyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Sizes.sm,
  },
  propertyTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  propertyIcon: {
    fontSize: 24,
    marginRight: Sizes.sm,
  },
  propertyTexts: {
    flex: 1,
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
  },
  statusBadge: {
    paddingHorizontal: Sizes.sm,
    paddingVertical: Sizes.xs,
    borderRadius: Sizes.borderRadius,
  },
  availableBadge: {
    backgroundColor: Colors.success + '20',
  },
  unavailableBadge: {
    backgroundColor: Colors.error + '20',
  },
  statusText: {
    fontSize: Sizes.fontXS,
    fontWeight: '600',
  },
  propertyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  propertyInfo: {
    flex: 1,
  },
  propertyPrice: {
    fontSize: Sizes.fontLG,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Sizes.xs,
  },
  propertySize: {
    fontSize: Sizes.fontSM,
    color: Colors.textSecondary,
    marginBottom: Sizes.xs,
  },
  propertyDistance: {
    fontSize: Sizes.fontSM,
    color: Colors.textSecondary,
  },
  mapButton: {
    backgroundColor: Colors.primary,
    borderRadius: Sizes.borderRadius,
    paddingHorizontal: Sizes.sm,
    paddingVertical: Sizes.xs,
    flex: 1,
    marginRight: Sizes.xs,
  },
  mapButtonText: {
    color: Colors.white,
    fontSize: Sizes.fontXS,
    fontWeight: '600',
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Sizes.xs,
  },
  detailsButton: {
    backgroundColor: Colors.secondary,
    borderRadius: Sizes.borderRadius,
    paddingHorizontal: Sizes.sm,
    paddingVertical: Sizes.xs,
    flex: 1,
  },
  detailsButtonText: {
    color: Colors.white,
    fontSize: Sizes.fontXS,
    fontWeight: '600',
    textAlign: 'center',
  },
  openAllButton: {
    backgroundColor: Colors.secondary,
    borderRadius: Sizes.borderRadiusLG,
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.lg,
    marginVertical: Sizes.lg,
    alignItems: 'center',
  },
  openAllButtonText: {
    color: Colors.white,
    fontSize: Sizes.fontMD,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Sizes.xxl,
  },
  emptyIcon: {
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
    textAlign: 'center',
  },
  bottomSpacing: {
    height: Sizes.xl,
  },
});