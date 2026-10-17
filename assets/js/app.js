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
    function toggleMenu(e) {
        if (e) e.stopPropagation();
        closeOption(); // Tutup opsi titik 3 jika sedang terbuka
        
        const isActive = drawerMenu?.classList.contains('active');
        if (isActive) {
            closeMenu();
        } else {
            drawerMenu?.classList.add('active');
            drawerOverlay?.classList.add('active');
            document.body.classList.add('no-scroll');
        }
    }

    function openMenu() {
        closeOption(); 
        drawerMenu?.classList.add('active');
        drawerOverlay?.classList.add('active');
        document.body.classList.add('no-scroll');
    }

    function closeMenu() {
        drawerMenu?.classList.remove('active');
        if (!optionMenuPopup?.classList.contains('active')) {
            drawerOverlay?.classList.remove('active');
        }
        document.body.classList.remove('no-scroll');
    }

    // Option Menu Popup (Titik 3)
    function toggleOption(e) {
        if (e) e.stopPropagation();
        closeMenu(); // Tutup sidebar drawer jika sedang terbuka
        
        const isActive = optionMenuPopup?.classList.contains('active');
        if (isActive) {
            closeOption();
        } else {
            optionMenuPopup?.classList.add('active');
            drawerOverlay?.classList.add('active');
            document.body.classList.add('no-scroll');
        }
    }

    function closeOption() {
        optionMenuPopup?.classList.remove('active');
        if (!drawerMenu?.classList.contains('active')) {
            drawerOverlay?.classList.remove('active');
            document.body.classList.remove('no-scroll');
        }
    }

    // Event Listeners Utama
    btnToggleMenu?.addEventListener('click', toggleMenu);
    btnToggleOption?.addEventListener('click', toggleOption);

    drawerOverlay?.addEventListener('click', () => {
        closeMenu();
        closeOption();
    });

    // Otomatis menutup sidebar & membersihkan body scroll saat menu item diklik
    const menuItems = drawerMenu?.querySelectorAll('.menu-item');
    menuItems?.forEach(item => {
        item.addEventListener('click', () => {
            closeMenu();
            document.body.classList.remove('no-scroll');
        });
    });

    const optionItems = optionMenuPopup?.querySelectorAll('.option-item');
    optionItems?.forEach(item => {
        item.addEventListener('click', () => {
            closeOption();
            document.body.classList.remove('no-scroll');
        });
    });
}

// Memuat data dashboard
async function loadDashboardData() {
    try {
        if (typeof getAllTransactions !== 'function') return;
        const response = await getAllTransactions();
        if (!response || !response.success) return;

        const transactions = response.data || [];
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