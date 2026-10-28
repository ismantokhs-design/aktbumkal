import { db } from './firebase-config.js';
import { collection, getDocs, getDoc, query, where, orderBy, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');
const btnFilter = document.getElementById('btnFilter');
const sumTotalQty = document.getElementById('sumTotalQty');
const sumTotalPv = document.getElementById('sumTotalPv');
const sumTotalOmset = document.getElementById('sumTotalOmset');
const transactionListContainer = document.getElementById('transactionListContainer');

let allSalesData = [];
const fmt = (n) => (n || 0).toLocaleString('id-ID');

function setDefaultDates() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    if (startDateInput) startDateInput.value = `${y}-${m}-01`;
    if (endDateInput) endDateInput.value = `${y}-${m}-${d}`;
}

async function loadSalesData() {
    try {
        Swal.fire({ title: 'Memuat...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        const q = query(collection(db, 'sales'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        allSalesData = [];
        snap.forEach(doc => allSalesData.push({ id: doc.id, ...doc.data() }));
        Swal.close();
        filterAndRenderSales();
    } catch (err) {
        console.error(err);
        Swal.fire('Error', 'Gagal memuat data.', 'error');
    }
}

function filterAndRenderSales() {
    if (!startDateInput || !endDateInput) return;
    const start = startDateInput.value;
    const end = endDateInput.value;
    const filtered = allSalesData.filter(item => {
        if (!item.date) return false;
        if (start && item.date < start) return false;
        if (end && item.date > end) return false;
        return true;
    });
    renderSalesList(filtered);
}

function renderSalesList(dataArray) {
    if (!transactionListContainer) return;
    transactionListContainer.innerHTML = '';
    let qSum = 0, pSum = 0, oSum = 0;

    if (dataArray.length === 0) {
        transactionListContainer.innerHTML = '<div class="empty-state">Tidak ada transaksi.</div>';
        if (sumTotalQty) sumTotalQty.textContent = '0';
        if (sumTotalPv) sumTotalPv.textContent = '0';
        if (sumTotalOmset) sumTotalOmset.textContent = 'Rp 0';
        return;
    }

    dataArray.forEach((trx, idx) => {
        qSum += (trx.totalQty || 0);
        pSum += (trx.totalPv || 0);
        oSum += (trx.totalPrice || 0);

        let itemsHTML = '';
        if (trx.items && Array.isArray(trx.items)) {
            trx.items.forEach(it => {
                const sub = (it.price || 0) * (it.qty || 0);
                itemsHTML += '<div class="trx-item-row"><span>' + it.name + ' (x' + it.qty + ')</span><span>Rp ' + fmt(sub) + '</span></div>';
            });
        }

        const card = document.createElement('div');
        card.className = 'trx-card';
        card.innerHTML = 
            '<div class="trx-header">' +
                '<span class="trx-date">' + trx.date + '</span>' +
                '<span class="trx-badge">' + (trx.category || 'AGEN') + '</span>' +
            '</div>' +
            '<div class="trx-agent-info">' +
                (trx.agentName || '-') + ' <span class="trx-agent-sub">(' + (trx.agentId || '-') + ')</span>' +
            '</div>' +
            '<div class="trx-items-container">' + itemsHTML + '</div>' +
            '<div class="trx-footer">' +
                '<span>' + (trx.paymentMethod || 'Tunai') + '</span>' +
                '<span class="trx-total-price">Rp ' + fmt(trx.totalPrice) + '</span>' +
            '</div>' +
            '<div class="trx-action-row">' +
                '<button class="btn-action-sm print" onclick="cetakNota(' + idx + ')"><span class="material-icons" style="font-size:14px;">print</span> Cetak</button>' +
                '<button class="btn-action-sm whatsapp" onclick="kirimWA(' + idx + ')"><span class="material-icons" style="font-size:14px;">share</span> WA</button>' +
                '<button class="btn-action-sm delete" onclick="hapusTransaksi(\'' + trx.id + '\')" style="background:#fee2e2; border-color:#fca5a5; color:#991b1b;"><span class="material-icons" style="font-size:14px;">delete</span> Hapus</button>' +
            '</div>';
        transactionListContainer.appendChild(card);
    });

    window.currentFilteredSales = dataArray;
    if (sumTotalQty) sumTotalQty.textContent = fmt(qSum);
    if (sumTotalPv) sumTotalPv.textContent = fmt(pSum);
    if (sumTotalOmset) sumTotalOmset.textContent = 'Rp ' + fmt(oSum);
}

window.cetakNota = function(idx) {
    const trx = window.currentFilteredSales[idx];
    if (!trx) return;
    let itemsText = '';
    if (trx.items) {
        trx.items.forEach(it => {
            const sub = (it.price || 0) * (it.qty || 0);
            itemsText += '<tr><td>' + it.name + ' (x' + it.qty + ')</td><td style="text-align:right;">Rp ' + fmt(sub) + '</td></tr>';
        });
    }
    const w = window.open('', '_blank', 'width=400,height=600');
    w.document.write('<html><head><title>Nota</title><style>body{font-family:monospace;font-size:12px;padding:10px;}table{width:100%;border-collapse:collapse;margin:8px 0;}td{padding:3px 0;}</style></head><body><div style="text-align:center;"><b>NOTA PENJUALAN</b><br>' + trx.date + '</div><hr><b>Kepada:</b> ' + trx.agentName + '<br><b>Telp:</b> ' + trx.agentId + '<hr><table>' + itemsText + '</table><hr><b>Total: Rp ' + fmt(trx.totalPrice) + '</b><br><div style="text-align:center;margin-top:15px;">Terima Kasih</div></body></html>');
    w.document.close();
    setTimeout(() => { w.print(); w.close(); }, 500);
};

window.kirimWA = function(idx) {
    const trx = window.currentFilteredSales[idx];
    if (!trx) return;
    
    let phone = (trx.agentId || '').replace(/\D/g, '');
    if (phone.startsWith('0')) {
        phone = '62' + phone.slice(1);
    }

    let text = '*NOTA PENJUALAN*\nTanggal: ' + trx.date + '\nKepada: *' + trx.agentName + '*\n--------------------\n';
    if (trx.items) {
        trx.items.forEach(it => {
            text += '- ' + it.name + ' (x' + it.qty + ')\n';
        });
    }
    text += '--------------------\n*Total: Rp ' + fmt(trx.totalPrice) + '*\n\nTerima kasih!';
    
    window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(text), '_blank');
};

// Fungsi Hapus Transaksi & Jurnal Terkait
window.hapusTransaksi = async function(id) {
    const result = await Swal.fire({
        title: 'Hapus Transaksi?',
        text: "Data transaksi dan jurnal akuntansi terkait akan ikut terhapus!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
        try {
            Swal.fire({ title: 'Menghapus data...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

            // 1. Ambil data dokumen sales terlebih dahulu untuk mendapatkan nomor jurnal (journalNumber)
            const salesDocRef = doc(db, 'sales', id);
            const salesSnap = await getDoc(salesDocRef);

            let journalNumberToDel = null;
            if (salesSnap && salesSnap.exists()) {
                journalNumberToDel = salesSnap.data().journalNumber;
            } else {
                const foundTrx = allSalesData.find(item => item.id === id);
                if (foundTrx) journalNumberToDel = foundTrx.journalNumber;
            }

            // 2. Hapus dokumen di koleksi 'sales'
            await deleteDoc(salesDocRef);

            // 3. Cari dan hapus dokumen terkait di koleksi 'journals' berdasarkan journalNumber
            if (journalNumberToDel) {
                const journalQuery = query(collection(db, 'journals'), where('journalNumber', '==', journalNumberToDel));
                const journalSnap = await getDocs(journalQuery);
                
                const deletePromises = [];
                journalSnap.forEach(journalDoc => {
                    deletePromises.push(deleteDoc(doc(db, 'journals', journalDoc.id)));
                });
                await Promise.all(deletePromises);
            }

            Swal.fire({
                icon: 'success',
                title: 'Terhapus',
                text: 'Transaksi dan jurnal akuntansi berhasil dihapus.',
                timer: 1200,
                showConfirmButton: false
            });
            loadSalesData();
        } catch (err) {
            console.error("Gagal menghapus transaksi & jurnal:", err);
            Swal.fire('Error', err.message, 'error');
        }
    }
};

if (btnFilter) {
    btnFilter.addEventListener('click', filterAndRenderSales);
}

setDefaultDates();
loadSalesData();