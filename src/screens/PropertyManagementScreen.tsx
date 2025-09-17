import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors, Sizes } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';

interface Property {
  id: string;
  title: string;
  type: string;
  price: number;
  address: string;
  status: 'active' | 'pending' | 'inactive';
  views: number;
  applications: number;
  photos: string[];
  createdAt: string;
}

export default function PropertyManagementScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'inactive'>('all');

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      // TODO: Integrar con servicio de propiedades
      // Datos de ejemplo
      const mockProperties: Property[] = [
        {
          id: '1',
          title: 'Apartamento cerca de UNAH',
          type: 'departamento',
          price: 8000,
          address: 'Col. Universidad, Tegucigalpa',
          status: 'active',
          views: 145,
          applications: 8,
          photos: [],
          createdAt: '2024-01-15',
        },
        {
          id: '2',
          title: 'Habitación amueblada',
          type: 'habitación',
          price: 4500,
          address: 'Barrio Los Andes, Tegucigalpa',
          status: 'pending',
          views: 67,
          applications: 3,
          photos: [],
          createdAt: '2024-01-10',
        },
        {
          id: '3',
          title: 'Casa completa para estudiantes',
          type: 'casa',
          price: 15000,
          address: 'Col. Kennedy, Tegucigalpa',
          status: 'inactive',
          views: 289,
          applications: 15,
          photos: [],
          createdAt: '2024-01-05',
        },
      ];
      
      setProperties(mockProperties);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las propiedades');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProperties();
    setRefreshing(false);
  };

  const handleAddProperty = () => {
    navigation.navigate('AddProperty' as never);
  };

  const handleEditProperty = (propertyId: string) => {
    // TODO: Navegar a pantalla de edición
    Alert.alert('Editar', `Editar propiedad ${propertyId}`);
  };

  const handleToggleStatus = (propertyId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    Alert.alert(
      'Cambiar estado',
      `¿Deseas ${newStatus === 'active' ? 'activar' : 'desactivar'} esta propiedad?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            setProperties(prev =>
              prev.map(p => p.id === propertyId ? { ...p, status: newStatus as any } : p)
            );
          },
        },
      ]
    );
  };

  const handleDeleteProperty = (propertyId: string) => {
    Alert.alert(
      'Eliminar propiedad',
      '¿Estás seguro de que deseas eliminar esta propiedad? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setProperties(prev => prev.filter(p => p.id !== propertyId));
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return Colors.success;
      case 'pending': return Colors.warning;
      case 'inactive': return Colors.error;
      default: return Colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activa';
      case 'pending': return 'Pendiente';
      case 'inactive': return 'Inactiva';
      default: return status;
    }
  };

  const filteredProperties = properties.filter(property => 
    filter === 'all' || property.status === filter
  );

  const renderFilterTabs = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.filterContainer}
      contentContainerStyle={styles.filterContent}
    >
      {[
        { key: 'all', label: 'Todas', count: properties.length },
        { key: 'active', label: 'Activas', count: properties.filter(p => p.status === 'active').length },
        { key: 'pending', label: 'Pendientes', count: properties.filter(p => p.status === 'pending').length },
        { key: 'inactive', label: 'Inactivas', count: properties.filter(p => p.status === 'inactive').length },
      ].map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.filterTab,
            filter === tab.key && styles.filterTabActive
          ]}
          onPress={() => setFilter(tab.key as any)}
        >
          <Text style={[
            styles.filterTabText,
            filter === tab.key && styles.filterTabTextActive
          ]}>
            {tab.label} ({tab.count})
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderPropertyCard = (property: Property) => (
    <View key={property.id} style={styles.propertyCard}>
      {/* Header */}
      <View style={styles.propertyHeader}>
        <View style={styles.propertyInfo}>
          <Text style={styles.propertyTitle} numberOfLines={1}>
            {property.title}
          </Text>
          <Text style={styles.propertySubtitle}>
            {property.type.charAt(0).toUpperCase() + property.type.slice(1)} • L. {property.price.toLocaleString()}/mes
          </Text>
          <Text style={styles.propertyAddress} numberOfLines={1}>
            📍 {property.address}
          </Text>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(property.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(property.status) }]}>
            {getStatusText(property.status)}
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.propertyStats}>
        <View style={styles.statItem}>
          <Ionicons name="eye-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.statText}>{property.views} vistas</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="document-text-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.statText}>{property.applications} solicitudes</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.statText}>
            {new Date(property.createdAt).toLocaleDateString('es-HN', { 
              day: 'numeric', 
              month: 'short' 
            })}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.propertyActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditProperty(property.id)}
        >
          <Ionicons name="create-outline" size={18} color={Colors.primary} />
          <Text style={styles.editButtonText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.toggleButton]}
          onPress={() => handleToggleStatus(property.id, property.status)}
        >
          <Ionicons 
            name={property.status === 'active' ? 'pause-outline' : 'play-outline'} 
            size={18} 
            color={property.status === 'active' ? Colors.warning : Colors.success} 
          />
          <Text style={[
            styles.toggleButtonText,
            { color: property.status === 'active' ? Colors.warning : Colors.success }
          ]}>
            {property.status === 'active' ? 'Pausar' : 'Activar'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteProperty(property.id)}
        >
          <Ionicons name="trash-outline" size={18} color={Colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="home-outline" size={64} color={Colors.textSecondary} />
      <Text style={styles.emptyTitle}>No tienes propiedades</Text>
      <Text style={styles.emptySubtitle}>
        Agrega tu primera propiedad para empezar a recibir solicitudes de inquilinos
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={handleAddProperty}>
        <Text style={styles.emptyButtonText}>Agregar Propiedad</Text>
      </TouchableOpacity>
    </View>
  );

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
        <Text style={styles.headerTitle}>Mis Propiedades</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddProperty}>
          <Ionicons name="add" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      {properties.length > 0 && renderFilterTabs()}

      {/* Content */}
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Cargando propiedades...</Text>
          </View>
        ) : filteredProperties.length === 0 ? (
          filter === 'all' ? renderEmptyState() : (
            <View style={styles.emptyFilterContainer}>
              <Text style={styles.emptyFilterText}>
                No hay propiedades {getStatusText(filter).toLowerCase()}
              </Text>
            </View>
          )
        ) : (
          <View style={styles.propertiesList}>
            {filteredProperties.map(renderPropertyCard)}
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      {properties.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={handleAddProperty}>
          <Ionicons name="add" size={24} color={Colors.white} />
        </TouchableOpacity>
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
    padding: Sizes.xs,
  },
  headerTitle: {
    fontSize: Sizes.fontLG,
    fontWeight: 'bold',
    color: Colors.white,
  },
  addButton: {
    padding: Sizes.xs,
  },
  filterContainer: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  filterContent: {
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.md,
  },
  filterTab: {
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.sm,
    marginRight: Sizes.md,
    borderRadius: Sizes.borderRadius * 2,
    backgroundColor: Colors.background,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
  },
  filterTabText: {
    fontSize: Sizes.fontSM,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: Colors.white,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Sizes.xl * 2,
  },
  loadingText: {
    fontSize: Sizes.fontMD,
    color: Colors.textSecondary,
  },
  propertiesList: {
    padding: Sizes.lg,
  },
  propertyCard: {
    backgroundColor: Colors.white,
    borderRadius: Sizes.borderRadius,
    padding: Sizes.lg,
    marginBottom: Sizes.lg,
    elevation: 2,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  propertyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Sizes.md,
  },
  propertyInfo: {
    flex: 1,
    marginRight: Sizes.md,
  },
  propertyTitle: {
    fontSize: Sizes.fontLG,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Sizes.xs,
  },
  propertySubtitle: {
    fontSize: Sizes.fontMD,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: Sizes.xs,
  },
  propertyAddress: {
    fontSize: Sizes.fontSM,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.xs,
    borderRadius: Sizes.borderRadius,
  },
  statusText: {
    fontSize: Sizes.fontXS,
    fontWeight: '600',
  },
  propertyStats: {
    flexDirection: 'row',
    marginBottom: Sizes.lg,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Sizes.lg,
  },
  statText: {
    fontSize: Sizes.fontSM,
    color: Colors.textSecondary,
    marginLeft: Sizes.xs,
  },
  propertyActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    borderRadius: Sizes.borderRadius,
    borderWidth: 1,
  },
  editButton: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
    flex: 1,
    marginRight: Sizes.sm,
    justifyContent: 'center',
  },
  editButtonText: {
    fontSize: Sizes.fontSM,
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: Sizes.xs,
  },
  toggleButton: {
    borderColor: Colors.success,
    backgroundColor: Colors.success + '10',
    flex: 1,
    marginRight: Sizes.sm,
    justifyContent: 'center',
  },
  toggleButtonText: {
    fontSize: Sizes.fontSM,
    fontWeight: '600',
    marginLeft: Sizes.xs,
  },
  deleteButton: {
    borderColor: Colors.error,
    backgroundColor: Colors.error + '10',
    padding: Sizes.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Sizes.xl,
    paddingVertical: Sizes.xl * 2,
  },
  emptyTitle: {
    fontSize: Sizes.fontXL,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: Sizes.lg,
    marginBottom: Sizes.md,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: Sizes.fontMD,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Sizes.xl,
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Sizes.xl,
    paddingVertical: Sizes.md,
    borderRadius: Sizes.borderRadius,
  },
  emptyButtonText: {
    fontSize: Sizes.fontMD,
    color: Colors.white,
    fontWeight: '600',
  },
  emptyFilterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Sizes.xl * 2,
  },
  emptyFilterText: {
    fontSize: Sizes.fontMD,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: Sizes.lg,
    bottom: Sizes.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});