import { initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  User,
  getAuth,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  getDocFromServer,
  getFirestore,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
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

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('the client is offline')
    ) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

void testConnection();

export interface PlayerProgress {
  bestStageAcorns: [number, number, number];
  highestStageUnlocked: number;
}

export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOutPlayer(): Promise<void> {
  await signOut(auth);
}

function sanitizeDisplayName(user: User): string {
  const raw = (user.displayName || user.email?.split('@')[0] || 'Bramble Knight').trim();
  return raw.slice(0, 80) || 'Bramble Knight';
}

function clampAcorn(val: unknown): number {
  const n = typeof val === 'number' && Number.isFinite(val) ? Math.floor(val) : 0;
  return Math.max(0, Math.min(12, n));
}

function clampStage(val: unknown): number {
  const n = typeof val === 'number' && Number.isFinite(val) ? Math.floor(val) : 0;
  return Math.max(0, Math.min(2, n));
}

export async function loadOrCreatePlayerProgress(
  user: User
): Promise<PlayerProgress> {
  const path = `playerProfiles/${user.uid}`;
  const ref = doc(db, 'playerProfiles', user.uid);
  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      const acorns = Array.isArray(data.bestStageAcorns)
        ? data.bestStageAcorns
        : [0, 0, 0];
      return {
        bestStageAcorns: [
          clampAcorn(acorns[0]),
          clampAcorn(acorns[1]),
          clampAcorn(acorns[2]),
        ],
        highestStageUnlocked: clampStage(data.highestStageUnlocked),
      };
    }

    const initial: PlayerProgress = {
      bestStageAcorns: [0, 0, 0],
      highestStageUnlocked: 0,
    };

    await setDoc(ref, {
      uid: user.uid,
      displayName: sanitizeDisplayName(user),
      bestStageAcorns: initial.bestStageAcorns,
      highestStageUnlocked: initial.highestStageUnlocked,
      updatedAt: serverTimestamp(),
    });
    return initial;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function savePlayerProgress(
  user: User,
  progress: PlayerProgress
): Promise<void> {
  const path = `playerProfiles/${user.uid}`;
  const ref = doc(db, 'playerProfiles', user.uid);
  try {
    await setDoc(
      ref,
      {
        uid: user.uid,
        displayName: sanitizeDisplayName(user),
        bestStageAcorns: [
          clampAcorn(progress.bestStageAcorns[0]),
          clampAcorn(progress.bestStageAcorns[1]),
          clampAcorn(progress.bestStageAcorns[2]),
        ],
        highestStageUnlocked: clampStage(progress.highestStageUnlocked),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
