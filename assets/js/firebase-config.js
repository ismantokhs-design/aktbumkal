// Import fungsi yang dibutuhkan dari SDK Firebase Web (v10+ CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Konfigurasi Firebase Web App Anda
const firebaseConfig = {
  apiKey: "AIzaSyAcMaRsKZ2plzQQvwoLDXHPsteVrHJjR1Y",
  authDomain: "aktbumkal.firebaseapp.com",
  projectId: "aktbumkal",
  storageBucket: "aktbumkal.firebasestorage.app",
  messagingSenderId: "123464282645",
  appId: "1:123464282645:web:f766e920ccb88c1ed0141c",
  measurementId: "G-2YRZZNWW3Z"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

// Ekspor instance agar bisa digunakan di file JS lain
export { app, analytics, db, auth };