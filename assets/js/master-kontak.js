import { db } from './firebase-config.js';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const kontakListContainer = document.getElementById('kontakListContainer');
const totalCountDisplay = document.getElementById('totalCountDisplay');
const searchKontak = document.getElementById('searchKontak');

const kontakModal = document.getElementById('kontakModal');
const modalBox = document.getElementById('modalBox');
const modalHeader = document.getElementById('modalHeader');
const modalTitleText = document.getElementById('modalTitleText');
const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const btnBatal = document.getElementById('btnBatal');
const btnSimpan = document.getElementById('btnSimpan');

const kontakType = document.getElementById('kontakType');
const kontakPhone = document.getElementById('kontakPhone');
const kontakName = document.getElementById('kontakName');
const kontakCompany = document.getElementById('kontakCompany');
const kontakAddress = document.getElementById('kontakAddress');
const kontakPhoto = document.getElementById('kontakPhoto');
const previewImg = document.getElementById('previewImg');

let rawKontakData = [];
let compressedPhotoBase64 = '';
let editingKontakId = null;

function resetFormInputs() {
    editingKontakId = null;
    modalTitleText.textContent = 'TAMBAH KONTAK BARU';
    kontakType.value = '';
    kontakPhone.value = '';
    kontakName.value = '';
    kontakCompany.value = '';
    kontakAddress.value = '';
    kontakPhoto.value = '';
    compressedPhotoBase64 = '';
    previewImg.style.display = 'none';
}

// ==========================================
// 1. FITUR DRAGGABLE TOMBOL FAB (+)
// ==========================================
let isFabDragging = false;
let fabStartX, fabStartY, fabHasMoved = false;
let fabPosX = 0, fabPosY = 0;

if (openModalBtn) {
    openModalBtn.addEventListener('pointerdown', (e) => {
        isFabDragging = true;
        fabHasMoved = false;
        fabStartX = e.clientX - fabPosX;
        fabStartY = e.clientY - fabPosY;
        openModalBtn.setPointerCapture(e.pointerId);
    });

    openModalBtn.addEventListener('pointermove', (e) => {
        if (!isFabDragging) return;
        const newX = e.clientX - fabStartX;
        const newY = e.clientY - fabStartY;
        if (Math.abs(newX - fabPosX) > 3 || Math.abs(newY - fabPosY) > 3) {
            fabHasMoved = true;
        }
        fabPosX = newX;
        fabPosY = newY;
        openModalBtn.style.transform = `translate(${fabPosX}px, ${fabPosY}px)`;
    });

    openModalBtn.addEventListener('pointerup', (e) => {
        isFabDragging = false;
        openModalBtn.releasePointerCapture(e.pointerId);
    });

    openModalBtn.addEventListener('click', () => {
        if (fabHasMoved) return;
        resetModalPosition();
        resetFormInputs();
        kontakModal.classList.add('active');
    });
}

// ==========================================
// 2. FITUR DRAGGABLE MODAL BOX
// ==========================================
let isModalDragging = false;
let modalStartX = 0, modalStartY = 0;
let modalInitialX = 0, modalInitialY = 0;

if (modalHeader) {
    modalHeader.addEventListener('mousedown', (e) => {
        if (e.target.closest('.close-modal')) return;
        isModalDragging = true;
        modalStartX = e.clientX;
        modalStartY = e.clientY;
        const style = window.getComputedStyle(modalBox);
        const matrix = new DOMMatrix(style.transform);
        modalInitialX = matrix.m41;
        modalInitialY = matrix.m42;
        modalHeader.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isModalDragging) return;
        e.preventDefault();
        const dx = e.clientX - modalStartX;
        const dy = e.clientY - modalStartY;
        modalBox.style.transform = `translate(${modalInitialX + dx}px, ${modalInitialY + dy}px)`;
    });

    document.addEventListener('mouseup', () => {
        isModalDragging = false;
        modalHeader.style.cursor = 'move';
    });
}

function resetModalPosition() {
    modalInitialX = 0;
    modalInitialY = 0;
    modalBox.style.transform = 'translate(0px, 0px)';
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && kontakModal.classList.contains('active')) {
        kontakModal.classList.remove('active');
    }
});

// Kompresi Foto Maksimal 350px
if (kontakPhoto) {
    kontakPhoto.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const maxDim = 350;

                if (width > height) {
                    if (width > maxDim) {
                        height = Math.round((height * maxDim) / width);
                        width = maxDim;
                    }
                } else {
                    if (height > maxDim) {
                        width = Math.round((width * maxDim) / height);
                        height = maxDim;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                compressedPhotoBase64 = canvas.toDataURL('image/jpeg', 0.8);
                previewImg.src = compressedPhotoBase64;
                previewImg.style.display = 'block';
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
}

if (btnBatal) {
    btnBatal.addEventListener('click', () => {
        resetFormInputs();
        kontakModal.classList.remove('active');
    });
}

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => kontakModal.classList.remove('active'));
}

if (kontakModal) {
    kontakModal.addEventListener('click', (e) => { if (e.target === kontakModal) kontakModal.classList.remove('active'); });
}

async function loadKontakData() {
    try {
        const querySnapshot = await getDocs(collection(db, 'contacts'));
        rawKontakData = [];
        querySnapshot.forEach(docSnap => {
            rawKontakData.push({ id: docSnap.id, ...docSnap.data() });
        });
        renderList(rawKontakData);
    } catch (err) {
        console.error("Gagal memuat kontak:", err);
        kontakListContainer.innerHTML = `<div class="empty-state">Gagal memuat data kontak dari database.</div>`;
    }
}

function renderList(dataArray) {
    kontakListContainer.innerHTML = '';
    if (dataArray.length === 0) {
        kontakListContainer.innerHTML = `<div class="empty-state">Belum ada data kontak terdaftar.</div>`;
        totalCountDisplay.textContent = `0 Kontak`;
        return;
    }

    dataArray.forEach(item => {
        const photoUrl = item.photo || 'https://via.placeholder.com/44?text=User';
        const companyText = item.company ? ` | ${item.company}` : '';
        const cleanPhone = item.phone ? item.phone.replace(/\D/g,'') : '';

        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
            <div class="item-card-top">
                <span>Tipe: ${item.type || '-'}</span>
                <span>${item.address ? item.address.substring(0, 25) + '...' : '-'}</span>
            </div>
            <div class="item-card-body">
                <img src="${photoUrl}" class="item-thumb" alt="Foto">
                <div class="item-info">
                    <span class="item-title">${item.name || 'Tanpa Nama'}</span>
                    <span class="item-subtitle">${item.phone || '-'}${companyText}</span>
                </div>
                <div class="item-action-buttons">
                    <a href="https://wa.me/${cleanPhone}" target="_blank" class="btn-action whatsapp" title="Hubungi WA">
                        <span class="material-icons" style="font-size:14px;">phone</span>
                    </a>
                    <button class="btn-action edit" onclick="window.editKontak('${item.id}')" title="Edit Kontak">
                        <span class="material-icons" style="font-size:14px;">edit</span>
                    </button>
                    <button class="btn-action delete" onclick="window.hapusKontak('${item.id}')" title="Hapus Kontak">
                        <span class="material-icons" style="font-size:14px;">delete</span>
                    </button>
                </div>
            </div>
        `;
        kontakListContainer.appendChild(card);
    });

    totalCountDisplay.textContent = `${dataArray.length} Kontak`;
}

window.editKontak = function(id) {
    const item = rawKontakData.find(k => k.id === id);
    if (!item) return;

    editingKontakId = item.id;
    modalTitleText.textContent = 'EDIT KONTAK';
    kontakType.value = item.type || '';
    kontakPhone.value = item.phone || '';
    kontakName.value = item.name || '';
    kontakCompany.value = item.company || '';
    kontakAddress.value = item.address || '';
    
    compressedPhotoBase64 = item.photo || '';
    if (compressedPhotoBase64) {
        previewImg.src = compressedPhotoBase64;
        previewImg.style.display = 'block';
    } else {
        previewImg.style.display = 'none';
    }

    resetModalPosition();
    kontakModal.classList.add('active');
};

window.hapusKontak = async function(id) {
    const result = await Swal.fire({
        title: 'Hapus Kontak?',
        text: "Data kontak yang dihapus tidak dapat dikembalikan!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
        try {
            await deleteDoc(doc(db, 'contacts', id));
            Swal.fire({
                icon: 'success',
                title: 'Terhapus',
                text: 'Kontak berhasil dihapus.',
                timer: 1000,
                showConfirmButton: false
            });
            loadKontakData();
        } catch (err) {
            console.error("Gagal menghapus kontak:", err);
            Swal.fire('Error', err.message, 'error');
        }
    }
};

if (btnSimpan) {
    btnSimpan.addEventListener('click', async () => {
        if (!kontakType.value) {
            Swal.fire('Peringatan', 'Silakan pilih Tipe Kontak terlebih dahulu.', 'warning');
            kontakType.focus();
            return;
        }

        if (!kontakName.value || !kontakPhone.value) {
            Swal.fire('Peringatan', 'Nama Kontak dan No. Telepon wajib diisi.', 'warning');
            return;
        }

        try {
            const kontakData = {
                type: kontakType.value,
                name: kontakName.value.trim(),
                phone: kontakPhone.value.trim(),
                company: kontakCompany.value.trim(),
                address: kontakAddress.value.trim(),
                photo: compressedPhotoBase64
            };

            if (editingKontakId) {
                await updateDoc(doc(db, 'contacts', editingKontakId), kontakData);
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    text: 'Perubahan kontak berhasil disimpan.',
                    timer: 1200,
                    showConfirmButton: false
                });
                kontakModal.classList.remove('active');
            } else {
                kontakData.createdAt = serverTimestamp();
                await addDoc(collection(db, 'contacts'), kontakData);
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    text: 'Kontak baru berhasil disimpan.',
                    timer: 1200,
                    showConfirmButton: false
                });
            }

            resetFormInputs();
            loadKontakData();

        } catch (err) {
            console.error("Gagal menyimpan kontak:", err);
            Swal.fire('Error', err.message, 'error');
        }
    });
}

if (searchKontak) {
    searchKontak.addEventListener('input', (e) => {
        const keyword = e.target.value.toLowerCase();
        const filtered = rawKontakData.filter(item => 
            (item.name && item.name.toLowerCase().includes(keyword)) ||
            (item.phone && item.phone.toLowerCase().includes(keyword)) ||
            (item.company && item.company.toLowerCase().includes(keyword))
        );
        renderList(filtered);
    });
}

loadKontakData();