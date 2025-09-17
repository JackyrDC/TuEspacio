import pb from '../config/pocketbase';
import { UserDocument } from '../types/types';

// Tipo extendido para manejar la respuesta de PocketBase
interface UserDocumentRecord extends UserDocument {
  expand?: any;
  collectionId: string;
  collectionName: string;
}

export class UserDocumentsService {
  private collectionName = 'userDocuments';

  /**
   * Obtener documentos de un usuario específico
   */
  async getUserDocuments(userId: string): Promise<UserDocumentRecord | null> {
    try {
      const records = await pb.collection(this.collectionName).getList(1, 1, {
        filter: `user = "${userId}"`,
      });
      
      return records.items.length > 0 ? records.items[0] as UserDocumentRecord : null;
    } catch (error) {
      console.error('Error getting user documents:', error);
      throw error;
    }
  }

  /**
   * Crear o actualizar documentos de usuario
   */
  async upsertUserDocuments(userId: string, documents: {
    DNI?: File;
    studentCarnet?: File;
    proofOfIncome?: File;
  }): Promise<UserDocumentRecord> {
    try {
      // Verificar si ya existen documentos para este usuario
      const existing = await this.getUserDocuments(userId);
      
      const formData = new FormData();
      formData.append('user', userId);
      
      // Agregar archivos si se proporcionan
      if (documents.DNI) {
        formData.append('DNI', documents.DNI);
      }
      if (documents.studentCarnet) {
        formData.append('studentCarnet', documents.studentCarnet);
      }
      if (documents.proofOfIncome) {
        formData.append('proofOfIncome', documents.proofOfIncome);
      }

      let result: UserDocumentRecord;
      
      if (existing) {
        // Actualizar documentos existentes
        result = await pb.collection(this.collectionName).update(existing.id, formData) as UserDocumentRecord;
      } else {
        // Crear nuevos documentos
        result = await pb.collection(this.collectionName).create(formData) as UserDocumentRecord;
      }
      
      return result;
    } catch (error) {
      console.error('Error upserting user documents:', error);
      throw error;
    }
  }

  /**
   * Eliminar un documento específico
   */
  async deleteDocument(userId: string, documentType: 'DNI' | 'studentCarnet' | 'proofOfIncome'): Promise<UserDocumentRecord> {
    try {
      const existing = await this.getUserDocuments(userId);
      
      if (!existing) {
        throw new Error('No se encontraron documentos para este usuario');
      }

      const formData = new FormData();
      formData.append(documentType, ''); // Enviar campo vacío para eliminar
      
      const result = await pb.collection(this.collectionName).update(existing.id, formData) as UserDocumentRecord;
      return result;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  /**
   * Obtener URL de un documento específico
   */
  getDocumentUrl(userDocument: UserDocumentRecord, documentType: 'DNI' | 'studentCarnet' | 'proofOfIncome'): string | null {
    const fileName = userDocument[documentType];
    if (!fileName) return null;
    
    return pb.files.getUrl(userDocument, fileName);
  }

  /**
   * Verificar si un usuario tiene documentos completos
   */
  hasCompleteDocuments(userDocument: UserDocumentRecord | null): boolean {
    if (!userDocument) return false;
    
    return !!(userDocument.DNI && userDocument.studentCarnet && userDocument.proofOfIncome);
  }

  /**
   * Obtener estado de documentos de un usuario
   */
  getDocumentStatus(userDocument: UserDocumentRecord | null): {
    DNI: boolean;
    studentCarnet: boolean;
    proofOfIncome: boolean;
    isComplete: boolean;
  } {
    if (!userDocument) {
      return {
        DNI: false,
        studentCarnet: false,
        proofOfIncome: false,
        isComplete: false,
      };
    }

    const status = {
      DNI: !!userDocument.DNI,
      studentCarnet: !!userDocument.studentCarnet,
      proofOfIncome: !!userDocument.proofOfIncome,
      isComplete: false,
    };

    status.isComplete = status.DNI && status.studentCarnet && status.proofOfIncome;
    
    return status;
  }
}

export const userDocumentsService = new UserDocumentsService();