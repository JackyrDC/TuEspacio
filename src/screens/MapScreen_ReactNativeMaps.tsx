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
} from 'react-native';
import { WebView } from 'react-native-webview';
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
  const [selectedProperty, setSelectedProperty] = useState<Places | null>(null);
  const [region, setRegion] = useState<Region>({
    latitude: 14.0723, // Comayagua, Honduras
    longitude: -87.6431,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      console.log('MapScreen: Loading properties...');
      
      const placesData = await placesService.getPlaces();
      console.log('MapScreen: Properties loaded:', placesData.items?.length || 0);
      
      // Convertir los datos de PocketBase a nuestro formato
      const formattedProperties: Places[] = placesData.items?.map((place: any) => ({
        id: place.id,
        title: place.title || 'Propiedad sin título',
        description: place.description || '',
        type: place.type || { type: 'departamento' },
        status: place.status || { status: 'disponible' },
        owner: place.owner || { name: 'Propietario' },
        location: place.location || { lat: 14.0723 + (Math.random() - 0.5) * 0.02, lng: -87.6431 + (Math.random() - 0.5) * 0.02 },
        size: place.size || 0,
        photos: place.photos || [],
        created: place.created,
        updated: place.updated,
      })) || [];

      // Si no hay ubicaciones reales, generar ubicaciones de ejemplo en Comayagua
      const propertiesWithLocations = formattedProperties.map((property, index) => ({
        ...property,
        location: property.location.lat === 0 ? {
          lat: 14.0723 + (Math.random() - 0.5) * 0.02, // Pequeña variación alrededor de Comayagua
          lng: -87.6431 + (Math.random() - 0.5) * 0.02,
        } : property.location
      }));
      
      setProperties(propertiesWithLocations);
    } catch (error) {
      console.error('MapScreen: Error loading properties:', error);
      Alert.alert(
        'Error',
        'No se pudieron cargar las propiedades en el mapa. Intenta de nuevo.',
        [
          { text: 'Reintentar', onPress: loadProperties },
          { text: 'OK' }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const searchLocation = async () => {
    if (!searchText.trim()) {
      Alert.alert('Búsqueda', 'Ingresa una ubicación para buscar');
      return;
    }

    try {
      // Simulación de búsqueda de ubicación
      // En una app real, usarías geocoding API
      const searchTerms = searchText.toLowerCase();
      
      let newRegion = { ...region };
      
      if (searchTerms.includes('unah') || searchTerms.includes('universidad')) {
        newRegion = {
          latitude: 14.0838,
          longitude: -87.2068,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        };
      } else if (searchTerms.includes('comayagua') || searchTerms.includes('centro')) {
        newRegion = {
          latitude: 14.0723,
          longitude: -87.6431,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        };
      }
      
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 1000);
      
    } catch (error) {
      Alert.alert('Error', 'No se pudo encontrar la ubicación');
    }
  };

  const getEstimatedPrice = (size: number, type: string) => {
    const basePrice = type === 'departamento' ? 150 : 120; // precio por m²
    return Math.round(size * basePrice);
  };

  const isAvailable = (property: Places) => {
    return typeof property.status === 'string' 
      ? property.status === 'disponible' 
      : property.status?.status === 'disponible';
  };

  const handleMarkerPress = (property: Places) => {
    setSelectedProperty(property);
    
    // Centrar el mapa en la propiedad seleccionada
    const newRegion = {
      latitude: property.location.lat,
      longitude: property.location.lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    
    mapRef.current?.animateToRegion(newRegion, 500);
  };

  const goToPropertyDetails = (property: Places) => {
    // TODO: Navegar a PropertyDetailScreen cuando esté implementada
    Alert.alert(
      property.title,
      `Detalles de la propiedad:\n\n` +
      `Tipo: ${property.type?.type || 'N/A'}\n` +
      `Tamaño: ${property.size || 0} m²\n` +
      `Precio estimado: L. ${getEstimatedPrice(property.size || 50, property.type?.type || 'departamento').toLocaleString()}/mes\n` +
      `Estado: ${isAvailable(property) ? 'Disponible' : 'No disponible'}`,
      [
        { text: 'Cerrar' },
        { text: 'Ver detalles', onPress: () => console.log('Navigate to details') }
      ]
    );
  };

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
        
        <Text style={styles.headerTitle}>Mapa de Propiedades</Text>
        
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar ubicación (ej: UNAH, Centro)..."
            placeholderTextColor={Colors.textSecondary}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={searchLocation}
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.searchButton} onPress={searchLocation}>
            <Text style={styles.searchIcon}>🔍</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Cargando propiedades...</Text>
          </View>
        ) : (
          <MapView
            ref={mapRef}
            style={styles.map}
            region={region}
            onRegionChangeComplete={setRegion}
            showsUserLocation={true}
            showsMyLocationButton={true}
          >
            {properties.map((property) => (
              <Marker
                key={property.id}
                coordinate={{
                  latitude: property.location.lat,
                  longitude: property.location.lng,
                }}
                onPress={() => handleMarkerPress(property)}
              >
                <View style={[
                  styles.customMarker,
                  !isAvailable(property) && styles.unavailableMarker
                ]}>
                  <Text style={styles.markerText}>
                    {property.type?.type === 'casa' ? '🏡' : 
                     property.type?.type === 'departamento' ? '🏠' : 
                     property.type?.type === 'local comercial' ? '🏪' : 
                     property.type?.type === 'oficina' ? '🏢' : '🏠'}
                  </Text>
                </View>
                
                <Callout onPress={() => goToPropertyDetails(property)}>
                  <View style={styles.calloutContainer}>
                    <Text style={styles.calloutTitle}>{property.title}</Text>
                    <Text style={styles.calloutPrice}>
                      L. {getEstimatedPrice(property.size || 50, property.type?.type || 'departamento').toLocaleString()}/mes
                    </Text>
                    <Text style={styles.calloutSize}>📐 {property.size || 0} m²</Text>
                    <Text style={styles.calloutStatus}>
                      {isAvailable(property) ? '✅ Disponible' : '❌ No disponible'}
                    </Text>
                    <Text style={styles.calloutAction}>Toca para ver detalles</Text>
                  </View>
                </Callout>
              </Marker>
            ))}
          </MapView>
        )}
      </View>

      {/* Selected Property Card */}
      {selectedProperty && (
        <View style={styles.selectedPropertyCard}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setSelectedProperty(null)}
          >
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
          
          <View style={styles.selectedPropertyInfo}>
            <Text style={styles.selectedPropertyTitle}>{selectedProperty.title}</Text>
            <Text style={styles.selectedPropertyPrice}>
              L. {getEstimatedPrice(selectedProperty.size || 50, selectedProperty.type?.type || 'departamento').toLocaleString()}/mes
            </Text>
            <Text style={styles.selectedPropertyDetails}>
              📐 {selectedProperty.size || 0} m² • {selectedProperty.type?.type || 'N/A'}
            </Text>
            <Text style={[
              styles.selectedPropertyStatus,
              isAvailable(selectedProperty) ? styles.availableStatus : styles.unavailableStatus
            ]}>
              {isAvailable(selectedProperty) ? '✅ Disponible' : '❌ No disponible'}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.viewDetailsButton}
            onPress={() => goToPropertyDetails(selectedProperty)}
          >
            <Text style={styles.viewDetailsText}>Ver detalles</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Properties Count */}
      <View style={styles.propertiesCount}>
        <Text style={styles.countText}>
          {properties.length} propiedades encontradas
        </Text>
      </View>
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
  searchInput: {
    flex: 1,
    paddingVertical: Sizes.sm,
    fontSize: Sizes.fontMD,
    color: Colors.textPrimary,
  },
  searchButton: {
    padding: Sizes.sm,
  },
  searchIcon: {
    fontSize: 18,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: Sizes.md,
    fontSize: Sizes.fontMD,
    color: Colors.textSecondary,
  },
  customMarker: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  unavailableMarker: {
    backgroundColor: Colors.error,
  },
  markerText: {
    fontSize: 18,
  },
  calloutContainer: {
    width: 200,
    padding: Sizes.sm,
  },
  calloutTitle: {
    fontSize: Sizes.fontMD,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Sizes.xs,
  },
  calloutPrice: {
    fontSize: Sizes.fontMD,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Sizes.xs,
  },
  calloutSize: {
    fontSize: Sizes.fontSM,
    color: Colors.textSecondary,
    marginBottom: Sizes.xs,
  },
  calloutStatus: {
    fontSize: Sizes.fontSM,
    marginBottom: Sizes.xs,
  },
  calloutAction: {
    fontSize: Sizes.fontXS,
    color: Colors.primary,
    fontStyle: 'italic',
  },
  selectedPropertyCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: Colors.white,
    borderRadius: Sizes.borderRadiusLG,
    padding: Sizes.md,
    shadowColor: Colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: Sizes.sm,
    right: Sizes.sm,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  selectedPropertyInfo: {
    marginRight: 40,
    marginBottom: Sizes.sm,
  },
  selectedPropertyTitle: {
    fontSize: Sizes.fontLG,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Sizes.xs,
  },
  selectedPropertyPrice: {
    fontSize: Sizes.fontMD,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Sizes.xs,
  },
  selectedPropertyDetails: {
    fontSize: Sizes.fontSM,
    color: Colors.textSecondary,
    marginBottom: Sizes.xs,
  },
  selectedPropertyStatus: {
    fontSize: Sizes.fontSM,
    fontWeight: '500',
  },
  availableStatus: {
    color: Colors.success,
  },
  unavailableStatus: {
    color: Colors.error,
  },
  viewDetailsButton: {
    backgroundColor: Colors.primary,
    borderRadius: Sizes.borderRadius,
    paddingVertical: Sizes.sm,
    paddingHorizontal: Sizes.md,
    alignSelf: 'flex-start',
  },
  viewDetailsText: {
    color: Colors.white,
    fontSize: Sizes.fontMD,
    fontWeight: '600',
  },
  propertiesCount: {
    position: 'absolute',
    top: 120,
    left: 20,
    backgroundColor: Colors.white,
    borderRadius: Sizes.borderRadius,
    paddingHorizontal: Sizes.sm,
    paddingVertical: Sizes.xs,
    shadowColor: Colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  countText: {
    fontSize: Sizes.fontSM,
    color: Colors.textSecondary,
  },
});