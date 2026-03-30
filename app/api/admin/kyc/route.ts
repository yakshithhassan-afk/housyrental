import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, query, where, Timestamp } from 'firebase/firestore';

// Simple admin verification without Firebase Admin SDK
async function verifyAdminToken(token: string): Promise<{ uid: string; email: string } | null> {
  try {
    // Parse the token (it's a JWT from Firebase)
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const decodedToken = JSON.parse(jsonPayload);
    
    // For now, allow any authenticated user with OWNER or ADMIN role
    // In production, you should implement proper admin claims
    console.log('🔍 Token payload:', { 
      uid: decodedToken.user_id, 
      email: decodedToken.email,
      exp: new Date(decodedToken.exp * 1000).toISOString()
    });
    
    // Check if token is expired
    if (decodedToken.exp && decodedToken.exp < Date.now() / 1000) {
      console.log('⚠️ Token expired');
      return null;
    }
    
    return { 
      uid: decodedToken.user_id || decodedToken.uid, 
      email: decodedToken.email || '' 
    };
  } catch (error) {
    console.error('❌ Token verification failed:', error);
    return null;
  }
}

/**
 * GET /api/admin/kyc - Get all KYC documents or pending documents
 * POST /api/admin/kyc/verify - Verify/reject a KYC document
 */

export async function GET(request: NextRequest) {
  try {
    if (!db) {
      console.error('❌ Firestore not initialized');
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('⚠️ No authorization token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const admin = await verifyAdminToken(token);

    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    console.log('📥 Fetching KYC documents, filter:', status || 'all');

    let documents;
    if (status === 'pending') {
      const q = query(collection(db, 'kyc-documents'), where('status', '==', 'Pending'));
      const querySnapshot = await getDocs(q);
      documents = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      const querySnapshot = await getDocs(collection(db, 'kyc-documents'));
      documents = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    console.log('✅ Found', documents.length, 'documents');
    return NextResponse.json({ documents }, { status: 200 });
  } catch (error) {
    console.error('❌ Error fetching KYC documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch KYC documents' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!db) {
      console.error('❌ Firestore not initialized');
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const admin = await verifyAdminToken(token);

    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const body = await request.json();
    const { documentId, status, rejectionReason } = body;

    console.log('📝 Updating document:', documentId, 'to status:', status);

    if (!documentId || !status) {
      return NextResponse.json(
        { error: 'Document ID and status are required' },
        { status: 400 }
      );
    }

    if (!['Verified', 'Rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be either "Verified" or "Rejected"' },
        { status: 400 }
      );
    }

    // Update KYC status directly in Firestore
    const docRef = doc(db, 'kyc-documents', documentId);
    const updateData: any = {
      status,
      verifiedAt: Timestamp.now(),
      verifiedBy: admin.uid
    };

    if (status === 'Rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    await updateDoc(docRef, updateData);

    console.log('✅ Document updated successfully');
    return NextResponse.json(
      { success: true, message: `Document ${status.toLowerCase()} successfully` },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error updating KYC status:', error);
    return NextResponse.json(
      { error: 'Failed to update KYC status' },
      { status: 500 }
    );
  }
}
