import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Colors, Sizes } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import CustomButton from '../components/CustomButton';
import { RootStackParamList } from '../types/navigation';

export default function OwnerDashboardScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalProperties: 0,
    availableProperties: 0,
    pendingApplications: 0,
    activeContracts: 0,
    monthlyRevenue: 0,
  });

  useEffect(() => {
    loadOwnerData();
  }, []);

  const loadOwnerData = async () => {
    setStats({
      totalProperties: 3,
      availableProperties: 1,
      pendingApplications: 5,
      activeContracts: 2,
      monthlyRevenue: 25000,
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOwnerData();
    setRefreshing(false);
  };

  const handleAddProperty = () => {
    navigation.navigate('AddProperty' as never);
  };

  const handleViewApplications = () => {
    navigation.navigate('ApplicationsManagement' as never);
  };

  const handleManageProperties = () => {
    navigation.navigate('PropertyManagement' as never);
  };

  const handleViewContracts = () => {
    // TODO: Navegar a contratos
    Alert.alert('Próximamente', 'Vista de contratos en desarrollo');
  };

  const handleProfile = () => {
    navigation.navigate('Profile');
  };

  const StatCard = ({ title, value, subtitle, color = Colors.primary, onPress }: {
    title: string;
    value: string | number;
    subtitle?: string;
    color?: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity 
      style={[styles.statCard, { borderLeftColor: color }]} 
      onPress={onPress}
      disabled={!onPress}
    >
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </TouchableOpacity>
  );

  const ActionCard = ({ icon, title, subtitle, onPress, color = Colors.primary }: {
    icon: string;
    title: string;
    subtitle: string;
    onPress: () => void;
    color?: string;
  }) => (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
      <View style={[styles.actionIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <View style={styles.actionContent}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>¡Hola!</Text>
          <Text style={styles.username}>{user?.name || 'Propietario'}</Text>
          <Text style={styles.roleTag}>🏡 Dashboard Propietario</Text>
        </View>
        <TouchableOpacity style={styles.profileButton} onPress={handleProfile}>
          <Ionicons name="person-circle-outline" size={32} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen</Text>
          <View style={styles.statsGrid}>
            <StatCard 
              title="Propiedades" 
              value={stats.totalProperties}
              subtitle={`${stats.availableProperties} disponibles`}
              color={Colors.primary}
              onPress={handleManageProperties}
            />
            <StatCard 
              title="Solicitudes" 
              value={stats.pendingApplications}
              subtitle="Pendientes"
              color={Colors.accent}
              onPress={handleViewApplications}
            />
            <StatCard 
              title="Contratos" 
              value={stats.activeContracts}
              subtitle="Activos"
              color={Colors.success}
              onPress={handleViewContracts}
            />
            <StatCard 
              title="Ingresos" 
              value={`L.${(stats.monthlyRevenue || 0).toLocaleString()}`}
              subtitle="Este mes"
              color="#FF6B6B"
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          
          <ActionCard
            icon="add-circle-outline"
            title="Agregar Propiedad"
            subtitle="Publica una nueva propiedad"
            onPress={handleAddProperty}
            color={Colors.primary}
          />
          
          <ActionCard
            icon="document-text-outline"
            title="Ver Solicitudes"
            subtitle={`${stats.pendingApplications} solicitudes pendientes`}
            onPress={handleViewApplications}
            color={Colors.accent}
          />
          
          <ActionCard
            icon="home-outline"
            title="Gestionar Propiedades"
            subtitle="Editar, actualizar y administrar"
            onPress={handleManageProperties}
            color={Colors.success}
          />
          
          <ActionCard
            icon="contract-outline"
            title="Contratos e Historial"
            subtitle="Ver contratos y historial de inquilinos"
            onPress={handleViewContracts}
            color="#9C27B0"
          />
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actividad Reciente</Text>
          <View style={styles.activityCard}>
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: Colors.accent + '20' }]}>
                <Ionicons name="mail-outline" size={16} color={Colors.accent} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Nueva solicitud recibida</Text>
                <Text style={styles.activityTime}>Hace 2 horas</Text>
              </View>
            </View>
            
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: Colors.success + '20' }]}>
                <Ionicons name="checkmark-circle-outline" size={16} color={Colors.success} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Contrato firmado</Text>
                <Text style={styles.activityTime}>Hace 1 día</Text>
              </View>
            </View>
            
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: Colors.primary + '20' }]}>
                <Ionicons name="eye-outline" size={16} color={Colors.primary} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Propiedad vista 15 veces</Text>
                <Text style={styles.activityTime}>Hace 2 días</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Add Property CTA */}
        <View style={styles.section}>
          <View style={styles.ctaCard}>
            <Text style={styles.ctaTitle}>¿Tienes más propiedades?</Text>
            <Text style={styles.ctaSubtitle}>
              Agrega más propiedades para aumentar tus ingresos
            </Text>
            <CustomButton
              title="Agregar Propiedad"
              onPress={handleAddProperty}
              style={styles.ctaButton}
            />
          </View>
        </View>
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
    paddingVertical: Sizes.lg,
    elevation: 4,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: Sizes.fontMD,
    color: Colors.white + 'CC',
  },
  username: {
    fontSize: Sizes.fontLG,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: Sizes.xs,
  },
  roleTag: {
    fontSize: Sizes.fontSM,
    color: Colors.white + 'DD',
  },
  profileButton: {
    padding: Sizes.xs,
  },
  content: {
    flex: 1,
  },
  section: {
    margin: Sizes.lg,
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: Sizes.fontMD,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Sizes.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: Colors.white,
    borderRadius: Sizes.borderRadius,
    padding: Sizes.lg,
    width: '48%',
    marginBottom: Sizes.md,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statValue: {
    fontSize: Sizes.fontXL,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Sizes.xs,
  },
  statTitle: {
    fontSize: Sizes.fontSM,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  statSubtitle: {
    fontSize: Sizes.fontXS,
    color: Colors.textSecondary,
    marginTop: Sizes.xs,
  },
  actionCard: {
    backgroundColor: Colors.white,
    borderRadius: Sizes.borderRadius,
    padding: Sizes.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Sizes.md,
    elevation: 2,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Sizes.md,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: Sizes.fontMD,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Sizes.xs,
  },
  actionSubtitle: {
    fontSize: Sizes.fontSM,
    color: Colors.textSecondary,
  },
  activityCard: {
    backgroundColor: Colors.white,
    borderRadius: Sizes.borderRadius,
    padding: Sizes.lg,
    elevation: 2,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Sizes.md,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Sizes.md,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: Sizes.fontSM,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  activityTime: {
    fontSize: Sizes.fontXS,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  ctaCard: {
    backgroundColor: Colors.primary,
    borderRadius: Sizes.borderRadius,
    padding: Sizes.xl,
    alignItems: 'center',
    marginBottom: Sizes.xl,
  },
  ctaTitle: {
    fontSize: Sizes.fontLG,
    fontWeight: 'bold',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Sizes.sm,
  },
  ctaSubtitle: {
    fontSize: Sizes.fontSM,
    color: Colors.white + 'DD',
    textAlign: 'center',
    marginBottom: Sizes.lg,
  },
  ctaButton: {
    backgroundColor: Colors.white,
    minWidth: 200,
  },
});