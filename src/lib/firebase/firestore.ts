import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  DocumentData,
  QueryConstraint,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';

export async function getCollectionData<T = DocumentData>(collectionName: string, ...constraints: QueryConstraint[]): Promise<T[]> {
  const q = query(collection(db, collectionName), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((docSnap: QueryDocumentSnapshot<DocumentData>) => ({ id: docSnap.id, ...docSnap.data() } as T));
}

export async function getDocumentData<T = DocumentData>(collectionName: string, id: string): Promise<T | null> {
  const ref = doc(db, collectionName, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as T;
}

export async function setDocumentData(collectionName: string, id: string, data: any) {
  const ref = doc(db, collectionName, id);
  return setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

export async function deleteDocumentData(collectionName: string, id: string) {
  const ref = doc(db, collectionName, id);
  return deleteDoc(ref);
}

export function subscribeCollectionData<T = DocumentData>(
  collectionName: string,
  callback: (data: T[]) => void,
  onError?: (error: Error) => void,
  ...constraints: QueryConstraint[]
) {
  const q = query(collection(db, collectionName), ...constraints);
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({ id: d.id, ...d.data() } as T));
      callback(items);
    },
    (error) => {
      console.warn(`Firestore subscription notice [${collectionName}]:`, error.message);
      if (onError) onError(error);
    }
  );
}
