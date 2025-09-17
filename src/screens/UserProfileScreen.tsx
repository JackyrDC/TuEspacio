import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors, Sizes } from '../constants/Colors';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { useAuth } from '../context/AuthContext';
import { getUserAvatar, getUserInitials } from '../utils/userUtils';

export default function UserProfileScreen() {
  const navigation = useNavigation();
  const { user, logout, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
  });

  const maxBioLength = 40;
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ingresa un email válido';
    }

    if (formData.phone && !/^\d{8,}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Ingresa un número de teléfono válido (mínimo 8 dígitos)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await updateProfile(formData);
      setIsEditing(false);
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'No se pudo actualizar el perfil'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
    });
    setErrors({});
    setIsEditing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: logout,
        },
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
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={() => setIsEditing(!isEditing)}
        >
          <Ionicons 
            name={isEditing ? "close" : "create-outline"} 
            size={24} 
            color={Colors.white} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Image
                source={getUserAvatar(user)}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            </View>
            <View style={styles.roleTag}>
              <Text style={styles.roleEmoji}>{getRoleIcon(user?.type || '')}</Text>
              <Text style={styles.roleText}>{getRoleLabel(user?.type || '')}</Text>
            </View>
          </View>
          
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'Usuario'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'email@example.com'}</Text>
          </View>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Información Personal</Text>
          
          <CustomInput
            label="Nombre completo"
            placeholder="Ingresa tu nombre"
            value={formData.name}
            onChangeText={(value) => updateFormData('name', value)}
            error={errors.name}
            editable={isEditing}
            autoCapitalize="words"
          />

          <CustomInput
            label="Email"
            placeholder="ejemplo@correo.com"
            value={formData.email}
            onChangeText={(value) => updateFormData('email', value)}
            error={errors.email}
            editable={isEditing}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <CustomInput
            label="Teléfono (opcional)"
            placeholder="Ej: 9999-9999"
            value={formData.phone}
            onChangeText={(value) => updateFormData('phone', value)}
            error={errors.phone}
            editable={isEditing}
            keyboardType="phone-pad"
          />

          <View style={styles.bioContainer}>
            <CustomInput
              label="Descripción personal (opcional)"
              placeholder="Cuéntanos sobre ti..."
              value={formData.bio}
              onChangeText={(value) => {
                if (value.length <= maxBioLength) {
                  updateFormData('bio', value);
                }
              }}
              editable={isEditing}
              multiline
              numberOfLines={3}
              style={styles.bioInput}
            />
            {isEditing && (
              <Text style={[
                styles.characterCount,
                formData.bio.length >= maxBioLength * 0.9 && styles.characterCountWarning
              ]}>
                {formData.bio.length}/{maxBioLength}
              </Text>
            )}
          </View>

          {isEditing && (
            <View style={styles.buttonContainer}>
              <CustomButton
                title="Guardar Cambios"
                onPress={handleSave}
                loading={loading}
                style={styles.saveButton}
              />
              <CustomButton
                title="Cancelar"
                onPress={handleCancel}
                variant="outline"
                style={styles.cancelButton}
              />
            </View>
          )}
        </View>

        {/* Account Section */}
        <View style={styles.accountSection}>
          <Text style={styles.sectionTitle}>Cuenta</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="heart-outline" size={20} color={Colors.primary} />
              <Text style={styles.menuItemText}>Propiedades Favoritas</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="notifications-outline" size={20} color={Colors.primary} />
              <Text style={styles.menuItemText}>Notificaciones</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="help-circle-outline" size={20} color={Colors.primary} />
              <Text style={styles.menuItemText}>Ayuda y Soporte</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="document-text-outline" size={20} color={Colors.primary} />
              <Text style={styles.menuItemText}>Términos y Condiciones</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Logout Section */}
        <View style={styles.logoutSection}>
          <CustomButton
            title="Cerrar Sesión"
            onPress={handleLogout}
            variant="outline"
            style={styles.logoutButton}
            textStyle={styles.logoutButtonText}
          />
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
  editButton: {
    padding: Sizes.xs,
  },
  content: {
    flex: 1,
  },
  profileCard: {
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
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
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
    marginBottom: Sizes.xs,
  },
  userEmail: {
    fontSize: Sizes.fontSM,
    color: Colors.textSecondary,
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
  buttonContainer: {
    marginTop: Sizes.lg,
  },
  saveButton: {
    marginBottom: Sizes.md,
  },
  cancelButton: {
    marginBottom: 0,
  },
  accountSection: {
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
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Sizes.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: Sizes.fontMD,
    color: Colors.textPrimary,
    marginLeft: Sizes.md,
  },
  logoutSection: {
    margin: Sizes.lg,
    marginTop: 0,
    marginBottom: Sizes.xl,
  },
  logoutButton: {
    borderColor: Colors.error,
    backgroundColor: Colors.white,
  },
  logoutButtonText: {
    color: Colors.error,
  },
  bioContainer: {
    marginBottom: Sizes.lg,
  },
  bioInput: {
    height: 80,
    textAlignVertical: 'top',
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
});