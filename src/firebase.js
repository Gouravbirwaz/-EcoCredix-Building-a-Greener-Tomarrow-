// Import necessary Firebase modules
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getDatabase, ref, set, push } from 'firebase/database'; // Import push from 'firebase/database'
import { getStorage } from 'firebase/storage'; // Ensure you import getStorage for Firebase Storage

// Your Firebase configuration
const firebaseConfig = {
  //firebase configuration;
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const database = getDatabase(app);
const db = getFirestore(app);
const storage = getStorage(app);
const firestore = getFirestore(app);

// Export Firebase services and app for use in other files
export { app, auth, createUserWithEmailAndPassword, database, db, ref, set, push, storage, firestore };  // Export 'push' here
