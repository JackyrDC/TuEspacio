import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors, Sizes } from '../constants/Colors';

type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'interview';
type ApplicationFilter = 'all' | 'pending' | 'approved' | 'rejected' | 'interview';

interface Application {
  id: string;
  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  propertyId: string;
  propertyTitle: string;
  status: ApplicationStatus;
  message: string;
  appliedAt: string;
}

export default function ApplicationsManagementScreen() {
  const navigation = useNavigation();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filter, setFilter] = useState<ApplicationFilter>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      
      // Datos mock para el MVP
      const mockApplications: Application[] = [
        {
          id: 'app1',
          tenantId: 'tenant1',
          tenantName: 'María García',
          tenantEmail: 'maria.garcia@email.com',
          propertyId: 'prop1',
          propertyTitle: 'Apartamento cerca UNAH',
          status: 'pending',
          message: 'Hola, soy estudiante de medicina en la UNAH. Me interesa mucho el apartamento.',
          appliedAt: '2024-01-20T14:30:00Z',
        },
        {
          id: 'app2',
          tenantId: 'tenant2',
          tenantName: 'Carlos Rodríguez',
          tenantEmail: 'carlos.rodriguez@email.com',
          propertyId: 'prop1',
          propertyTitle: 'Apartamento cerca UNAH',
          status: 'interview',
          message: 'Trabajo como profesional en el centro. Busco un lugar tranquilo.',
          appliedAt: '2024-01-19T10:15:00Z',
        },
        {
          id: 'app3',
          tenantId: 'tenant3',
          tenantName: 'Ana Morales',
          tenantEmail: 'ana.morales@email.com',
          propertyId: 'prop2',
          propertyTitle: 'Habitación amueblada',
          status: 'approved',
          message: 'Soy profesional trabajando en el centro de Tegucigalpa.',
          appliedAt: '2024-01-15T09:20:00Z',
        },
      ];
      
      setApplications(mockApplications);
    } catch (error) {
      console.error('Error loading applications:', error);
      Alert.alert('Error', 'No se pudieron cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: ApplicationStatus) => {
    try {
      // Simular actualización en servidor
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: newStatus }
            : app
        )
      );
      
      const statusMessages: Record<ApplicationStatus, string> = {
        approved: 'Solicitud aprobada',
        rejected: 'Solicitud rechazada',
        interview: 'Entrevista programada',
        pending: 'Estado actualizado'
      };
      
      Alert.alert('Estado actualizado', statusMessages[newStatus]);
    } catch (error) {
      console.error('Error updating application status:', error);
      Alert.alert('Error', 'No se pudo actualizar el estado');
    }
  };

  const filteredApplications = applications.filter(app => 
    filter === 'all' || app.status === filter
  );

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'approved': return '#4CAF50';
      case 'rejected': return '#F44336';
      case 'interview': return '#2196F3';
      default: return '#757575';
    }
  };

  const getStatusText = (status: ApplicationStatus) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'approved': return 'Aprobada';
      case 'rejected': return 'Rechazada';
      case 'interview': return 'Entrevista';
      default: return status;
    }
  };

  const filters: { key: ApplicationFilter; label: string; count: number }[] = [
    { key: 'all', label: 'Todas', count: applications.length },
    { key: 'pending', label: 'Pendientes', count: applications.filter(a => a.status === 'pending').length },
    { key: 'interview', label: 'Entrevistas', count: applications.filter(a => a.status === 'interview').length },
    { key: 'approved', label: 'Aprobadas', count: applications.filter(a => a.status === 'approved').length },
    { key: 'rejected', label: 'Rechazadas', count: applications.filter(a => a.status === 'rejected').length },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando solicitudes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Gestión de Solicitudes</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Filtros */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
        >
          {filters.map((filterItem) => (
            <TouchableOpacity
              key={filterItem.key}
              style={[
                styles.filterButton,
                filter === filterItem.key && styles.filterButtonActive
              ]}
              onPress={() => setFilter(filterItem.key)}
            >
              <Text style={[
                styles.filterText,
                filter === filterItem.key && styles.filterTextActive
              ]}>
                {filterItem.label} ({filterItem.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Lista de solicitudes */}
        {filteredApplications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No hay solicitudes</Text>
            <Text style={styles.emptyText}>
              {filter === 'all' 
                ? 'Aún no has recibido solicitudes para tus propiedades'
                : `No hay solicitudes ${getStatusText(filter as ApplicationStatus).toLowerCase()}`
              }
            </Text>
          </View>
        ) : (
          filteredApplications.map((application) => (
            <View key={application.id} style={styles.applicationCard}>
              <View style={styles.applicationHeader}>
                <View style={styles.applicationInfo}>
                  <Text style={styles.tenantName}>{application.tenantName}</Text>
                  <Text style={styles.propertyTitle}>{application.propertyTitle}</Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(application.status) }
                ]}>
                  <Text style={styles.statusText}>
                    {getStatusText(application.status)}
                  </Text>
                </View>
              </View>

              <Text style={styles.applicationMessage}>{application.message}</Text>
              
              <View style={styles.applicationFooter}>
                <Text style={styles.applicationDate}>
                  {new Date(application.appliedAt).toLocaleDateString('es-ES')}
                </Text>
                
                {application.status === 'pending' && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={() => updateApplicationStatus(application.id, 'rejected')}
                    >
                      <Text style={styles.rejectButtonText}>Rechazar</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.actionButton, styles.interviewButton]}
                      onPress={() => updateApplicationStatus(application.id, 'interview')}
                    >
                      <Text style={styles.interviewButtonText}>Entrevistar</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.actionButton, styles.approveButton]}
                      onPress={() => updateApplicationStatus(application.id, 'approved')}
                    >
                      <Text style={styles.approveButtonText}>Aprobar</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  filtersContainer: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: 'white',
  },
  applicationCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  applicationInfo: {
    flex: 1,
    marginRight: 12,
  },
  tenantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  propertyTitle: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  applicationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  applicationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  applicationDate: {
    fontSize: 12,
    color: '#999',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  rejectButton: {
    borderColor: '#F44336',
    backgroundColor: 'white',
  },
  rejectButtonText: {
    fontSize: 12,
    color: '#F44336',
    fontWeight: '500',
  },
  interviewButton: {
    borderColor: '#2196F3',
    backgroundColor: 'white',
  },
  interviewButtonText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500',
  },
  approveButton: {
    borderColor: '#4CAF50',
    backgroundColor: '#4CAF50',
  },
  approveButtonText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});