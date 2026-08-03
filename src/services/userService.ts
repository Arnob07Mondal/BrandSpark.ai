import type { User } from 'firebase/auth'
import {
  db,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from '../lib/firestore'
import type { UserProfile } from '../types/user'

const USERS_COLLECTION = 'users'

/**
 * Fetch a user profile document from Firestore
 * @param uid The unique user identifier
 */
export async function getUser(uid: string): Promise<UserProfile | null> {
  const docRef = doc(db, USERS_COLLECTION, uid)
  const docSnap = await getDoc(docRef)
  if (docSnap.exists()) {
    return docSnap.data() as UserProfile
  }
  return null
}

/**
 * Checks if the user exists in Firestore:
 * - If not, creates a new document with full profile.
 * - If yes, updates only the lastLogin field to preserve createdAt.
 * @param user The authenticated user object from Firebase Auth
 */
export async function createUserIfNotExists(user: User): Promise<void> {
  const docRef = doc(db, USERS_COLLECTION, user.uid)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) {
    const newUserProfile: UserProfile = {
      uid: user.uid,
      displayName: user.displayName || '',
      email: user.email || '',
      photoURL: user.photoURL || '',
      provider: 'google',
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      role: 'user',
      isActive: true,
    }
    await setDoc(docRef, newUserProfile)
  } else {
    await updateDoc(docRef, {
      lastLogin: serverTimestamp(),
    })
  }
}

/**
 * Updates the lastLogin field of an existing user document
 * @param uid The unique user identifier
 */
export async function updateLastLogin(uid: string): Promise<void> {
  const docRef = doc(db, USERS_COLLECTION, uid)
  await updateDoc(docRef, {
    lastLogin: serverTimestamp(),
  })
}
