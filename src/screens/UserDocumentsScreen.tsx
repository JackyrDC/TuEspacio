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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Sizes } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { userDocumentsService } from '../../services/userDocuments.service';

interface DocumentItem {
  type: 'DNI' | 'studentCarnet' | 'proofOfIncome';
  title: string;
  description: string;
  icon: string;
  file?: any;
  uploaded: boolean;
  required: boolean;
}

interface UserDocumentsScreenProps {
  onComplete?: () => void;
}

export default function UserDocumentsScreen({ onComplete }: UserDocumentsScreenProps = {}) {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<DocumentItem[]>([
    {
      type: 'DNI',
      title: 'Documento Nacional de Identidad',
      description: 'Copia clara de tu cédula de identidad o pasaporte',
      icon: 'card-outline',
      uploaded: false,
      required: true,
    },
    {
      type: 'studentCarnet',
      title: 'Carnet Estudiantil',
      description: 'Carnet vigente de tu institución educativa (opcional para estudiantes)',
      icon: 'school-outline',
      uploaded: false,
      required: false,
    },
    {
      type: 'proofOfIncome',
      title: 'Comprobante de Ingresos',
      description: 'Constancia de trabajo, beca o ingresos familiares (opcional)',
      icon: 'document-text-outline',
      uploaded: false,
      required: false,
    },
  ]);

  useEffect(() => {
    loadUserDocuments();
  }, []);

  const loadUserDocuments = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const userDocuments = await userDocumentsService.getUserDocuments(user.id);
      const status = userDocumentsService.getDocumentStatus(userDocuments);

      setDocuments(prev => prev.map(doc => ({
        ...doc,
        uploaded: status[doc.type]
      })));
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectDocument = async (documentType: 'DNI' | 'studentCarnet' | 'proofOfIncome') => {
    Alert.alert(
      'Seleccionar documento',
      'Elige cómo quieres agregar tu documento',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Tomar foto',
          onPress: () => takePicture(documentType),
        },
        {
          text: 'Seleccionar archivo',
          onPress: () => pickDocument(documentType),
        },
      ]
    );
  };

  const takePicture = async (documentType: 'DNI' | 'studentCarnet' | 'proofOfIncome') => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permisos necesarios', 'Necesitamos permisos de cámara para tomar la foto.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setDocuments(prev => prev.map(doc => 
          doc.type === documentType 
            ? { ...doc, file: asset }
            : doc
        ));
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'No se pudo tomar la foto. Intenta de nuevo.');
    }
  };

  const pickDocument = async (documentType: 'DNI' | 'studentCarnet' | 'proofOfIncome') => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setDocuments(prev => prev.map(doc => 
          doc.type === documentType 
            ? { ...doc, file: asset }
            : doc
        ));
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'No se pudo seleccionar el archivo. Intenta de nuevo.');
    }
  };

  const uploadDocuments = async () => {
    if (!user?.id) return;

    try {
      setUploading(true);
      
      const documentsToUpload: any = {};
      let hasDocuments = false;

      documents.forEach(doc => {
        if (doc.file) {
          const file = new File([doc.file], `${doc.type}_${user.id}`, {
            type: doc.file.mimeType || 'image/jpeg'
          });
          documentsToUpload[doc.type] = file;
          hasDocuments = true;
        }
      });

      if (!hasDocuments) {
        Alert.alert('Sin documentos', 'Por favor selecciona al menos un documento para subir.');
        return;
      }

      await userDocumentsService.upsertUserDocuments(user.id, documentsToUpload);
      
      Alert.alert(
        '¡Documentos subidos!', 
        'Tus documentos han sido enviados exitosamente. Serán revisados y verificados pronto.',
        [
          {
            text: 'OK',
            onPress: () => {
              setDocuments(prev => prev.map(doc => 
                doc.file ? { ...doc, uploaded: true, file: undefined } : doc
              ));
              // Si hay callback de completado, llamarlo
              if (onComplete) {
                onComplete();
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error uploading documents:', error);
      Alert.alert('Error', 'No se pudieron subir los documentos. Intenta de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  const removeDocument = (documentType: 'DNI' | 'studentCarnet' | 'proofOfIncome') => {
    setDocuments(prev => prev.map(doc => 
      doc.type === documentType 
        ? { ...doc, file: undefined }
        : doc
    ));
  };

  const renderDocumentCard = (doc: DocumentItem) => {
    const hasFile = !!doc.file;
    const isImage = doc.file?.mimeType?.startsWith('image/') || doc.file?.uri?.includes('.jpg') || doc.file?.uri?.includes('.png');

    return (
      <View key={doc.type} style={styles.documentCard}>
        <View style={styles.documentHeader}>
          <View style={styles.documentInfo}>
            <View style={[styles.iconContainer, doc.uploaded && styles.iconContainerUploaded]}>
              <Ionicons 
                name={doc.icon as any} 
                size={24} 
                color={doc.uploaded ? Colors.success : Colors.primary} 
              />
            </View>
            <View style={styles.documentText}>
              <Text style={styles.documentTitle}>{doc.title}</Text>
              <Text style={styles.documentDescription}>{doc.description}</Text>
              {doc.required && (
                <Text style={styles.requiredText}>* Obligatorio</Text>
              )}
            </View>
          </View>
          
          <View style={styles.documentStatus}>
            {doc.uploaded && (
              <View style={styles.uploadedBadge}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                <Text style={styles.uploadedText}>Subido</Text>
              </View>
            )}
          </View>
        </View>

        {/* Preview del archivo */}
        {hasFile && (
          <View style={styles.filePreview}>
            {isImage ? (
              <Image source={{ uri: doc.file.uri }} style={styles.previewImage} />
            ) : (
              <View style={styles.fileIcon}>
                <Ionicons name="document-outline" size={40} color={Colors.textSecondary} />
                <Text style={styles.fileName} numberOfLines={1}>
                  {doc.file.name || 'Documento seleccionado'}
                </Text>
              </View>
            )}
            
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeDocument(doc.type)}
            >
              <Ionicons name="close-circle" size={24} color={Colors.error} />
            </TouchableOpacity>
          </View>
        )}

        {/* Botón de acción */}
        {!hasFile && (
          <TouchableOpacity
            style={[styles.selectButton, doc.uploaded && styles.selectButtonUploaded]}
            onPress={() => selectDocument(doc.type)}
          >
            <Ionicons 
              name={doc.uploaded ? "refresh-outline" : "add-outline"} 
              size={20} 
              color={doc.uploaded ? Colors.success : Colors.primary} 
            />
            <Text style={[styles.selectButtonText, doc.uploaded && styles.selectButtonTextUploaded]}>
              {doc.uploaded ? 'Actualizar documento' : 'Seleccionar documento'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const hasDocumentsToUpload = documents.some(doc => !!doc.file);
  const requiredDocumentsCount = documents.filter(doc => doc.required && doc.uploaded).length;
  const totalRequiredDocuments = documents.filter(doc => doc.required).length;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando documentos...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>Mis Documentos</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressTitle}>Documentos completados</Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(requiredDocumentsCount / totalRequiredDocuments) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {requiredDocumentsCount} de {totalRequiredDocuments} obligatorios completados
        </Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.documentsContainer}>
          <Text style={styles.sectionTitle}>
            Sube tus documentos para completar tu perfil
          </Text>
          <Text style={styles.sectionSubtitle}>
            Los documentos ayudan a los propietarios a verificar tu identidad y mejorar tu perfil como inquilino.
          </Text>

          {documents.map(renderDocumentCard)}
        </View>
      </ScrollView>

      {/* Upload Button */}
      {hasDocumentsToUpload && (
        <View style={styles.uploadContainer}>
          <TouchableOpacity
            style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
            onPress={uploadDocuments}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <ActivityIndicator size="small" color={Colors.white} />
                <Text style={styles.uploadButtonText}>Subiendo...</Text>
              </>
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={20} color={Colors.white} />
                <Text style={styles.uploadButtonText}>Subir documentos</Text>
              </>
            )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Sizes.fontMD,
    color: Colors.textSecondary,
    marginTop: Sizes.md,
  },
  progressContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  progressTitle: {
    fontSize: Sizes.fontMD,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Sizes.xs,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.lightGray,
    borderRadius: 4,
    marginBottom: Sizes.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.success,
    borderRadius: 4,
  },
  progressText: {
    fontSize: Sizes.fontSM,
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  documentsContainer: {
    padding: Sizes.lg,
  },
  sectionTitle: {
    fontSize: Sizes.fontLG,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Sizes.xs,
  },
  sectionSubtitle: {
    fontSize: Sizes.fontMD,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Sizes.xl,
  },
  documentCard: {
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
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Sizes.md,
  },
  documentInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Sizes.md,
  },
  iconContainerUploaded: {
    backgroundColor: Colors.success + '15',
  },
  documentText: {
    flex: 1,
  },
  documentTitle: {
    fontSize: Sizes.fontMD,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Sizes.xs,
  },
  documentDescription: {
    fontSize: Sizes.fontSM,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Sizes.xs,
  },
  requiredText: {
    fontSize: Sizes.fontXS,
    color: Colors.error,
    fontWeight: '600',
  },
  documentStatus: {
    alignItems: 'flex-end',
  },
  uploadedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '15',
    paddingHorizontal: Sizes.sm,
    paddingVertical: Sizes.xs,
    borderRadius: Sizes.borderRadius,
  },
  uploadedText: {
    fontSize: Sizes.fontXS,
    color: Colors.success,
    fontWeight: '600',
    marginLeft: Sizes.xs,
  },
  filePreview: {
    position: 'relative',
    marginBottom: Sizes.md,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: Sizes.borderRadius,
    backgroundColor: Colors.lightGray,
  },
  fileIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    borderRadius: Sizes.borderRadius,
    padding: Sizes.lg,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderStyle: 'dashed',
  },
  fileName: {
    fontSize: Sizes.fontSM,
    color: Colors.textSecondary,
    marginTop: Sizes.xs,
    textAlign: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: Sizes.sm,
    right: Sizes.sm,
    backgroundColor: Colors.white,
    borderRadius: 12,
    elevation: 2,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary + '10',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: Sizes.borderRadius,
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.lg,
  },
  selectButtonUploaded: {
    backgroundColor: Colors.success + '10',
    borderColor: Colors.success,
  },
  selectButtonText: {
    fontSize: Sizes.fontMD,
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: Sizes.xs,
  },
  selectButtonTextUploaded: {
    color: Colors.success,
  },
  uploadContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.md,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Sizes.borderRadius,
    paddingVertical: Sizes.lg,
    paddingHorizontal: Sizes.lg,
  },
  uploadButtonDisabled: {
    backgroundColor: Colors.textSecondary,
  },
  uploadButtonText: {
    fontSize: Sizes.fontMD,
    color: Colors.white,
    fontWeight: '600',
    marginLeft: Sizes.xs,
  },
});