import {
  getFirestore,
  connectFirestoreEmulator,
  serverTimestamp,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  deleteDoc,
} from 'firebase/firestore'
import { app } from './firebase'

export const db = getFirestore(app)

// ---------------------------------------------------------------------------
// LOCAL DEVELOPMENT — Firestore Emulator Connection
// Uncomment this block to route Firestore through the local emulator.
// Keep commented out for production Vercel deployments.
// ---------------------------------------------------------------------------
// if (import.meta.env.DEV) {
//   connectFirestoreEmulator(db, '127.0.0.1', 8080)
// }


export {
  serverTimestamp,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  deleteDoc,
}
