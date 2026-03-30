"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  PhoneAuthProvider,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  updateProfile,
  User as FirebaseUser,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";

export type UserRole = 'USER' | 'OWNER' | 'ADMIN';

interface ExtendedUser extends FirebaseUser {
  role?: UserRole;
}

interface AuthContextType {
  user: ExtendedUser | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role?: UserRole) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithPhone: (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) => Promise<any>;
  logout: () => Promise<void>;
  updateUserRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!auth) {
      setError("Firebase Auth not configured");
      setLoading(false);
      return;
    }

    // Ensure session persistence so users don't stay logged in forever
    setPersistence(auth, browserSessionPersistence).catch(console.error);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔍 Auth state changed:', user?.email || 'no user');
      if (user) {
        // ⚡ Fast path: resolve from localStorage immediately — unblocks UI instantly
        const cachedRole = (localStorage.getItem(`user_role_${user.uid}`) as UserRole) || 'USER';
        console.log('⚡ Fast path role from localStorage:', cachedRole);
        setUser({ ...user, role: cachedRole });
        setLoading(false); // ← unblock UI right away, no Firestore wait

        // 🔄 Slow path: verify role from Firestore in background (non-blocking)
        if (db) {
          const userRef = doc(db, 'users', user.uid);
          getDoc(userRef).then((userSnap) => {
            let finalRole = cachedRole;
            if (userSnap.exists()) {
              finalRole = userSnap.data().role as UserRole;
              console.log('✅ Background sync: Firestore role:', finalRole);
              if (finalRole !== cachedRole) {
                localStorage.setItem(`user_role_${user.uid}`, finalRole);
                setUser((prev) => prev ? { ...prev, role: finalRole } : prev);
              }
            } else if (!cachedRole) {
              localStorage.setItem(`user_role_${user.uid}`, 'USER');
              finalRole = 'USER';
            }
            
            // Redirect from auth pages only AFTER confirming true DB role
            if (typeof window !== 'undefined' && window.location.pathname.includes('/auth/')) {
              let targetPath = '/dashboard/user';
              if (finalRole === 'OWNER') targetPath = '/dashboard/owner';
              if (finalRole === 'ADMIN') targetPath = '/admin/dashboard';
              console.log('🚀 Redirecting to:', targetPath);
              router.push(targetPath);
            }
          }).catch((err) => {
            console.error('❌ Background Firestore sync error:', err);
            // Fallback redirect if DB fails
            if (typeof window !== 'undefined' && window.location.pathname.includes('/auth/')) {
              const targetPath = cachedRole === 'OWNER' ? '/dashboard/owner' : '/dashboard/user';
              router.push(targetPath);
            }
          });
        }

      } else {
        console.log('👋 User logged out - clearing user state');
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const signIn = async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase Auth not configured");
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, name: string, role: UserRole = 'USER') => {
    if (!auth) throw new Error("Firebase Auth not configured");
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName: name });
    
    console.log('📝 Creating user with role:', role, 'for email:', email);
    
    // Save user role in BOTH localStorage AND Firestore
    localStorage.setItem(`user_role_${user.uid}`, role);
    
    if (db) {
      try {
        const userRef = doc(db, 'users', user.uid);
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: name,
          role: role,
          createdAt: Timestamp.now(),
          photoURL: user.photoURL || null,
          updatedAt: Timestamp.now()
        };
        
        console.log('💾 Saving to Firestore:', userData);
        await setDoc(userRef, userData);
        console.log('✅ User document created in Firestore for:', user.email, 'with role:', role);
      } catch (firestoreError) {
        console.error('❌ Firestore error:', firestoreError);
        localStorage.setItem(`user_role_${user.uid}`, role);
      }
    } else {
      console.warn('⚠️ Firestore not available, using localStorage only');
    }
    
    setUser({ ...user, role });
  };

  const signInWithGoogle = async () => {
    if (!auth) throw new Error("Firebase Auth not configured");
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    // Google users are always 'USER' role by default
    localStorage.setItem(`user_role_${result.user.uid}`, 'USER');
    
    // Also save to Firestore if not exists
    if (db) {
      const userRef = doc(db, 'users', result.user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: result.user.email,
          displayName: result.user.displayName,
          role: 'USER',
          createdAt: Timestamp.now(),
          photoURL: result.user.photoURL,
          provider: 'google'
        });
        console.log('✅ Google user document created in Firestore');
      }
    }
  };

  const signInWithPhone = async (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) => {
    if (!auth) throw new Error("Firebase Auth not configured");
    return await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
  };

  const logout = async () => {
    if (!auth) throw new Error("Firebase Auth not configured");
    // Clear role from localStorage before signing out
    if (user) {
      localStorage.removeItem(`user_role_${user.uid}`);
      console.log('✅ Cleared role for user:', user.uid);
    }
    await signOut(auth);
    console.log('✅ User signed out successfully');
  };

  const updateUserRole = async (role: UserRole) => {
    if (!user) throw new Error("No user logged in");
    localStorage.setItem(`user_role_${user.uid}`, role);
    setUser({ ...user, role });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signIn,
        signUp,
        signInWithGoogle,
        signInWithPhone,
        logout,
        updateUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
