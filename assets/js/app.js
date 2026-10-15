import { getAllTransactions } from './db.js';

document.addEventListener('DOMContentLoaded', () => {
    initUIControls();
    loadDashboardData();
});

function initUIControls() {
    const btnToggleMenu = document.getElementById('btnToggleMenu');
    const btnToggleOption = document.getElementById('btnToggleOption');
    const drawerMenu = document.getElementById('drawerMenu');
    const optionMenuPopup = document.getElementById('optionMenuPopup');
    const drawerOverlay = document.getElementById('drawerOverlay');

    // Sidebar Drawer (Garis 3)
    function openMenu() {
        closeOption();
        drawerMenu?.classList.add('active');
        drawerOverlay?.classList.add('active');
        document.body.classList.add('no-scroll');
    }

    function closeMenu() {
        drawerMenu?.classList.remove('active');
        drawerOverlay?.classList.remove('active');
        document.body.classList.remove('no-scroll');
    }

    // Option Menu Popup (Titik 3)
    function toggleOption(e) {
        e.stopPropagation();
        closeMenu();
        const isActive = optionMenuPopup?.classList.contains('active');
        if (isActive) {
            closeOption();
        } else {
            optionMenuPopup?.classList.add('active');
            drawerOverlay?.classList.add('active');
        }
    }

    function closeOption() {
        optionMenuPopup?.classList.remove('active');
        if (!drawerMenu?.classList.contains('active')) {
            drawerOverlay?.classList.remove('active');
        }
    }

    // Event Listeners
    btnToggleMenu?.addEventListener('click', openMenu);
    btnToggleOption?.addEventListener('click', toggleOption);

    drawerOverlay?.addEventListener('click', () => {
        closeMenu();
        closeOption();
    });
}

// Memuat data dashboard dari Firestore
async function loadDashboardData() {
    try {
        const response = await getAllTransactions();
        if (!response.success) return;

        const transactions = response.data;
        let totalPenerimaan = 0;
        let totalPengeluaran = 0;

        transactions.forEach(tx => {
            const nominal = Number(tx.nominal) || 0;
            if (tx.jenis === 'Penerimaan Kas') {
                totalPenerimaan += nominal;
            } else if (tx.jenis === 'Pengeluaran Kas') {
                totalPengeluaran += nominal;
            }
        });

        const arusKasBersih = totalPenerimaan - totalPengeluaran;

        updateTextContent('.grid-value.green', totalPenerimaan.toLocaleString('id-ID'));
        updateTextContent('.grid-value.red', totalPengeluaran.toLocaleString('id-ID'));
        updateTextContent('.grid-value.orange', arusKasBersih.toLocaleString('id-ID'));
    } catch (err) {
        console.warn("Firestore belum siap atau belum dikonfigurasi sepenuhnya:", err);
    }
}

function updateTextContent(selector, value) {
    const el = document.querySelector(selector);
    if (el) el.textContent = value;
}