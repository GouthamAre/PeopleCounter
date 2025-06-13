// Import Firebase core and services you plan to use
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase config object
const firebaseConfig = {
  apiKey: "AIzaSyCBjaEeOYD_YeQn5ItWB7VpuwWqPzsm7Wk",
  authDomain: "crowdcounterapp-87c3f.firebaseapp.com",
  projectId: "crowdcounterapp-87c3f",
  storageBucket: "crowdcounterapp-87c3f.appspot.com",
  messagingSenderId: "102057825757",
  appId: "1:102057825757:web:35a766951f54f8a6d31234"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
