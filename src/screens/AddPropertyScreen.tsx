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

export default function AddPropertyScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [formData, setFormData] = useState({
    // Información básica
    title: '',
    description: '',
    type: 'departamento',
    size: '',
    
    // Ubicación
    address: '',
    city: 'Tegucigalpa',
    neighborhood: '',
    latitude: '',
    longitude: '',
    
    // Precio y términos
    price: '',
    deposit: '',
    minContract: 'semestre', // semestre, año, mensual
    utilities: 'incluidos', // incluidos, separados
    
    // Amenidades
    furnished: false,
    wifi: false,
    parking: false,
    laundry: false,
    airConditioning: false,
    security: false,
    nearUniversity: false,
    
    // Reglas
    pets: false,
    smoking: false,
    parties: false,
    visitHours: '8:00 AM - 10:00 PM',
    
    // Documentos
    photos: [],
    propertyDocs: [],
    verified: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateFormData = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const validateCurrentStep = () => {
    const newErrors: Record<string, string> = {};
    
    switch (currentStep) {
      case 1: // Información básica
        if (!formData.title.trim()) newErrors.title = 'El título es requerido';
        if (!formData.description.trim()) newErrors.description = 'La descripción es requerida';
        if (!formData.size.trim()) newErrors.size = 'El tamaño es requerido';
        break;
        
      case 2: // Ubicación
        if (!formData.address.trim()) newErrors.address = 'La dirección es requerida';
        if (!formData.neighborhood.trim()) newErrors.neighborhood = 'El barrio es requerido';
        break;
        
      case 3: // Precio
        if (!formData.price.trim()) newErrors.price = 'El precio es requerido';
        else if (isNaN(Number(formData.price))) newErrors.price = 'El precio debe ser un número';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // TODO: Integrar con servicio de propiedades
      console.log('Datos de la propiedad:', formData);
      
      Alert.alert(
        '¡Propiedad agregada!',
        'Tu propiedad ha sido enviada para revisión. Te notificaremos cuando esté aprobada.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo agregar la propiedad. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {Array.from({ length: totalSteps }, (_, index) => (
        <View key={index} style={styles.stepContainer}>
          <View style={[
            styles.stepCircle,
            index + 1 <= currentStep && styles.stepCircleActive
          ]}>
            <Text style={[
              styles.stepNumber,
              index + 1 <= currentStep && styles.stepNumberActive
            ]}>
              {index + 1}
            </Text>
          </View>
          {index < totalSteps - 1 && (
            <View style={[
              styles.stepLine,
              index + 1 < currentStep && styles.stepLineActive
            ]} />
          )}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Información Básica</Text>
      
      <CustomInput
        label="Título de la propiedad"
        placeholder="Ej: Apartamento cerca de UNAH"
        value={formData.title}
        onChangeText={(value) => updateFormData('title', value)}
        error={errors.title}
      />

      <CustomInput
        label="Descripción"
        placeholder="Describe tu propiedad..."
        value={formData.description}
        onChangeText={(value) => updateFormData('description', value)}
        error={errors.description}
        multiline
        numberOfLines={4}
        style={styles.textArea}
      />

      <View style={styles.selectContainer}>
        <Text style={styles.label}>Tipo de propiedad</Text>
        <View style={styles.selectOptions}>
          {['departamento', 'casa', 'habitación'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.selectOption,
                formData.type === type && styles.selectOptionActive
              ]}
              onPress={() => updateFormData('type', type)}
            >
              <Text style={[
                styles.selectOptionText,
                formData.type === type && styles.selectOptionTextActive
              ]}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <CustomInput
        label="Tamaño (m²)"
        placeholder="Ej: 50"
        value={formData.size}
        onChangeText={(value) => updateFormData('size', value)}
        error={errors.size}
        keyboardType="numeric"
      />
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Ubicación</Text>
      
      <CustomInput
        label="Dirección completa"
        placeholder="Ej: Col. Universidad, Calle Principal"
        value={formData.address}
        onChangeText={(value) => updateFormData('address', value)}
        error={errors.address}
      />

      <CustomInput
        label="Barrio/Colonia"
        placeholder="Ej: Colonia Universidad"
        value={formData.neighborhood}
        onChangeText={(value) => updateFormData('neighborhood', value)}
        error={errors.neighborhood}
      />

      <View style={styles.selectContainer}>
        <Text style={styles.label}>Ciudad</Text>
        <View style={styles.selectOptions}>
          {['Tegucigalpa', 'San Pedro Sula', 'Comayagua'].map((city) => (
            <TouchableOpacity
              key={city}
              style={[
                styles.selectOption,
                formData.city === city && styles.selectOptionActive
              ]}
              onPress={() => updateFormData('city', city)}
            >
              <Text style={[
                styles.selectOptionText,
                formData.city === city && styles.selectOptionTextActive
              ]}>
                {city}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.locationButton}>
        <Ionicons name="location-outline" size={20} color={Colors.primary} />
        <Text style={styles.locationButtonText}>Marcar en el mapa</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Precio y Términos</Text>
      
      <CustomInput
        label="Precio mensual (Lempiras)"
        placeholder="Ej: 8000"
        value={formData.price}
        onChangeText={(value) => updateFormData('price', value)}
        error={errors.price}
        keyboardType="numeric"
      />

      <CustomInput
        label="Depósito de garantía (Lempiras)"
        placeholder="Ej: 8000"
        value={formData.deposit}
        onChangeText={(value) => updateFormData('deposit', value)}
        keyboardType="numeric"
      />

      <View style={styles.selectContainer}>
        <Text style={styles.label}>Contrato mínimo</Text>
        <View style={styles.selectOptions}>
          {[
            { key: 'mensual', label: 'Mensual' },
            { key: 'semestre', label: 'Semestre' },
            { key: 'año', label: 'Año académico' }
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.selectOption,
                formData.minContract === option.key && styles.selectOptionActive
              ]}
              onPress={() => updateFormData('minContract', option.key)}
            >
              <Text style={[
                styles.selectOptionText,
                formData.minContract === option.key && styles.selectOptionTextActive
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.selectContainer}>
        <Text style={styles.label}>Servicios públicos</Text>
        <View style={styles.selectOptions}>
          {[
            { key: 'incluidos', label: 'Incluidos' },
            { key: 'separados', label: 'Por separado' }
          ].map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.selectOption,
                formData.utilities === option.key && styles.selectOptionActive
              ]}
              onPress={() => updateFormData('utilities', option.key)}
            >
              <Text style={[
                styles.selectOptionText,
                formData.utilities === option.key && styles.selectOptionTextActive
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderStep4 = () => {
    const amenities = [
      { key: 'furnished', label: 'Amueblado', icon: '🛋️' },
      { key: 'wifi', label: 'WiFi', icon: '📶' },
      { key: 'parking', label: 'Estacionamiento', icon: '🚗' },
      { key: 'laundry', label: 'Lavandería', icon: '👕' },
      { key: 'airConditioning', label: 'Aire acondicionado', icon: '❄️' },
      { key: 'security', label: 'Seguridad', icon: '🛡️' },
      { key: 'nearUniversity', label: 'Cerca de UNAH', icon: '🎓' },
    ];

    return (
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>Amenidades y Reglas</Text>
        
        <Text style={styles.subsectionTitle}>Amenidades incluidas</Text>
        <View style={styles.amenitiesGrid}>
          {amenities.map((amenity) => (
            <TouchableOpacity
              key={amenity.key}
              style={[
                styles.amenityItem,
                formData[amenity.key as keyof typeof formData] && styles.amenityItemActive
              ]}
              onPress={() => updateFormData(amenity.key, !formData[amenity.key as keyof typeof formData])}
            >
              <Text style={styles.amenityIcon}>{amenity.icon}</Text>
              <Text style={[
                styles.amenityLabel,
                formData[amenity.key as keyof typeof formData] && styles.amenityLabelActive
              ]}>
                {amenity.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.subsectionTitle}>Reglas de la propiedad</Text>
        
        <View style={styles.rulesContainer}>
          <TouchableOpacity
            style={styles.ruleItem}
            onPress={() => updateFormData('pets', !formData.pets)}
          >
            <Ionicons 
              name={formData.pets ? "checkmark-circle" : "ellipse-outline"} 
              size={24} 
              color={formData.pets ? Colors.success : Colors.textSecondary} 
            />
            <Text style={styles.ruleText}>Mascotas permitidas</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.ruleItem}
            onPress={() => updateFormData('smoking', !formData.smoking)}
          >
            <Ionicons 
              name={formData.smoking ? "checkmark-circle" : "ellipse-outline"} 
              size={24} 
              color={formData.smoking ? Colors.success : Colors.textSecondary} 
            />
            <Text style={styles.ruleText}>Fumar permitido</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.ruleItem}
            onPress={() => updateFormData('parties', !formData.parties)}
          >
            <Ionicons 
              name={formData.parties ? "checkmark-circle" : "ellipse-outline"} 
              size={24} 
              color={formData.parties ? Colors.success : Colors.textSecondary} 
            />
            <Text style={styles.ruleText}>Fiestas permitidas</Text>
          </TouchableOpacity>
        </View>

        <CustomInput
          label="Horario de visitas"
          placeholder="Ej: 8:00 AM - 10:00 PM"
          value={formData.visitHours}
          onChangeText={(value) => updateFormData('visitHours', value)}
        />
      </View>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return renderStep1();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agregar Propiedad</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Step Indicator */}
      {renderStepIndicator()}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderCurrentStep()}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <CustomButton
          title={currentStep === totalSteps ? 'Publicar Propiedad' : 'Continuar'}
          onPress={handleNext}
          loading={loading}
          style={styles.nextButton}
        />
      </View>
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
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Sizes.lg,
    backgroundColor: Colors.white,
    elevation: 2,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: Colors.primary,
  },
  stepNumber: {
    fontSize: Sizes.fontSM,
    fontWeight: 'bold',
    color: Colors.textSecondary,
  },
  stepNumberActive: {
    color: Colors.white,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: Colors.lightGray,
    marginHorizontal: Sizes.sm,
  },
  stepLineActive: {
    backgroundColor: Colors.primary,
  },
  content: {
    flex: 1,
  },
  stepContent: {
    padding: Sizes.lg,
  },
  stepTitle: {
    fontSize: Sizes.fontLG,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Sizes.lg,
    textAlign: 'center',
  },
  label: {
    fontSize: Sizes.fontMD,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Sizes.sm,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  selectContainer: {
    marginBottom: Sizes.lg,
  },
  selectOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Sizes.sm,
  },
  selectOption: {
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    borderRadius: Sizes.borderRadius,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    backgroundColor: Colors.background,
  },
  selectOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  selectOptionText: {
    fontSize: Sizes.fontSM,
    color: Colors.textSecondary,
  },
  selectOptionTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Sizes.md,
    borderRadius: Sizes.borderRadius,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
    marginTop: Sizes.md,
  },
  locationButtonText: {
    fontSize: Sizes.fontMD,
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: Sizes.sm,
  },
  subsectionTitle: {
    fontSize: Sizes.fontMD,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Sizes.md,
    marginTop: Sizes.lg,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Sizes.sm,
    marginBottom: Sizes.lg,
  },
  amenityItem: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: Sizes.borderRadius,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Sizes.sm,
  },
  amenityItemActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  amenityIcon: {
    fontSize: 24,
    marginBottom: Sizes.xs,
  },
  amenityLabel: {
    fontSize: Sizes.fontXS,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  amenityLabelActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  rulesContainer: {
    marginBottom: Sizes.lg,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.sm,
  },
  ruleText: {
    fontSize: Sizes.fontMD,
    color: Colors.textPrimary,
    marginLeft: Sizes.md,
  },
  footer: {
    padding: Sizes.lg,
    backgroundColor: Colors.white,
    elevation: 4,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  nextButton: {
    marginBottom: 0,
  },
});