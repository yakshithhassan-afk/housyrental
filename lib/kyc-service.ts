import { db, storage } from './firebase';
import { collection, doc, setDoc, getDoc, getDocs, updateDoc, query, where, Timestamp, addDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export interface KYCDocument {
  id: string;
  userId: string;
  name: string;
  type: string;
  status: 'Pending' | 'Verified' | 'Rejected';
  fileUrl: string;
  fileName: string;
  fileSize: number;
  uploadedAt: Timestamp;
  verifiedAt?: Timestamp;
  verifiedBy?: string;
  rejectionReason?: string;
}

/**
 * Upload KYC document to Firebase Storage and Firestore
 */
export const uploadKYCDocument = async (
  userId: string,
  file: File,
  documentType: string,
  documentName: string
): Promise<KYCDocument> => {
  try {
    console.log('🔥 [KYC Service] Starting upload for user:', userId);
    console.log('📁 File details:', { 
      name: file.name, 
      size: file.size, 
      type: file.type 
    });

    // Check if Firestore is initialized
    if (!db) {
      console.error('❌ Firestore not initialized');
      throw new Error('Firestore not configured. Please check your environment variables.');
    }

    console.log('⏳ Reading file as Data URL...');
    
    // Convert file to Base64 for Firestore storage
    const base64String = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });

    console.log('✅ File converted to Base64 (length:', base64String.length, ')');

    // Create document in Firestore with embedded file
    console.log('⏳ Creating Firestore document with embedded file...');
    const docData = {
      userId,
      name: documentName,
      type: documentType,
      status: 'Pending' as const,
      fileUrl: base64String, // Store as Base64 data URL
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadedAt: Timestamp.now(),
      storageType: 'firestore-base64' // Mark as stored in Firestore
    };
    
    console.log('📄 Document data:', {
      userId,
      name: documentName,
      type: documentType,
      fileName: file.name,
      fileSize: file.size,
      storageType: 'firestore-base64'
    });
    
    const docRef = await addDoc(collection(db!, 'kyc-documents'), docData);
    console.log('✅ Firestore document created with ID:', docRef.id);

    const result: KYCDocument = {
      id: docRef.id,
      userId,
      name: documentName,
      type: documentType,
      status: 'Pending',
      fileUrl: base64String,
      fileName: file.name,
      fileSize: file.size,
      uploadedAt: Timestamp.now()
    };

    console.log('✅ KYC upload complete!', result.id);
    return result;
  } catch (error: any) {
    console.error('❌ [KYC Service] Upload failed:', {
      message: error.message,
      code: error.code,
      stack: error.stack?.substring(0, 500)
    });
    throw error;
  }
};

/**
 * Get all KYC documents for a user
 */
export const getUserKYCDocuments = async (userId: string): Promise<KYCDocument[]> => {
  try {
    if (!db) {
      console.error('Firestore not initialized');
      return [];
    }

    const q = query(collection(db, 'kyc-documents'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const documents: KYCDocument[] = [];
    querySnapshot.forEach((doc) => {
      documents.push({
        id: doc.id,
        ...doc.data()
      } as KYCDocument);
    });

    console.log('✅ Loaded', documents.length, 'KYC documents for user', userId);
    return documents;
  } catch (error) {
    console.error('Error fetching KYC documents:', error);
    throw error;
  }
};

/**
 * Update KYC document status (for admin verification)
 */
export const updateKYCStatus = async (
  documentId: string,
  status: 'Verified' | 'Rejected',
  verifiedBy?: string,
  rejectionReason?: string
): Promise<void> => {
  try {
    if (!db) throw new Error('Firestore not initialized');
    const docRef = doc(db, 'kyc-documents', documentId);
    const updateData: any = {
      status,
      verifiedAt: Timestamp.now(),
      verifiedBy
    };

    if (status === 'Rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating KYC status:', error);
    throw error;
  }
};

/**
 * Delete KYC document
 */
export const deleteKYCDocument = async (documentId: string, storagePath: string): Promise<void> => {
  try {
    if (!db || !storage) throw new Error('Firebase not initialized');
    // Delete from Firestore
    await deleteDoc(doc(db, 'kyc-documents', documentId));
    
    // Delete from Storage
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting KYC document:', error);
    throw error;
  }
};

/**
 * Get all KYC documents for admin verification
 */
export const getAllKYCDocumentsForAdmin = async (): Promise<KYCDocument[]> => {
  try {
    if (!db) return [];
    const querySnapshot = await getDocs(collection(db, 'kyc-documents'));
    
    const documents: KYCDocument[] = [];
    querySnapshot.forEach((doc) => {
      documents.push({
        id: doc.id,
        ...doc.data()
      } as KYCDocument);
    });

    return documents;
  } catch (error) {
    console.error('Error fetching all KYC documents:', error);
    throw error;
  }
};

/**
 * Get pending KYC documents for admin review
 */
export const getPendingKYCDocuments = async (): Promise<KYCDocument[]> => {
  try {
    if (!db) return [];
    const q = query(collection(db, 'kyc-documents'), where('status', '==', 'Pending'));
    const querySnapshot = await getDocs(q);
    
    const documents: KYCDocument[] = [];
    querySnapshot.forEach((doc) => {
      documents.push({
        id: doc.id,
        ...doc.data()
      } as KYCDocument);
    });

    return documents;
  } catch (error) {
    console.error('Error fetching pending KYC documents:', error);
    throw error;
  }
};
