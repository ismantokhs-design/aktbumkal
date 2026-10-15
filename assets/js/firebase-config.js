import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Konfigurasi Firebase Asli Proyek PisangKu
const firebaseConfig = {
  apiKey: "AIzaSyAnubNMPQ-io4O1AIRWzrlbugqV4RiG8ug",
  authDomain: "pisangku-fb8a8.firebaseapp.com",
  projectId: "pisangku-fb8a8",
  storageBucket: "pisangku-fb8a8.firebasestorage.app",
  messagingSenderId: "684481262098",
  appId: "1:684481262098:web:9d1b39bf751fff55db5ecb",
  measurementId: "G-25LV6WK6CR"
};

// Inisialisasi Firebase & Layanan
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);