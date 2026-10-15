import { db } from './firebase-config.js';
import { 
    collection, 
    addDoc, 
    getDocs, 
    getDoc, 
    doc, 
    updateDoc, 
    deleteDoc, 
    query, 
    orderBy, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Nama Koleksi Firestore
const TRANSACTIONS_COLLECTION = 'transactions';
const ACCOUNTS_COLLECTION = 'accounts';

// ==========================================
// 1. OPERASI TRANSAKSI
// ==========================================

/**
 * Menambah data transaksi baru
 * @param {Object} data - Detail transaksi (misal: jenis, nominal, keterangan, tanggal)
 */
export async function addTransaction(data) {
    try {
        const docRef = await addDoc(collection(db, TRANSACTIONS_COLLECTION), {
            ...data,
            createdAt: serverTimestamp()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Gagal menambah transaksi: ", error);
        return { success: false, error };
    }
}

/**
 * Mengambil semua data transaksi, diurutkan dari yang terbaru
 */
export async function getAllTransactions() {
    try {
        const q = query(collection(db, TRANSACTIONS_COLLECTION), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const transactions = [];
        querySnapshot.forEach((doc) => {
            transactions.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, data: transactions };
    } catch (error) {
        console.error("Gagal mengambil transaksi: ", error);
        return { success: false, error };
    }
}

/**
 * Mengubah/memperbarui data transaksi berdasarkan ID
 * @param {string} id - Document ID transaksi
 * @param {Object} updatedData - Data baru yang ingin diperbarui
 */
export async function updateTransaction(id, updatedData) {
    try {
        const docRef = doc(db, TRANSACTIONS_COLLECTION, id);
        await updateDoc(docRef, {
            ...updatedData,
            updatedAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error("Gagal memperbarui transaksi: ", error);
        return { success: false, error };
    }
}

/**
 * Menghapus data transaksi berdasarkan ID
 * @param {string} id - Document ID transaksi
 */
export async function deleteTransaction(id) {
    try {
        const docRef = doc(db, TRANSACTIONS_COLLECTION, id);
        await deleteDoc(docRef);
        return { success: true };
    } catch (error) {
        console.error("Gagal menghapus transaksi: ", error);
        return { success: false, error };
    }
}

// ==========================================
// 2. OPERASI AKUN / PERKIRAAN & SALDO
// ==========================================

/**
 * Mengambil daftar akun/perkiraan
 */
export async function getAllAccounts() {
    try {
        const querySnapshot = await getDocs(collection(db, ACCOUNTS_COLLECTION));
        const accounts = [];
        querySnapshot.forEach((doc) => {
            accounts.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, data: accounts };
    } catch (error) {
        console.error("Gagal mengambil daftar akun: ", error);
        return { success: false, error };
    }
}