import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  User, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocFromServer, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Initialize Firestore with the provisioned database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Standard Firestore Error Formatter conforming to FirestoreErrorInfo
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write'
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection on Initial Boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is currently offline or connecting...');
    }
  }
}
testConnection();

// Sign In with Google Popup
export async function signInWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Upsert user profile to Firestore
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        userId: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Health Officer',
        photoURL: user.photoURL || '',
        role: 'DHO',
        state: 'KERALA',
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
    return user;
  } catch (error) {
    console.error('Google Sign-in failed:', error);
    throw error;
  }
}

// Sign Out
export async function signOutUser(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Sign-out failed:', error);
  }
}

// Persist Field Report to Firestore
export async function persistFieldReport(report: {
  phcId: string;
  facilityName: string;
  occupiedBeds: number;
  presentStaff: number;
}) {
  if (!auth.currentUser) return null;
  const path = 'field_reports';
  const reportId = `rep_${Date.now()}`;
  try {
    const docRef = doc(db, path, reportId);
    await setDoc(docRef, {
      reportId,
      userId: auth.currentUser.uid,
      phcId: report.phcId,
      facilityName: report.facilityName,
      occupiedBeds: report.occupiedBeds,
      presentStaff: report.presentStaff,
      createdAt: new Date().toISOString()
    });
    return reportId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    return null;
  }
}

// Persist Approved Transfer to Firestore
export async function persistApprovedTransfer(transfer: {
  id: string;
  sourcePhcId: string;
  targetPhcId: string;
  drugId: string;
  quantity: number;
  approvedBy: string;
  challanNumber: string;
}) {
  if (!auth.currentUser) return null;
  const path = 'transfers';
  try {
    const docRef = doc(db, path, transfer.id);
    await setDoc(docRef, {
      transferId: transfer.id,
      sourcePhcId: transfer.sourcePhcId,
      targetPhcId: transfer.targetPhcId,
      drugId: transfer.drugId,
      quantity: transfer.quantity,
      status: 'APPROVED',
      approvedBy: transfer.approvedBy,
      challanNumber: transfer.challanNumber,
      createdAt: new Date().toISOString()
    }, { merge: true });
    return transfer.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return null;
  }
}
