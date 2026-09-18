import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getFirestore, Timestamp, FieldPath } from "firebase-admin/firestore";

function initAdmin() {
  if (getApps().length) return getApp();

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY environment variables"
    );
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      // Env files store the key with literal "\n" sequences — turn them back
      // into real newlines for the PEM to parse.
      privateKey: privateKey.replace(/\\n/g, "\n"),
    }),
  });
}

// Cache across dev-mode HMR reloads, mirroring the old global._mongoClientPromise pattern.
if (process.env.NODE_ENV === "development") {
  if (!global._firebaseApp) {
    global._firebaseApp = initAdmin();
  }
} else {
  initAdmin();
}

export function getDb() {
  return getFirestore();
}

// Re-exported so callers don't need to import "firebase-admin/firestore" themselves.
export const admin = { firestore: { Timestamp, FieldPath } };
