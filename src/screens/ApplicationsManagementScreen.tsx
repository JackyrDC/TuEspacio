import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors, Sizes } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { userDocumentsService } from '../../services/userDocuments.service';

interface Application {
  id: string;
  tenantId: string;
  tenantName: string;
  tenantPhone: string;
  tenantEmail: string;
  propertyId: string;
  propertyTitle: string;
  status: 'pending' | 'approved' | 'rejected' | 'interviewed';
  message: string;
  appliedAt: string;
  interviewDate?: string;
}

interface DocumentStatus {
  DNI: boolean;
  studentCarnet: boolean;
  proofOfIncome: boolean;
  isComplete: boolean;
}

export default function ApplicationsManagementScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [documentsStatus, setDocumentsStatus] = useState<{[key: string]: DocumentStatus}>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'interviewed'>('all');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      // TODO: Integrar con servicio de aplicaciones
      // Datos de ejemplo
      const mockApplications: Application[] = [
        {
          id: '1',
          tenantId: 'tenant1',
          tenantName: 'María González',
          tenantPhone: '+504 9876-5432',
          tenantEmail: 'maria.gonzalez@email.com',
          propertyId: 'prop1',
          propertyTitle: 'Apartamento cerca de UNAH',
          status: 'pending',
          message: 'Hola! Soy estudiante de medicina en la UNAH y estoy buscando un lugar cómodo y cerca de la universidad. Tengo referencias de trabajos anteriores y puedo pagar puntualmente.',
          appliedAt: '2024-01-20T10:30:00Z',
        },
        {
          id: '2',
          tenantId: 'tenant2',
          tenantName: 'Carlos Ruiz',
          tenantPhone: '+504 8765-4321',
          tenantEmail: 'carlos.ruiz@email.com',
          propertyId: 'prop1',
          propertyTitle: 'Apartamento cerca de UNAH',
          status: 'interviewed',
          message: 'Trabajo en una empresa de tecnología y busco un lugar tranquilo. Tengo estabilidad laboral y excelentes referencias.',
          appliedAt: '2024-01-18T14:15:00Z',
          interviewDate: '2024-01-22T16:00:00Z',
        },
        {
          id: '3',
          tenantId: 'tenant3',
          tenantName: 'Ana Morales',
          tenantPhone: '+504 7654-3210',
          tenantEmail: 'ana.morales@email.com',
          propertyId: 'prop2',
          propertyTitle: 'Habitación amueblada',
          status: 'approved',
          message: 'Soy profesional trabajando en el centro de Tegucigalpa. Busco algo cerca de mi trabajo.',
          appliedAt: '2024-01-15T09:20:00Z',
        },
      ];
      
      setApplications(mockApplications);
      
      // Cargar estado de documentos para cada inquilino
      const statusMap: {[key: string]: DocumentStatus} = {};
      for (const application of mockApplications) {
        try {
          const userDocuments = await userDocumentsService.getUserDocuments(application.tenantId);
          statusMap[application.tenantId] = userDocumentsService.getDocumentStatus(userDocuments);
        } catch (error) {
          // Si no se pueden cargar los documentos, usar estado por defecto
          statusMap[application.tenantId] = {
            DNI: false,
            studentCarnet: false,
            proofOfIncome: false,
            isComplete: false,
          };
        }
      }
      setDocumentsStatus(statusMap);
      
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadApplications();
    setRefreshing(false);
  };

  const handleApproveApplication = (applicationId: string) => {
    setApplications(prev =>
      prev.map(app => 
        app.id === applicationId 
          ? { ...app, status: 'approved' }
          : app
      )
    );
  };

  const handleRejectApplication = (applicationId: string) => {
    setApplications(prev =>
      prev.map(app => 
        app.id === applicationId 
          ? { ...app, status: 'rejected' }
          : app
      )
    );
  };

  const handleScheduleInterview = (application: Application) => {
    setApplications(prev =>
      prev.map(app => 
        app.id === application.id 
          ? { ...app, status: 'interviewed', interviewDate: new Date().toISOString() }
          : app
      )
    );
  };

  const handleViewDocuments = async (application: Application) => {
    try {
      const userDocuments = await userDocumentsService.getUserDocuments(application.tenantId);
      const status = userDocumentsService.getDocumentStatus(userDocuments);
      
      // Actualizar el estado local
      setDocumentsStatus(prev => ({
        ...prev,
        [application.tenantId]: status
      }));
      
      // TODO: Navegar a pantalla de documentos o mostrar modal
      console.log('Documentos de', application.tenantName, status);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const handleContactTenant = (application: Application) => {
    // Abrir WhatsApp directamente
    const whatsappUrl = `whatsapp://send?phone=${application.tenantPhone.replace(/\s+/g, '')}&text=Hola ${application.tenantName}, te contacto sobre tu solicitud para la propiedad "${application.propertyTitle}".`;
    Linking.openURL(whatsappUrl).catch(() => {
      // Si WhatsApp no está disponible, abrir enlace web
      const webWhatsappUrl = `https://wa.me/${application.tenantPhone.replace(/\s+/g, '')}?text=Hola ${application.tenantName}, te contacto sobre tu solicitud para la propiedad "${application.propertyTitle}".`;
      Linking.openURL(webWhatsappUrl);
    });
  };

  const handleCallTenant = (application: Application) => {
    const phoneUrl = `tel:${application.tenantPhone}`;
    Linking.openURL(phoneUrl);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return Colors.warning;
      case 'approved': return Colors.success;
      case 'rejected': return Colors.error;
      case 'interviewed': return Colors.primary;
      default: return Colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'approved': return 'Aprobada';
      case 'rejected': return 'Rechazada';
      case 'interviewed': return 'Entrevistada';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return 'time-outline';
      case 'approved': return 'checkmark-circle-outline';
      case 'rejected': return 'close-circle-outline';
      case 'interviewed': return 'people-outline';
      default: return 'ellipse-outline';
    }
  };

  const filteredApplications = applications.filter(app => 
    filter === 'all' || app.status === filter
  );

  const renderFilterTabs = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.filterContainer}
      contentContainerStyle={styles.filterContent}
    >
      {[
        { key: 'all', label: 'Todas', count: applications.length },
        { key: 'pending', label: 'Pendientes', count: applications.filter(a => a.status === 'pending').length },
        { key: 'interviewed', label: 'Entrevistadas', count: applications.filter(a => a.status === 'interviewed').length },
        { key: 'approved', label: 'Aprobadas', count: applications.filter(a => a.status === 'approved').length },
        { key: 'rejected', label: 'Rechazadas', count: applications.filter(a => a.status === 'rejected').length },
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

  const renderApplicationCard = (application: Application) => (
    <View key={application.id} style={styles.applicationCard}>
      {/* Header */}
      <View style={styles.applicationHeader}>
        <View style={styles.tenantInfo}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {application.tenantName.split(' ').map(n => n[0]).join('').toUpperCase()}
            </Text>
          </View>
          <View style={styles.tenantDetails}>
            <Text style={styles.tenantName}>{application.tenantName}</Text>
            <Text style={styles.propertyTitle} numberOfLines={1}>
              Para: {application.propertyTitle}
            </Text>
            <Text style={styles.applicationDate}>
              Solicitó: {new Date(application.appliedAt).toLocaleDateString('es-HN', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(application.status) + '20' }]}>
          <Ionicons 
            name={getStatusIcon(application.status) as any} 
            size={16} 
            color={getStatusColor(application.status)} 
          />
          <Text style={[styles.statusText, { color: getStatusColor(application.status) }]}>
            {getStatusText(application.status)}
          </Text>
        </View>
      </View>

      {/* Message */}
      <View style={styles.messageContainer}>
        <Text style={styles.messageLabel}>Mensaje:</Text>
        <Text style={styles.messageText} numberOfLines={3}>
          {application.message}
        </Text>
      </View>

      {/* Documents Status */}
      <View style={styles.documentsContainer}>
        <Text style={styles.documentsLabel}>Documentos:</Text>
        <View style={styles.documentsStatus}>
          {(() => {
            const status = documentsStatus[application.tenantId] || {
              DNI: false,
              studentCarnet: false,
              proofOfIncome: false,
              isComplete: false,
            };
            
            return (
              <>
                <View style={styles.documentItem}>
                  <Ionicons 
                    name={status.DNI ? "checkmark-circle" : "time-outline"} 
                    size={16} 
                    color={status.DNI ? Colors.success : Colors.warning} 
                  />
                  <Text style={styles.documentText}>Cédula/DNI</Text>
                </View>
                <View style={styles.documentItem}>
                  <Ionicons 
                    name={status.studentCarnet ? "checkmark-circle" : "time-outline"} 
                    size={16} 
                    color={status.studentCarnet ? Colors.success : Colors.warning} 
                  />
                  <Text style={styles.documentText}>Carnet Estudiantil</Text>
                </View>
                <View style={styles.documentItem}>
                  <Ionicons 
                    name={status.proofOfIncome ? "checkmark-circle" : "time-outline"} 
                    size={16} 
                    color={status.proofOfIncome ? Colors.success : Colors.warning} 
                  />
                  <Text style={styles.documentText}>Comprobante Ingresos</Text>
                </View>
              </>
            );
          })()}
        </View>
      </View>

      {/* Interview Date */}
      {application.interviewDate && (
        <View style={styles.interviewContainer}>
          <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
          <Text style={styles.interviewText}>
            Entrevista: {new Date(application.interviewDate).toLocaleDateString('es-HN', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.contactButton]}
          onPress={() => handleContactTenant(application)}
        >
          <Ionicons name="logo-whatsapp" size={18} color={Colors.success} />
          <Text style={styles.contactButtonText}>WhatsApp</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.callButton]}
          onPress={() => handleCallTenant(application)}
        >
          <Ionicons name="call-outline" size={18} color={Colors.primary} />
          <Text style={styles.callButtonText}>Llamar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.documentsButton]}
          onPress={() => handleViewDocuments(application)}
        >
          <Ionicons name="document-text-outline" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>

        {application.status === 'pending' && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.interviewButton]}
              onPress={() => handleScheduleInterview(application)}
            >
              <Ionicons name="people-outline" size={18} color={Colors.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => handleApproveApplication(application.id)}
            >
              <Ionicons name="checkmark" size={18} color={Colors.success} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleRejectApplication(application.id)}
            >
              <Ionicons name="close" size={18} color={Colors.error} />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={64} color={Colors.textSecondary} />
      <Text style={styles.emptyTitle}>No hay solicitudes</Text>
      <Text style={styles.emptySubtitle}>
        Cuando los inquilinos soliciten tus propiedades, aparecerán aquí para que las puedas revisar.
      </Text>
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
        <Text style={styles.headerTitle}>Solicitudes</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Filter Tabs */}
      {applications.length > 0 && renderFilterTabs()}

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
            <Text style={styles.loadingText}>Cargando solicitudes...</Text>
          </View>
        ) : filteredApplications.length === 0 ? (
          filter === 'all' ? renderEmptyState() : (
            <View style={styles.emptyFilterContainer}>
              <Text style={styles.emptyFilterText}>
                No hay solicitudes {getStatusText(filter).toLowerCase()}
              </Text>
            </View>
          )
        ) : (
          <View style={styles.applicationsList}>
            {filteredApplications.map(renderApplicationCard)}
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
    padding: Sizes.xs,
  },
  headerTitle: {
    fontSize: Sizes.fontLG,
    fontWeight: 'bold',
    color: Colors.white,
  },
  headerRight: {
    width: 40,
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
  applicationsList: {
    padding: Sizes.lg,
  },
  applicationCard: {
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
  applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Sizes.md,
  },
  tenantInfo: {
    flexDirection: 'row',
    flex: 1,
    marginRight: Sizes.md,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Sizes.md,
  },
  avatarText: {
    fontSize: Sizes.fontLG,
    fontWeight: 'bold',
    color: Colors.white,
  },
  tenantDetails: {
    flex: 1,
  },
  tenantName: {
    fontSize: Sizes.fontLG,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Sizes.xs,
  },
  propertyTitle: {
    fontSize: Sizes.fontSM,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: Sizes.xs,
  },
  applicationDate: {
    fontSize: Sizes.fontXS,
    color: Colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.xs,
    borderRadius: Sizes.borderRadius,
  },
  statusText: {
    fontSize: Sizes.fontXS,
    fontWeight: '600',
    marginLeft: Sizes.xs,
  },
  messageContainer: {
    marginBottom: Sizes.md,
  },
  messageLabel: {
    fontSize: Sizes.fontSM,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Sizes.xs,
  },
  messageText: {
    fontSize: Sizes.fontSM,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  documentsContainer: {
    marginBottom: Sizes.md,
  },
  documentsLabel: {
    fontSize: Sizes.fontSM,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Sizes.xs,
  },
  documentsStatus: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Sizes.lg,
    marginBottom: Sizes.xs,
  },
  documentText: {
    fontSize: Sizes.fontXS,
    color: Colors.textSecondary,
    marginLeft: Sizes.xs,
  },
  interviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '10',
    padding: Sizes.sm,
    borderRadius: Sizes.borderRadius,
    marginBottom: Sizes.md,
  },
  interviewText: {
    fontSize: Sizes.fontSM,
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: Sizes.xs,
  },
  actionsContainer: {
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
  contactButton: {
    borderColor: Colors.success,
    backgroundColor: Colors.success + '10',
    flex: 1,
    marginRight: Sizes.sm,
    justifyContent: 'center',
  },
  contactButtonText: {
    fontSize: Sizes.fontSM,
    color: Colors.success,
    fontWeight: '600',
    marginLeft: Sizes.xs,
  },
  callButton: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
    flex: 1,
    marginRight: Sizes.sm,
    justifyContent: 'center',
  },
  callButtonText: {
    fontSize: Sizes.fontSM,
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: Sizes.xs,
  },
  documentsButton: {
    borderColor: Colors.textSecondary,
    backgroundColor: Colors.textSecondary + '10',
    padding: Sizes.sm,
    marginRight: Sizes.xs,
  },
  documentsButtonText: {
    fontSize: Sizes.fontSM,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginLeft: Sizes.xs,
  },
  interviewButton: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
    padding: Sizes.sm,
    marginRight: Sizes.xs,
  },
  approveButton: {
    borderColor: Colors.success,
    backgroundColor: Colors.success + '10',
    padding: Sizes.sm,
    marginRight: Sizes.xs,
  },
  rejectButton: {
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
});