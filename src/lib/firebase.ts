import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import {
  getStorage,
  FirebaseStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import defaultConfig from '../../firebase-applet-config.json';
import { BookingRecord, ChaletConfig, PricingConfig, ResortImagesConfig } from '../types';
import { uploadImageToImgBB } from '../utils/imgbb';

export interface FirebaseCustomConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
  firestoreDatabaseId?: string;
}

export const DEFAULT_FIREBASE_CONFIG: FirebaseCustomConfig = {
  apiKey: "AIzaSyDLLusnOb1qa5bDWC0sPSlxsP9jexL4TjY",
  authDomain: "maryam-resort.firebaseapp.com",
  projectId: "maryam-resort",
  storageBucket: "maryam-resort.firebasestorage.app",
  messagingSenderId: "894822537731",
  appId: "1:894822537731:web:e68a42816ecebcf094cc36",
  firestoreDatabaseId: "",
};

const CUSTOM_FIREBASE_KEY = 'maryam_resort_custom_firebase_config';

export function getActiveFirebaseConfig(): FirebaseCustomConfig {
  try {
    const saved = localStorage.getItem(CUSTOM_FIREBASE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Clean up obsolete test projects from localStorage
      if (parsed.projectId === 'athletic-descent-1mn89') {
        localStorage.removeItem(CUSTOM_FIREBASE_KEY);
      } else if (parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not parse custom Firebase config, using default', err);
  }

  return DEFAULT_FIREBASE_CONFIG;
}

export function saveCustomFirebaseConfig(config: FirebaseCustomConfig | null): void {
  try {
    if (config && config.apiKey && config.projectId) {
      localStorage.setItem(CUSTOM_FIREBASE_KEY, JSON.stringify(config));
    } else {
      localStorage.removeItem(CUSTOM_FIREBASE_KEY);
    }
    // Reload to re-initialize firebase with new credentials
    window.location.reload();
  } catch (err) {
    console.error('Failed to save custom Firebase config', err);
  }
}

// Global instances
let firebaseApp: FirebaseApp | null = null;
let firestoreDb: Firestore | null = null;
let firebaseStorage: FirebaseStorage | null = null;
let connectionInitialized = false;

export function getFirebaseApp(): FirebaseApp | null {
  if (firebaseApp) return firebaseApp;

  try {
    const config = getActiveFirebaseConfig();
    if (!config.apiKey || !config.projectId) {
      console.warn('Firebase config missing apiKey or projectId.');
      return null;
    }

    if (getApps().length > 0) {
      firebaseApp = getApp();
    } else {
      firebaseApp = initializeApp(config);
    }
    return firebaseApp;
  } catch (err) {
    console.error('Failed to initialize Firebase App:', err);
    return null;
  }
}

export function getFirestoreDb(): Firestore | null {
  if (firestoreDb) return firestoreDb;

  const app = getFirebaseApp();
  if (!app) return null;

  try {
    const config = getActiveFirebaseConfig();
    const dbId = config.firestoreDatabaseId?.trim();
    if (dbId && dbId !== '' && dbId !== '(default)') {
      firestoreDb = getFirestore(app, dbId);
    } else {
      firestoreDb = getFirestore(app);
    }
    connectionInitialized = true;
    return firestoreDb;
  } catch (err) {
    console.warn('Failed with databaseId, attempting default database:', err);
    try {
      firestoreDb = getFirestore(app);
      connectionInitialized = true;
      return firestoreDb;
    } catch (fallbackErr) {
      console.error('Failed to get Firestore instance:', fallbackErr);
      return null;
    }
  }
}

export function getFirebaseStorage(): FirebaseStorage | null {
  if (firebaseStorage) return firebaseStorage;

  const app = getFirebaseApp();
  if (!app) return null;

  try {
    const config = getActiveFirebaseConfig();
    const bucket = config.storageBucket || 'maryam-resort.firebasestorage.app';
    const formattedBucket = bucket.startsWith('gs://') ? bucket : `gs://${bucket}`;
    firebaseStorage = getStorage(app, formattedBucket);
    return firebaseStorage;
  } catch (err) {
    console.warn('Failed to initialize storage with explicit bucket, attempting default storage:', err);
    try {
      firebaseStorage = getStorage(app);
      return firebaseStorage;
    } catch (fallbackErr) {
      console.error('Failed to get Firebase Storage instance:', fallbackErr);
      return null;
    }
  }
}

export function isFirebaseConfigured(): boolean {
  const config = getActiveFirebaseConfig();
  return Boolean(config.apiKey && config.projectId);
}

// Resort document identifier (can be changed for multi-tenant SaaS)
export const RESORT_ID = 'maryam_resort';

// -------------------------------------------------------------
// Real-time Subscriptions & Cloud Persistence
// -------------------------------------------------------------

/**
 * Real-time listener for Bookings collection.
 * Triggers callback immediately when bookings change in the cloud on any device.
 */
export function subscribeToCloudBookings(
  callback: (bookings: Record<string, BookingRecord>) => void,
  onError?: (err: unknown) => void
): () => void {
  const db = getFirestoreDb();
  if (!db) {
    return () => {};
  }

  try {
    const bookingsCol = collection(db, 'bookings');
    const unsubscribe = onSnapshot(
      bookingsCol,
      (snapshot) => {
        const bookingsMap: Record<string, BookingRecord> = {};
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as BookingRecord;
          const key = docSnap.id; // Usually in format "YYYY-MM-DD_shift"
          bookingsMap[key] = {
            ...data,
            id: data.id || docSnap.id,
          };
        });
        callback(bookingsMap);
      },
      (error) => {
        console.error('Error listening to cloud bookings:', error);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.error('Failed to subscribe to cloud bookings:', err);
    return () => {};
  }
}

/**
 * Save or update a single booking in Firestore
 */
export async function saveBookingToCloud(shiftKey: string, booking: BookingRecord): Promise<void> {
  const db = getFirestoreDb();
  if (!db) return;

  try {
    const bookingDoc = doc(db, 'bookings', shiftKey);
    await setDoc(bookingDoc, {
      ...booking,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error(`Failed to save booking ${shiftKey} to cloud:`, err);
    throw err;
  }
}

/**
 * Delete a booking from Firestore (frees the slot back to available/green for everyone)
 */
export async function deleteBookingFromCloud(shiftKey: string): Promise<void> {
  const db = getFirestoreDb();
  if (!db) return;

  try {
    const bookingDoc = doc(db, 'bookings', shiftKey);
    await deleteDoc(bookingDoc);
  } catch (err) {
    console.error(`Failed to delete booking ${shiftKey} from cloud:`, err);
    throw err;
  }
}

/**
 * Clear all bookings from Firestore (admin reset)
 */
export async function clearAllBookingsFromCloud(): Promise<void> {
  const db = getFirestoreDb();
  if (!db) return;

  try {
    const bookingsCol = collection(db, 'bookings');
    const snapshot = await getDocs(bookingsCol);
    const batch = writeBatch(db);
    snapshot.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    await batch.commit();
  } catch (err) {
    console.error('Failed to clear all bookings from cloud:', err);
    throw err;
  }
}

/**
 * Real-time listener for Resort Configuration, Pricing, and Showcase Images
 */
export function subscribeToResortCloudData(
  onData: (data: {
    config?: ChaletConfig;
    pricing?: PricingConfig;
    images?: ResortImagesConfig;
  }) => void,
  onError?: (err: unknown) => void
): () => void {
  const db = getFirestoreDb();
  if (!db) return () => {};

  const unsubscribers: Array<() => void> = [];

  try {
    let mergedImages: ResortImagesConfig = {
      heroBanner: '',
      swimmingPool: '',
      animalSanctuary: '',
      kidsPlayground: '',
      sportsRecreation: '',
      outdoorBbq: '',
      adultGames: '',
      masterBedrooms: '',
      villaExterior: '',
      nightPool: '',
    };

    // 1. Listen to main resort document for config and pricing
    const resortDocRef = doc(db, 'resorts', RESORT_ID);
    const unsubResort = onSnapshot(
      resortDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const raw = docSnap.data();
          if (raw.images && typeof raw.images === 'object') {
            mergedImages = {
              ...mergedImages,
              ...raw.images,
            };
          }
          onData({
            config: raw.config as ChaletConfig | undefined,
            pricing: raw.pricing as PricingConfig | undefined,
            images: { ...mergedImages },
          });
        }
      },
      (err) => {
        console.warn('Error listening to resort cloud data:', err);
        if (onError) onError(err);
      }
    );
    unsubscribers.push(unsubResort);

    // 2. Listen to individual image documents for high-speed instant sync
    const imagesCol = collection(db, 'resort_images');
    const unsubImages = onSnapshot(
      imagesCol,
      (snapshot) => {
        if (!snapshot.empty) {
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (data && typeof data.url === 'string') {
              mergedImages[docSnap.id as keyof ResortImagesConfig] = data.url;
            }
          });
          onData({
            images: { ...mergedImages },
          });
        }
      },
      (err) => {
        console.warn('Error listening to resort_images:', err);
      }
    );
    unsubscribers.push(unsubImages);

    return () => {
      unsubscribers.forEach((fn) => fn());
    };
  } catch (err) {
    console.error('Failed to subscribe to resort cloud data:', err);
    return () => {};
  }
}

/**
 * Save Chalet Configuration (WhatsApp, hours, PIN, maps URL) to Firestore
 */
export async function saveChaletConfigToCloud(config: ChaletConfig): Promise<void> {
  const db = getFirestoreDb();
  if (!db) return;

  try {
    const resortDocRef = doc(db, 'resorts', RESORT_ID);
    await setDoc(
      resortDocRef,
      {
        config,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error('Failed to save config to cloud:', err);
    throw err;
  }
}

/**
 * Save Pricing Configuration (IQD prices) to Firestore
 */
export async function savePricingConfigToCloud(pricing: PricingConfig): Promise<void> {
  const db = getFirestoreDb();
  if (!db) return;

  try {
    const resortDocRef = doc(db, 'resorts', RESORT_ID);
    await setDoc(
      resortDocRef,
      {
        pricing,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error('Failed to save pricing to cloud:', err);
    throw err;
  }
}

/**
 * Save a single image to cloud with dedicated document ID to prevent 1MB document quota overflow
 */
export async function saveSingleImageToCloud(key: string, url: string): Promise<void> {
  const db = getFirestoreDb();
  if (!db) return;

  try {
    // 1. Save in resort_images collection
    const imgDoc = doc(db, 'resort_images', key);
    await setDoc(imgDoc, {
      url,
      updatedAt: new Date().toISOString(),
    });

    // 2. Also keep main resort document in sync
    const resortDocRef = doc(db, 'resorts', RESORT_ID);
    await setDoc(
      resortDocRef,
      {
        images: {
          [key]: url,
        },
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error(`Failed to save single image ${key} to cloud:`, err);
    throw err;
  }
}

/**
 * Upload actual binary image File directly to free ImgBB API (No credit card required).
 * Retrieves the direct permanent HTTPS URL (https://i.ibb.co/...) and saves it into Firestore.
 */
export async function uploadResortImageFile(
  key: keyof ResortImagesConfig | string,
  file: File,
  customImgBBApiKey?: string
): Promise<string> {
  if (!file || !file.type.startsWith('image/')) {
    throw new Error('الملف المحدد ليس صورة صالحة. يرجى اختيار ملف JPG أو PNG أو WEBP.');
  }

  // 1. Upload directly via free ImgBB API
  const directImageUrl = await uploadImageToImgBB(file, customImgBBApiKey);

  // 2. Instantly record the persistent HTTPS download URL in Firestore
  await saveSingleImageToCloud(String(key), directImageUrl);

  return directImageUrl;
}

/**
 * Delete an image reference from Firestore
 */
export async function deleteResortImage(key: keyof ResortImagesConfig | string): Promise<void> {
  const db = getFirestoreDb();
  if (!db) return;

  try {
    const imgDoc = doc(db, 'resort_images', String(key));
    await deleteDoc(imgDoc);

    const resortDocRef = doc(db, 'resorts', RESORT_ID);
    await setDoc(
      resortDocRef,
      {
        images: {
          [String(key)]: '',
        },
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn(`Error deleting image ${String(key)}:`, err);
  }
}

/**
 * Save Images Configuration (hero + gallery) to Firestore
 */
export async function saveImagesConfigToCloud(images: ResortImagesConfig): Promise<void> {
  const db = getFirestoreDb();
  if (!db) return;

  try {
    // 1. Save each image individually in resort_images collection
    const promises = Object.entries(images).map(([key, url]) => {
      if (url) {
        return saveSingleImageToCloud(key, url);
      }
      return Promise.resolve();
    });
    await Promise.all(promises);

    // 2. Also save in main resort document
    const resortDocRef = doc(db, 'resorts', RESORT_ID);
    await setDoc(
      resortDocRef,
      {
        images,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error('Failed to save images to cloud:', err);
    throw err;
  }
}
