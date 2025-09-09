import React, { useState, useEffect } from 'react';

import MapView, { 
  Marker, 
  PROVIDER_GOOGLE,
  Region, 
  Callout,
  Circle,
} from 'react-native-maps';
import {
  View,
  StyleSheet,
  Dimensions,
  Alert,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
// import MapView, { 
//   Marker, 
//   // PROVIDER_GOOGLE, // Comentado temporalmente para development
//   Region, 
//   Callout,
//   Circle,
// } from 'react-native-maps';
import * as Location from 'expo-location';
import { Places, Geopoint } from '../types/types';
import placesService from '../services/places.service';

interface PlacesMapProps {
  places?: Places[];
  initialRegion?: Region;
  onPlacePress?: (place: Places) => void;
  showUserLocation?: boolean;
  showSearchRadius?: boolean;
  searchRadius?: number; // en km
  centerPoint?: Geopoint;
  onRegionChange?: (region: Region) => void;
  height?: number;
}

const PlacesMap: React.FC<PlacesMapProps> = ({
  places = [],
  initialRegion,
  onPlacePress,
  showUserLocation = true,
  showSearchRadius = false,
  searchRadius = 5,
  centerPoint,
  onRegionChange,
  height = 300,
}) => {
  const [userLocation, setUserLocation] = useState<Geopoint | null>(null);
  const [mapRegion, setMapRegion] = useState<Region>(
    initialRegion || {
      latitude: 19.4326, // Ciudad de México por defecto
      longitude: -99.1332,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    }
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showUserLocation) {
      getCurrentLocation();
    }
  }, [showUserLocation]);

  useEffect(() => {
    if (centerPoint) {
      setMapRegion(prev => ({
        ...prev,
        latitude: centerPoint.lat,
        longitude: centerPoint.lng,
      }));
    }
  }, [centerPoint]);

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permisos requeridos',
          'Necesitamos acceso a tu ubicación para mostrarte lugares cercanos'
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const currentLocation: Geopoint = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };

      setUserLocation(currentLocation);
      
      // Actualizar región del mapa
      setMapRegion({
        latitude: currentLocation.lat,
        longitude: currentLocation.lng,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
      
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
      Alert.alert('Error', 'No se pudo obtener tu ubicación actual');
    } finally {
      setLoading(false);
    }
  };

  const getMarkerColor = (place: Places): string => {
    switch (place.status?.status) {
      case 'disponible': return '#4CAF50';
      case 'reservado': return '#FF9800';
      case 'no disponible': return '#f44336';
      default: return '#757575';
    }
  };

  const getPlaceTypeIcon = (type?: string): string => {
    switch (type) {
      case 'casa': return '🏠';
      case 'departamento': return '🏢';
      case 'local comercial': return '🏪';
      case 'oficina': return '🏢';
      default: return '📍';
    }
  };

  const handleMarkerPress = (place: Places) => {
    if (onPlacePress) {
      onPlacePress(place);
    }
  };

  const handleRegionChangeComplete = (region: Region) => {
    setMapRegion(region);
    if (onRegionChange) {
      onRegionChange(region);
    }
  };

  // Mapa con Google Maps
  return (
    <View style={[styles.container, { height }]}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Obteniendo ubicación...</Text>
        </View>
      )}

      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={mapRegion}
        onRegionChangeComplete={handleRegionChangeComplete}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={showUserLocation}
        showsCompass={true}
        showsScale={true}
        loadingEnabled={true}
        mapType="standard"
      >
        {/* Marcadores de lugares */}
        {places.map((place) => (
          <Marker
            key={place.id}
            coordinate={{
              latitude: place.location.lat,
              longitude: place.location.lng,
            }}
            pinColor={getMarkerColor(place)}
            onPress={() => handleMarkerPress(place)}
          >
            <Callout tooltip={false}>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{place.title}</Text>
                <Text style={styles.calloutType}>
                  {getPlaceTypeIcon(place.type?.type)} {place.type?.type}
                </Text>
                <Text style={styles.calloutSize}>{place.size}m²</Text>
                <View style={[
                  styles.calloutStatus,
                  { backgroundColor: getMarkerColor(place) }
                ]}>
                  <Text style={styles.calloutStatusText}>
                    {place.status?.status}
                  </Text>
                </View>
              </View>
            </Callout>
          </Marker>
        ))}

        {/* Círculo de búsqueda */}
        {showSearchRadius && (centerPoint || userLocation) && (
          <Circle
            center={{
              latitude: centerPoint?.lat || userLocation!.lat,
              longitude: centerPoint?.lng || userLocation!.lng,
            }}
            radius={searchRadius * 1000} // convertir km a metros
            strokeColor="rgba(33, 150, 243, 0.5)"
            fillColor="rgba(33, 150, 243, 0.1)"
            strokeWidth={2}
          />
        )}
      </MapView>

      {/* Botón para centrar en ubicación actual */}
      {showUserLocation && (
        <TouchableOpacity
          style={styles.locationButton}
          onPress={getCurrentLocation}
        >
          <Text style={styles.locationButtonText}>📍</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  callout: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  calloutType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  calloutSize: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  calloutStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  calloutStatusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  locationButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'white',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  locationButtonText: {
    fontSize: 24,
  },
});

export default PlacesMap;
