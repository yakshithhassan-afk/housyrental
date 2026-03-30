import { NextRequest } from 'next/server';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';

// Initialize Firebase Admin SDK
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export interface AdminUser {
  uid: string;
  email: string;
  isAdmin: boolean;
}

/**
 * Verify admin authentication from request headers
 */
export async function getAdminAuth(request: NextRequest): Promise<AdminUser | null> {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split('Bearer ')[1];
    
    if (!token) {
      return null;
    }

    // Verify the Firebase ID token
    const decodedToken = await getAuth().verifyIdToken(token);
    
    // Check if user has admin role (you can store this in custom claims or Firestore)
    const isAdmin = decodedToken.admin === true || 
                    decodedToken.email?.endsWith('@admin.com') ||
                    process.env.ADMIN_UIDS?.includes(decodedToken.uid);

    if (!isAdmin) {
      return null;
    }

    return {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      isAdmin: true
    };
  } catch (error) {
    console.error('Error verifying admin auth:', error);
    return null;
  }
}
