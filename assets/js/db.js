import { db } from './firebase-config.js';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Simpan Log User
export async function simpanUser(user) {
  try {
    await addDoc(collection(db, "users_log"), {
      uid: user.uid,
      email: user.email,
      lastLogin: serverTimestamp()
    });
  } catch (e) {
    console.error("Gagal menyimpan log user: ", e);
  }
}

// Ambil Semua Data Pohon Pisang
export async function ambilSemuaPohon() {
  try {
    const q = query(collection(db, "pohon_pisang"), orderBy("tanggalTanam", "desc"));
    const querySnapshot = await getDocs(q);
    const data = [];
    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
    });
    return data;
  } catch (e) {
    console.error("Gagal mengambil data pohon: ", e);
    return [];
  }
}