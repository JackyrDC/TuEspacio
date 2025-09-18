import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sizes } from '../constants/Colors';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { useAuth } from '../context/AuthContext';

interface CompleteProfileScreenProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function CompleteProfileScreen({ onComplete, onSkip }: CompleteProfileScreenProps) {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    bio: '',
  });

  const maxBioLength = 40;
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.phone && !/^\d{8,}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Ingresa un número de teléfono válido (mínimo 8 dígitos)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleComplete = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Filtrar campos vacíos
      const updateData = Object.fromEntries(
        Object.entries(formData).filter(([_, value]) => value.trim() !== '')
      );

      if (Object.keys(updateData).length > 0) {
        await updateProfile(updateData);
      }
      
      Alert.alert(
        '¡Perfil completado!',
        'Tu información se ha guardado correctamente.',
        [{ text: 'Continuar', onPress: onComplete }]
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'No se pudo guardar la información'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Omitir paso',
      'Puedes completar esta información más tarde en tu perfil. ¿Deseas continuar?',
      [
        { text: 'Volver', style: 'cancel' },
        { text: 'Omitir', onPress: onSkip },
      ]
    );
  };

  const updateFormData = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const getRoleIcon = (type: string) => {
    switch (type) {
      case 'Inquilino':
        return '🏠';
      case 'Propietario':
        return '🏡';
      case 'Administrador':
        return '👨‍💼';
      default:
        return '👤';
    }
  };

  const getRoleLabel = (type: string) => {
    switch (type) {
      case 'Inquilino':
        return 'Inquilino';
      case 'Propietario':
        return 'Propietario';
      case 'Administrador':
        return 'Administrador';
      default:
        return 'Usuario';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>¡Cuenta creada!</Text>
          <Text style={styles.headerSubtitle}>
            Completa tu perfil para una mejor experiencia
          </Text>
        </View>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Omitir</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            </View>
            <View style={styles.roleTag}>
              <Text style={styles.roleEmoji}>{getRoleIcon(user?.type || '')}</Text>
              <Text style={styles.roleText}>{getRoleLabel(user?.type || '')}</Text>
            </View>
          </View>
          
          <View style={styles.userInfo}>
            <Text style={styles.userName}>¡Hola, {user?.name || 'Usuario'}!</Text>
            <Text style={styles.welcomeText}>
              {user?.type === 'Inquilino' 
                ? 'Ayúdanos a conocerte mejor para una experiencia personalizada'
                : 'Configura tu perfil para conectar mejor con inquilinos'
              }
            </Text>
          </View>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Información adicional</Text>
          
          <CustomInput
            label="Número de teléfono (opcional)"
            placeholder="Ej: 9999-9999"
            value={formData.phone}
            onChangeText={(value) => updateFormData('phone', value)}
            error={errors.phone}
            keyboardType="phone-pad"
          />

          <View style={styles.bioContainer}>
            <CustomInput
              label="Descripción personal (opcional)"
              placeholder="Cuéntanos sobre ti, tus intereses..."
              value={formData.bio}
              onChangeText={(value) => {
                if (value.length <= maxBioLength) {
                  updateFormData('bio', value);
                }
              }}
              multiline
              numberOfLines={3}
              style={styles.bioInput}
            />
            <Text style={[
              styles.characterCount,
              formData.bio.length >= maxBioLength * 0.9 && styles.characterCountWarning
            ]}>
              {formData.bio.length}/{maxBioLength}
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <CustomButton
              title="Completar perfil"
              onPress={handleComplete}
              loading={loading}
              style={styles.completeButton}
            />
            
            <CustomButton
              title="Continuar sin completar"
              onPress={handleSkip}
              variant="outline"
              style={styles.skipButtonSecondary}
            />
          </View>
        </View>

        {/* Benefits Section */}
        <View style={styles.benefitsSection}>
          <Text style={styles.sectionTitle}>¿Por qué completar tu perfil?</Text>
          
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <Text style={styles.benefitText}>
              {user?.type === 'Inquilino' 
                ? 'Recibe recomendaciones personalizadas'
                : 'Mayor confianza de los inquilinos'
              }
            </Text>
          </View>
          
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <Text style={styles.benefitText}>
              Contacto más fácil y rápido
            </Text>
          </View>
          
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <Text style={styles.benefitText}>
              {user?.type === 'Inquilino' 
                ? 'Experiencia más personalizada'
                : 'Mejor presentación de tu perfil'
              }
            </Text>
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
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: Sizes.fontLG,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: Sizes.xs,
  },
  headerSubtitle: {
    fontSize: Sizes.fontSM,
    color: Colors.white + 'CC',
  },
  skipButton: {
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
  },
  skipButtonText: {
    fontSize: Sizes.fontMD,
    color: Colors.white,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  welcomeCard: {
    backgroundColor: Colors.white,
    margin: Sizes.lg,
    borderRadius: Sizes.borderRadiusLG,
    padding: Sizes.xl,
    alignItems: 'center',
    elevation: 3,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Sizes.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: Sizes.fontXL,
    fontWeight: 'bold',
    color: Colors.white,
  },
  roleTag: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: Colors.accent,
    borderRadius: Sizes.borderRadius,
    paddingHorizontal: Sizes.sm,
    paddingVertical: Sizes.xs,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  roleEmoji: {
    fontSize: 12,
    marginRight: 2,
  },
  roleText: {
    fontSize: Sizes.fontXS,
    fontWeight: '600',
    color: Colors.white,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: Sizes.fontLG,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Sizes.sm,
  },
  welcomeText: {
    fontSize: Sizes.fontSM,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  formSection: {
    backgroundColor: Colors.white,
    margin: Sizes.lg,
    marginTop: 0,
    borderRadius: Sizes.borderRadiusLG,
    padding: Sizes.lg,
    elevation: 3,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: Sizes.fontMD,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Sizes.lg,
  },
  bioInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  bioContainer: {
    marginBottom: Sizes.lg,
  },
  characterCount: {
    fontSize: Sizes.fontXS,
    color: Colors.textSecondary,
    textAlign: 'right',
    marginTop: Sizes.xs,
  },
  characterCountWarning: {
    color: Colors.accent,
    fontWeight: '600',
  },
  buttonContainer: {
    marginTop: Sizes.lg,
  },
  completeButton: {
    marginBottom: Sizes.md,
  },
  skipButtonSecondary: {
    marginBottom: 0,
  },
  benefitsSection: {
    backgroundColor: Colors.white,
    margin: Sizes.lg,
    marginTop: 0,
    marginBottom: Sizes.xl,
    borderRadius: Sizes.borderRadiusLG,
    padding: Sizes.lg,
    elevation: 3,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Sizes.md,
  },
  benefitText: {
    fontSize: Sizes.fontSM,
    color: Colors.textPrimary,
    marginLeft: Sizes.sm,
    flex: 1,
  },
});