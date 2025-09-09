import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
// import PlacesMap from '../components/PlacesMap'; // Comentado temporalmente
import placesService from '../services/places.service';
import { Places, Geopoint } from '../types/types';

interface MapSearchScreenProps {
  navigation: any;
}

const MapSearchScreen: React.FC<MapSearchScreenProps> = ({ navigation }) => {
  const [places, setPlaces] = useState<Places[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchRadius, setSearchRadius] = useState(5);
  const [centerPoint, setCenterPoint] = useState<Geopoint | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    status: 'disponible',
    minSize: '',
    maxSize: '',
  });

  const searchNearbyPlaces = async (center: Geopoint, radius: number = searchRadius) => {
    try {
      setLoading(true);
      
      const filterObj = {
        type: filters.type || undefined,
        status: filters.status || undefined,
        minSize: filters.minSize ? parseInt(filters.minSize) : undefined,
        maxSize: filters.maxSize ? parseInt(filters.maxSize) : undefined,
      };

      const result = await placesService.getPlacesNearbyWithFilters(
        center,
        radius,
        filterObj
      );
      
      setPlaces(result.items || []);
      setCenterPoint(center);
      
      Alert.alert(
        'Búsqueda completada',
        `Se encontraron ${result.items?.length || 0} lugares en un radio de ${radius}km`
      );
    } catch (error) {
      console.error('Error buscando lugares:', error);
      Alert.alert('Error', 'No se pudieron buscar lugares cercanos');
    } finally {
      setLoading(false);
    }
  };

  const handleMapRegionChange = (region: any) => {
    // Opcional: buscar automáticamente cuando el usuario mueva el mapa
    // setCenterPoint({ lat: region.latitude, lng: region.longitude });
  };

  const handlePlacePress = (place: Places) => {
    navigation.navigate('PlaceDetail', { place });
  };

  const renderFiltersModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowFilters(false)}>
            <Text style={styles.modalCancelText}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Filtros de Búsqueda</Text>
          <TouchableOpacity onPress={() => setShowFilters(false)}>
            <Text style={styles.modalDoneText}>Listo</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Radio de búsqueda (km)</Text>
            <TextInput
              style={styles.filterInput}
              value={searchRadius.toString()}
              onChangeText={(text) => setSearchRadius(parseInt(text) || 5)}
              keyboardType="numeric"
              placeholder="5"
            />
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Tipo de propiedad</Text>
            <View style={styles.chipContainer}>
              {['', 'casa', 'departamento', 'local comercial', 'oficina'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.chip,
                    filters.type === type && styles.chipSelected
                  ]}
                  onPress={() => setFilters(prev => ({ ...prev, type }))}
                >
                  <Text style={[
                    styles.chipText,
                    filters.type === type && styles.chipTextSelected
                  ]}>
                    {type || 'Todos'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Estado</Text>
            <View style={styles.chipContainer}>
              {['', 'disponible', 'reservado', 'no disponible'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.chip,
                    filters.status === status && styles.chipSelected
                  ]}
                  onPress={() => setFilters(prev => ({ ...prev, status }))}
                >
                  <Text style={[
                    styles.chipText,
                    filters.status === status && styles.chipTextSelected
                  ]}>
                    {status || 'Todos'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Tamaño (m²)</Text>
            <View style={styles.sizeInputs}>
              <TextInput
                style={[styles.filterInput, { flex: 1, marginRight: 10 }]}
                value={filters.minSize}
                onChangeText={(text) => setFilters(prev => ({ ...prev, minSize: text }))}
                keyboardType="numeric"
                placeholder="Mínimo"
              />
              <TextInput
                style={[styles.filterInput, { flex: 1 }]}
                value={filters.maxSize}
                onChangeText={(text) => setFilters(prev => ({ ...prev, maxSize: text }))}
                keyboardType="numeric"
                placeholder="Máximo"
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header con controles */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Atrás</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Buscar en Mapa</Text>
        
        <TouchableOpacity 
          style={styles.filtersButton}
          onPress={() => setShowFilters(true)}
        >
          <Text style={styles.filtersButtonText}>🔧</Text>
        </TouchableOpacity>
      </View>

      {/* Información de búsqueda */}
      <View style={styles.searchInfo}>
        <Text style={styles.searchInfoText}>
          {places.length > 0 
            ? `${places.length} lugares encontrados en ${searchRadius}km`
            : 'Toca el botón de ubicación para buscar lugares cercanos'
          }
        </Text>
      </View>

      {/* Mapa temporal simplificado */}
      <View style={styles.mapContainer}>
        <Text style={styles.mapPlaceholder}>🗺️ Mapa en desarrollo</Text>
        <Text style={styles.resultsText}>
          {loading ? 'Buscando...' : `${places.length} lugares encontrados`}
        </Text>
        
        {/* Lista simple de resultados */}
        <ScrollView style={styles.resultsList}>
          {places.map((place) => (
            <TouchableOpacity
              key={place.id}
              style={styles.placeItem}
              onPress={() => handlePlacePress(place)}
            >
              <Text style={styles.placeTitle}>{place.title}</Text>
              <Text style={styles.placeType}>{place.type?.type} • {place.size}m²</Text>
              <Text style={styles.placeStatus}>{place.status?.status}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Botón de búsqueda */}
      <View style={styles.searchControls}>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => {
            if (centerPoint) {
              searchNearbyPlaces(centerPoint);
            } else {
              Alert.alert(
                'Ubicación requerida',
                'Primero obtén tu ubicación actual tocando el botón 📍 en el mapa'
              );
            }
          }}
          disabled={loading}
        >
          <Text style={styles.searchButtonText}>
            {loading ? 'Buscando...' : 'Buscar en esta área'}
          </Text>
        </TouchableOpacity>
      </View>

      {renderFiltersModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2196F3',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  filtersButton: {
    padding: 8,
  },
  filtersButtonText: {
    fontSize: 20,
  },
  searchInfo: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInfoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  searchControls: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  searchButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#f44336',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalDoneText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  filterGroup: {
    marginBottom: 25,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  filterInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipSelected: {
    backgroundColor: '#2196F3',
  },
  chipText: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  chipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  sizeInputs: {
    flexDirection: 'row',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    margin: 10,
    borderRadius: 8,
    padding: 20,
  },
  mapPlaceholder: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 10,
  },
  resultsText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  resultsList: {
    flex: 1,
  },
  placeItem: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  placeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  placeType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  placeStatus: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});

export default MapSearchScreen;
