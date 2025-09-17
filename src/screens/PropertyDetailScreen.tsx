import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Colors, Sizes } from '../constants/Colors';
import { Places } from '../../types/types';
import placesService from '../../services/places.service';

interface PropertyDetailScreenProps {
  navigation?: any;
  route?: {
    params: {
      propertyId: string;
    };
  };
}

const { width: screenWidth } = Dimensions.get('window');

export default function PropertyDetailScreen({ navigation, route }: PropertyDetailScreenProps) {
  const [property, setProperty] = useState<Places | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const propertyId = route?.params?.propertyId;

  useEffect(() => {
    if (propertyId) {
      loadPropertyDetails();
    }
  }, [propertyId]);

  const loadPropertyDetails = async () => {
    try {
      setLoading(true);
      
      if (!propertyId) {
        throw new Error('ID de propiedad requerido');
      }
      
      const propertyData = await placesService.getPlaceById(propertyId);
      
      // Convertir los datos de PocketBase a nuestro formato
      const formattedProperty: Places = {
        id: propertyData.id,
        title: propertyData.title || 'Propiedad sin título',
        description: propertyData.description || 'Esta es una hermosa propiedad ubicada en una zona privilegiada de Comayagua. Cuenta con excelente acceso a transporte público y está cerca de universidades, centros comerciales y servicios básicos.',
        type: propertyData.type || { type: 'departamento' },
        status: propertyData.status || { status: 'disponible' },
        owner: propertyData.owner || { 
          name: 'Juan Pérez',
          email: 'juan.perez@email.com',
          phone: '+504 9999-9999'
        },
        location: propertyData.location || { 
          lat: 14.0723 + (Math.random() - 0.5) * 0.02, 
          lng: -87.6431 + (Math.random() - 0.5) * 0.02 
        },
        size: propertyData.size || Math.floor(Math.random() * 100) + 50,
        photos: propertyData.photos || [],
        created: propertyData.created,
        updated: propertyData.updated,
      };

      setProperty(formattedProperty);
    } catch (error) {
      console.error('PropertyDetail: Error al cargar propiedad:', error);
      Alert.alert(
        'Error',
        'No se pudo cargar la información de la propiedad.',
        [
          { text: 'Volver', onPress: () => navigation?.goBack() },
          { text: 'Reintentar', onPress: loadPropertyDetails }
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

  const isAvailable = () => {
    if (!property) return false;
    return typeof property.status === 'string' 
      ? property.status === 'disponible' 
      : property.status?.status === 'disponible';
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: Implementar guardado en base de datos
    Alert.alert(
      isFavorite ? 'Eliminado de favoritos' : 'Agregado a favoritos',
      isFavorite 
        ? 'Esta propiedad fue eliminada de tus favoritos' 
        : 'Esta propiedad fue agregada a tus favoritos'
    );
  };

  const contactOwner = (method: 'phone' | 'email' | 'whatsapp') => {
    if (!property?.owner) return;

    const ownerContact = {
      phone: '+504 9999-9999',
      ...property.owner
    };

    switch (method) {
      case 'phone':
        Linking.openURL(`tel:${ownerContact.phone}`);
        break;
      case 'email':
        Linking.openURL(`mailto:${ownerContact.email}?subject=Consulta sobre ${property.title}`);
        break;
      case 'whatsapp':
        const message = encodeURIComponent(`Hola! Estoy interesado en la propiedad "${property.title}". ¿Podrías darme más información?`);
        Linking.openURL(`whatsapp://send?phone=${ownerContact.phone.replace(/[+\s-]/g, '')}&text=${message}`);
        break;
    }
  };

  const openInMaps = () => {
    if (!property?.location) return;
    
    const { lat, lng } = property.location;
    const label = encodeURIComponent(property.title);
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    
    Linking.openURL(url);
  };

  const requestVisit = () => {
    Alert.alert(
      'Solicitar visita',
      '¿Te gustaría programar una visita a esta propiedad?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Contactar por WhatsApp', 
          onPress: () => contactOwner('whatsapp')
        },
        { 
          text: 'Llamar', 
          onPress: () => contactOwner('phone')
        }
      ]
    );
  };

  // Datos simulados para amenidades y características
  const amenities = [
    { icon: '💡', name: 'Electricidad', available: true },
    { icon: '💧', name: 'Agua potable', available: true },
    { icon: '📶', name: 'Internet/WiFi', available: true },
    { icon: '🚗', name: 'Estacionamiento', available: property?.size && property.size > 60 },
    { icon: '🛋️', name: 'Amueblado', available: Math.random() > 0.5 },
    { icon: '🔒', name: 'Seguridad 24/7', available: Math.random() > 0.3 },
    { icon: '🏊‍♂️', name: 'Piscina', available: property?.size && property.size > 80 },
    { icon: '💪', name: 'Gimnasio', available: Math.random() > 0.7 },
  ];

  const nearbyPlaces = [
    { icon: '🎓', name: 'UNAH', distance: '1.2 km' },
    { icon: '🏥', name: 'Hospital', distance: '0.8 km' },
    { icon: '🛒', name: 'Supermercado', distance: '0.5 km' },
    { icon: '🚌', name: 'Parada de bus', distance: '0.2 km' },
    { icon: '🏦', name: 'Banco', distance: '0.7 km' },
    { icon: '⛽', name: 'Gasolinera', distance: '0.4 km' },
  ];

  // Imágenes simuladas (en una app real vendrían de property.photos)
  const imageGallery = property?.photos && property.photos.length > 0 
    ? property.photos 
    : [
        '🏠', '🛏️', '🍽️', '🚿', '🏡'
      ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando detalles...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!property) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>🏠</Text>
          <Text style={styles.errorTitle}>Propiedad no encontrada</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation?.goBack()}
          >
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageGallery}>
          <ScrollView 
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false}
            onScroll={(event) => {
              const contentOffset = event.nativeEvent.contentOffset.x;
              const index = Math.round(contentOffset / screenWidth);
              setCurrentImageIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {imageGallery.map((image, index) => (
              <View key={index} style={styles.imageContainer}>
                <Text style={styles.placeholderImage}>{image}</Text>
              </View>
            ))}
          </ScrollView>
          
          {/* Image Indicators */}
          <View style={styles.imageIndicators}>
            {imageGallery.map((_, index) => (
              <View 
                key={index} 
                style={[
                  styles.indicator,
                  currentImageIndex === index && styles.activeIndicator
                ]} 
              />
            ))}
          </View>

          {/* Back Button */}
          <TouchableOpacity 
            style={styles.headerBackButton}
            onPress={() => navigation?.goBack()}
          >
            <Text style={styles.headerBackIcon}>←</Text>
          </TouchableOpacity>

          {/* Favorite Button */}
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={toggleFavorite}
          >
            <Text style={styles.favoriteIcon}>
              {isFavorite ? '❤️' : '🤍'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Property Info */}
        <View style={styles.propertyInfo}>
          {/* Title and Status */}
          <View style={styles.titleSection}>
            <View style={styles.titleContainer}>
              <Text style={styles.propertyTitle}>{property.title}</Text>
              <View style={[
                styles.statusBadge,
                isAvailable() ? styles.availableBadge : styles.unavailableBadge
              ]}>
                <Text style={[
                  styles.statusText,
                  isAvailable() ? styles.availableText : styles.unavailableText
                ]}>
                  {isAvailable() ? 'Disponible' : 'No disponible'}
                </Text>
              </View>
            </View>
            
            <Text style={styles.propertyType}>
              {property.type?.type || 'Tipo no especificado'} • {property.size || 0} m²
            </Text>
            
            <Text style={styles.propertyPrice}>
              L. {getEstimatedPrice(property.size || 50, property.type?.type || 'departamento').toLocaleString()}/mes
            </Text>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.description}>{property.description}</Text>
          </View>

          {/* Amenities */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amenidades</Text>
            <View style={styles.amenitiesGrid}>
              {amenities.map((amenity, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.amenityItem,
                    !amenity.available && styles.amenityUnavailable
                  ]}
                >
                  <Text style={styles.amenityIcon}>{amenity.icon}</Text>
                  <Text style={[
                    styles.amenityText,
                    !amenity.available && styles.amenityTextUnavailable
                  ]}>
                    {amenity.name}
                  </Text>
                  {amenity.available && <Text style={styles.checkIcon}>✓</Text>}
                </View>
              ))}
            </View>
          </View>

          {/* Location and Nearby */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ubicación y alrededores</Text>
            
            <TouchableOpacity style={styles.locationButton} onPress={openInMaps}>
              <Text style={styles.locationIcon}>📍</Text>
              <View style={styles.locationInfo}>
                <Text style={styles.locationText}>
                  {property.location?.lat ? 
                    `${property.location.lat.toFixed(4)}, ${property.location.lng.toFixed(4)}` : 
                    'Coordenadas no disponibles'
                  }
                </Text>
                <Text style={styles.locationSubtext}>Toca para abrir en Google Maps</Text>
              </View>
              <Text style={styles.mapIcon}>🗺️</Text>
            </TouchableOpacity>

            <View style={styles.nearbyPlaces}>
              {nearbyPlaces.map((place, index) => (
                <View key={index} style={styles.nearbyItem}>
                  <Text style={styles.nearbyIcon}>{place.icon}</Text>
                  <Text style={styles.nearbyName}>{place.name}</Text>
                  <Text style={styles.nearbyDistance}>{place.distance}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Owner Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información del propietario</Text>
            <View style={styles.ownerCard}>
              <View style={styles.ownerInfo}>
                <Text style={styles.ownerIcon}>👤</Text>
                <View style={styles.ownerDetails}>
                  <Text style={styles.ownerName}>
                    {property.owner?.name || 'Propietario'}
                  </Text>
                  <Text style={styles.ownerContact}>
                    Propietario verificado
                  </Text>
                </View>
              </View>
              
              <View style={styles.contactButtons}>
                <TouchableOpacity 
                  style={[styles.contactButton, styles.phoneButton]}
                  onPress={() => contactOwner('phone')}
                >
                  <Text style={styles.contactButtonText}>📞 Llamar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.contactButton, styles.whatsappButton]}
                  onPress={() => contactOwner('whatsapp')}
                >
                  <Text style={styles.contactButtonText}>💬 WhatsApp</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      {isAvailable() && (
        <View style={styles.bottomActionBar}>
          <TouchableOpacity 
            style={styles.visitButton}
            onPress={requestVisit}
          >
            <Text style={styles.visitButtonText}>🏠 Solicitar visita</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={() => contactOwner('whatsapp')}
          >
            <Text style={styles.contactButtonText}>💬 Contactar</Text>
          </TouchableOpacity>
        </View>
      )}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Sizes.lg,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: Sizes.lg,
  },
  errorTitle: {
    fontSize: Sizes.fontLG,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Sizes.lg,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: Colors.primary,
    borderRadius: Sizes.borderRadius,
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.sm,
  },
  backButtonText: {
    color: Colors.white,
    fontSize: Sizes.fontMD,
    fontWeight: '600',
  },
  imageGallery: {
    height: 300,
    position: 'relative',
  },
  imageContainer: {
    width: screenWidth,
    height: 300,
    backgroundColor: Colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderImage: {
    fontSize: 80,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: Colors.white,
  },
  headerBackButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBackIcon: {
    fontSize: 20,
    color: Colors.white,
  },
  favoriteButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteIcon: {
    fontSize: 20,
  },
  propertyInfo: {
    flex: 1,
    backgroundColor: Colors.white,
    borderTopLeftRadius: Sizes.borderRadiusLG,
    borderTopRightRadius: Sizes.borderRadiusLG,
    marginTop: -20,
    paddingTop: Sizes.lg,
    paddingHorizontal: Sizes.lg,
  },
  titleSection: {
    marginBottom: Sizes.lg,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Sizes.sm,
  },
  propertyTitle: {
    flex: 1,
    fontSize: Sizes.fontXL,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginRight: Sizes.md,
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
    fontSize: Sizes.fontSM,
    fontWeight: '600',
  },
  availableText: {
    color: Colors.success,
  },
  unavailableText: {
    color: Colors.error,
  },
  propertyType: {
    fontSize: Sizes.fontMD,
    color: Colors.textSecondary,
    marginBottom: Sizes.sm,
  },
  propertyPrice: {
    fontSize: Sizes.fontXL,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  section: {
    marginBottom: Sizes.xl,
  },
  sectionTitle: {
    fontSize: Sizes.fontLG,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Sizes.md,
  },
  description: {
    fontSize: Sizes.fontMD,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  amenityItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Sizes.borderRadius,
    padding: Sizes.sm,
    marginBottom: Sizes.sm,
  },
  amenityUnavailable: {
    opacity: 0.5,
  },
  amenityIcon: {
    fontSize: 20,
    marginRight: Sizes.sm,
  },
  amenityText: {
    flex: 1,
    fontSize: Sizes.fontSM,
    color: Colors.textPrimary,
  },
  amenityTextUnavailable: {
    color: Colors.textSecondary,
  },
  checkIcon: {
    fontSize: 16,
    color: Colors.success,
    fontWeight: 'bold',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Sizes.borderRadius,
    padding: Sizes.md,
    marginBottom: Sizes.md,
  },
  locationIcon: {
    fontSize: 24,
    marginRight: Sizes.sm,
  },
  locationInfo: {
    flex: 1,
  },
  locationText: {
    fontSize: Sizes.fontMD,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  locationSubtext: {
    fontSize: Sizes.fontSM,
    color: Colors.textSecondary,
  },
  mapIcon: {
    fontSize: 20,
  },
  nearbyPlaces: {
    gap: Sizes.sm,
  },
  nearbyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Sizes.sm,
  },
  nearbyIcon: {
    fontSize: 20,
    width: 30,
    textAlign: 'center',
  },
  nearbyName: {
    flex: 1,
    fontSize: Sizes.fontMD,
    color: Colors.textPrimary,
    marginLeft: Sizes.sm,
  },
  nearbyDistance: {
    fontSize: Sizes.fontSM,
    color: Colors.textSecondary,
  },
  ownerCard: {
    backgroundColor: Colors.background,
    borderRadius: Sizes.borderRadius,
    padding: Sizes.md,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Sizes.md,
  },
  ownerIcon: {
    fontSize: 40,
    marginRight: Sizes.sm,
  },
  ownerDetails: {
    flex: 1,
  },
  ownerName: {
    fontSize: Sizes.fontMD,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  ownerContact: {
    fontSize: Sizes.fontSM,
    color: Colors.success,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: Sizes.sm,
  },
  contactButton: {
    flex: 1,
    borderRadius: Sizes.borderRadius,
    paddingVertical: Sizes.sm,
    alignItems: 'center',
  },
  phoneButton: {
    backgroundColor: Colors.info,
  },
  whatsappButton: {
    backgroundColor: Colors.success,
  },
  contactButtonText: {
    color: Colors.white,
    fontSize: Sizes.fontSM,
    fontWeight: '600',
  },
  bottomActionBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.md,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    gap: Sizes.sm,
  },
  visitButton: {
    flex: 2,
    backgroundColor: Colors.primary,
    borderRadius: Sizes.borderRadius,
    paddingVertical: Sizes.md,
    alignItems: 'center',
  },
  visitButtonText: {
    color: Colors.white,
    fontSize: Sizes.fontMD,
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: Sizes.xl,
  },
});