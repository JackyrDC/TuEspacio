import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { getContractsByStatus } from '../services/contracts';
import { Contract } from '../types/types';

const ContractsScreen: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'activo' | 'inactivo' | 'finalizado'>('all');

  useEffect(() => {
    loadContracts();
  }, [selectedFilter]);

  const loadContracts = async () => {
    try {
      setLoading(true);
      // Por ahora cargaremos todos los contratos
      // Cuando implementes el filtro, úsalo aquí
      const result = await getContractsByStatus('activo' as any);
      setContracts(result || []);
    } catch (error) {
      console.error('Error cargando contratos:', error);
      Alert.alert('Error', 'No se pudieron cargar los contratos');
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  const renderContractItem = ({ item }: { item: Contract }) => (
    <TouchableOpacity style={styles.contractCard}>
      <View style={styles.contractHeader}>
        <Text style={styles.contractTitle}>
          {item.property?.title || 'Propiedad sin título'}
        </Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(item.status?.status) }
        ]}>
          <Text style={styles.statusText}>
            {item.status?.status || 'Sin estado'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.tenantInfo}>
        Inquilino: {item.tenant?.name || 'No asignado'}
      </Text>
      
      <View style={styles.datesContainer}>
        <Text style={styles.dateText}>
          Inicio: {new Date(item.startDate).toLocaleDateString()}
        </Text>
        <Text style={styles.dateText}>
          Fin: {new Date(item.endDate).toLocaleDateString()}
        </Text>
      </View>
      
      <TouchableOpacity style={styles.viewButton}>
        <Text style={styles.viewButtonText}>Ver Detalles</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'activo': return '#4CAF50';
      case 'inactivo': return '#FF9800';
      case 'finalizado': return '#f44336';
      default: return '#757575';
    }
  };

  const renderFilterButtons = () => (
    <View style={styles.filterContainer}>
      {['all', 'activo', 'inactivo', 'finalizado'].map((filter) => (
        <TouchableOpacity
          key={filter}
          style={[
            styles.filterButton,
            selectedFilter === filter && styles.filterButtonActive
          ]}
          onPress={() => setSelectedFilter(filter as any)}
        >
          <Text style={[
            styles.filterButtonText,
            selectedFilter === filter && styles.filterButtonTextActive
          ]}>
            {filter === 'all' ? 'Todos' : filter.charAt(0).toUpperCase() + filter.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyTitle}>No hay contratos</Text>
      <Text style={styles.emptySubtitle}>
        Los contratos aparecerán aquí cuando sean creados
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Cargando contratos...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Contratos</Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {renderFilterButtons()}

      <FlatList
        data={contracts}
        renderItem={renderContractItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#2196F3',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: '#2196F3',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  listContainer: {
    padding: 20,
    flexGrow: 1,
  },
  contractCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contractHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  contractTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  tenantInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  datesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  dateText: {
    fontSize: 14,
    color: '#888',
  },
  viewButton: {
    backgroundColor: '#f0f9ff',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
});

export default ContractsScreen;
