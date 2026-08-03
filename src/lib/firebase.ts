import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth'
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'

const getEnv = (key: string) => {
  const value = import.meta.env[key as keyof ImportMetaEnv]
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Missing or invalid Firebase environment variable: ${key}`)
  }
  return value
}

const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY'),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('VITE_FIREBASE_APP_ID'),
}

if (import.meta.env.DEV) {
  console.debug('Firebase config loaded:', {
    apiKey: firebaseConfig.apiKey ? '***REDACTED***' : firebaseConfig.apiKey,
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
    messagingSenderId: firebaseConfig.messagingSenderId,
    appId: firebaseConfig.appId,
  })
  console.debug('import.meta.env keys:', {
    hasApiKey: Boolean(import.meta.env.VITE_FIREBASE_API_KEY),
    hasAuthDomain: Boolean(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
    hasProjectId: Boolean(import.meta.env.VITE_FIREBASE_PROJECT_ID),
    hasStorageBucket: Boolean(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
    hasMessagingSenderId: Boolean(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
    hasAppId: Boolean(import.meta.env.VITE_FIREBASE_APP_ID),
  })
}

// Initialize Firebase App
export const app = initializeApp(firebaseConfig)

// Initialize Firebase Auth
export const auth = getAuth(app)

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider()

// Initialize Firebase Functions
export const functions = getFunctions(app)

if (import.meta.env.DEV) {
  connectFunctionsEmulator(functions, '127.0.0.1', 5001)
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
}
