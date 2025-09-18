import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Sizes } from '../constants/Colors';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { useAuth } from '../context/AuthContext';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { login: authLogin, register: authRegister } = useAuth();
  const [formData, setFormData] = useState<{
    email: string;
    password: string;
    passwordConfirm: string;
    name: string;
    role: 'Inquilino' | 'Propietario' | 'Administrador';
  }>({
    email: '',
    password: '',
    passwordConfirm: '',
    name: '',
    role: 'Inquilino', // Valor por defecto
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Ingresa un email válido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = 'El nombre es requerido';
      }
      
      if (!formData.passwordConfirm) {
        newErrors.passwordConfirm = 'Confirma tu contraseña';
      } else if (formData.password !== formData.passwordConfirm) {
        newErrors.passwordConfirm = 'Las contraseñas no coinciden';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await authLogin(formData.email, formData.password);
      // No necesitamos llamar onLoginSuccess, el contexto manejará el cambio de estado
    } catch (error: any) {
      Alert.alert(
        'Error de inicio de sesión',
        error.message || 'Credenciales incorrectas. Intenta de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Map UI role to backend role
      const roleMap: Record<string, 'Propietario' | 'Inquilino' | 'Administrador'> = {
        Inquilino: 'Inquilino',
        Propietario: 'Propietario',
        Administrador: 'Administrador',
      };

      await authRegister({
        email: formData.email,
        password: formData.password,
        passwordConfirm: formData.passwordConfirm,
        name: formData.name,
        role: roleMap[formData.role],
      });
    } catch (error: any) {
      let errorTitle = 'Error de registro';
      let errorMessage = error.message || 'No se pudo crear la cuenta. Intenta de nuevo.';
      
      // Personalizar mensaje según el tipo de error
      if (error.message?.includes('email ya está registrado')) {
        errorTitle = 'Email ya existe';
        errorMessage = 'Este email ya tiene una cuenta. ¿Quieres iniciar sesión en su lugar?';
        
        Alert.alert(
          errorTitle,
          errorMessage,
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Ir a Login', 
              onPress: () => {
                setIsLogin(true);
                setFormData(prev => ({
                  ...prev,
                  password: '',
                  passwordConfirm: '',
                  name: '',
                }));
                setErrors({});
              }
            }
          ]
        );
        return;
      }
      
      Alert.alert(errorTitle, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (isLogin) {
      handleLogin();
    } else {
      handleRegister();
    }
  };

  const updateFormData = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/icons/TuEspacio.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>TuEspacio</Text>
            <Text style={styles.subtitle}>
              {isLogin 
                ? 'Bienvenido de nuevo' 
                : 'Crea tu cuenta para comenzar'
              }
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {!isLogin && (
              <>
                <CustomInput
                  label="Nombre completo"
                  placeholder="Ingresa tu nombre"
                  value={formData.name}
                  onChangeText={(value) => updateFormData('name', value)}
                  error={errors.name}
                  autoCapitalize="words"
                />

                <View style={styles.roleContainer}>
                  <Text style={styles.roleLabel}>Tipo de usuario</Text>
                  <View style={styles.roleOptions}>
                    <TouchableOpacity
                      style={[
                        styles.roleOption,
                        formData.role === 'Inquilino' && styles.roleOptionSelected
                      ]}
                      onPress={() => updateFormData('role', 'Inquilino')}
                    >
                      <Text style={[
                        styles.roleOptionText,
                        formData.role === 'Inquilino' && styles.roleOptionTextSelected
                      ]}>
                        🏠 Inquilino
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.roleOption,
                        formData.role === 'Propietario' && styles.roleOptionSelected
                      ]}
                      onPress={() => updateFormData('role', 'Propietario')}
                    >
                      <Text style={[
                        styles.roleOptionText,
                        formData.role === 'Propietario' && styles.roleOptionTextSelected
                      ]}>
                        🏡 Propietario
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}

            <CustomInput
              label="Email"
              placeholder="ejemplo@correo.com"
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <CustomInput
              label="Contraseña"
              placeholder="••••••••"
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
              error={errors.password}
              secureTextEntry
              autoCapitalize="none"
            />

            {!isLogin && (
              <CustomInput
                label="Confirmar contraseña"
                placeholder="••••••••"
                value={formData.passwordConfirm}
                onChangeText={(value) => updateFormData('passwordConfirm', value)}
                error={errors.passwordConfirm}
                secureTextEntry
                autoCapitalize="none"
              />
            )}

            <CustomButton
              title={isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
              onPress={handleSubmit}
              loading={loading}
              style={styles.submitButton}
            />

            <CustomButton
              title={isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
              onPress={() => {
                setIsLogin(!isLogin);
                setErrors({});
                setFormData({
                  email: '',
                  password: '',
                  passwordConfirm: '',
                  name: '',
                  role: 'Inquilino',
                });
              }}
              variant="outline"
              style={styles.switchButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Sizes.xl,
    paddingVertical: Sizes.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Sizes.xxl,
  },
  logoContainer: {
    backgroundColor: Colors.white,
    borderRadius: 40,
    padding: Sizes.md,
    marginBottom: Sizes.lg,
    shadowColor: Colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  logo: {
    width: 60,
    height: 60,
  },
  title: {
    fontSize: Sizes.fontXL,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: Sizes.sm,
  },
  subtitle: {
    fontSize: Sizes.fontMD,
    color: Colors.white + 'CC',
    textAlign: 'center',
  },
  form: {
    backgroundColor: Colors.white,
    borderRadius: Sizes.borderRadiusLG,
    padding: Sizes.xl,
    shadowColor: Colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  submitButton: {
    marginTop: Sizes.lg,
    marginBottom: Sizes.md,
  },
  switchButton: {
    marginTop: Sizes.sm,
  },
  roleContainer: {
    marginBottom: Sizes.lg,
  },
  roleLabel: {
    fontSize: Sizes.fontMD,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Sizes.sm,
  },
  roleOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Sizes.sm,
  },
  roleOption: {
    flex: 1,
    padding: Sizes.md,
    borderRadius: Sizes.borderRadius,
    borderWidth: 2,
    borderColor: Colors.lightGray,
    backgroundColor: Colors.background,
    alignItems: 'center',
  },
  roleOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  roleOptionText: {
    fontSize: Sizes.fontSM,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  roleOptionTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
});