const ACCOUNTS = [
  { role: 'master', username: 'master', password: 'master123', name: 'Akun Master' },
  { role: 'owner', username: 'pemilik', password: 'toko123', name: 'Pemilik Toko' },
  { role: 'customer', username: 'pelanggan', password: 'pelanggan123', name: 'Pelanggan' }
];

const ROLE_LABEL = {
  master: 'Akun Master',
  owner: 'Pemilik Toko',
  customer: 'Pelanggan'
};

const MENUS = {
  master: [
    ['dashboard', '🏠 Dashboard Master'],
    ['accounts', '👥 Kelola Akun'],
    ['transactions', '🧾 Semua Transaksi'],
    ['reports', '📈 Reporting Profesional'],
    ['activity', '📊 Aktivitas Sistem']
  ],
  owner: [
    ['dashboard', '🏪 Seller Center'],
    ['employees', '👥 Karyawan Toko'],
    ['pos', '🧾 Kasir / Scan Barcode'],
    ['products', '📦 Produk & Stok'],
    ['orders', '🚚 Kelola Pesanan'],
    ['history', '📚 Semua Transaksi'],
    ['reports', '📈 Laporan Penjualan']
  ],
  customer: [
    ['products', '🏬 Belanja'],
    ['wishlist', '❤️ Wishlist'],
    ['vouchers', '🎟️ Voucher'],
    ['cart', '🛒 Keranjang'],
    ['history', '📦 Pesanan Saya'],
    ['profile', '👤 Profil Saya']
  ]
};

let session = JSON.parse(localStorage.getItem('kasir_session') || 'null');
let activePage = 'dashboard';

function defaultData() {
  return {
    users: ACCOUNTS.map((a, i) => ({
      id: i + 1,
      name: a.name,
      username: a.username,
      password: a.password,
      role: a.role,
      phone: a.role === 'customer' ? '081234567890' : '-',
      address: a.role === 'customer' ? 'Jakarta' : '-',
      status: 'Aktif'
    })),
    employees: [],
    products: [
      { id: 1, sku: 'SKU-KOPI-001', barcode: '899000000001', name: 'Kopi Susu', category: 'Minuman', price: 15000, costPrice: 9000, stock: 30, minStock: 8, icon: '☕', imageData: '', status: 'Aktif', description: 'Kopi susu segar dengan rasa creamy.', weight: 250, condition: 'Baru' },
      { id: 2, sku: 'SKU-NASI-002', barcode: '899000000002', name: 'Nasi Goreng', category: 'Makanan', price: 22000, costPrice: 14000, stock: 18, minStock: 5, icon: '🍛', imageData: '', status: 'Aktif', description: 'Nasi goreng spesial untuk makan siang.', weight: 500, condition: 'Baru' },
      { id: 3, sku: 'SKU-ESTEH-003', barcode: '899000000003', name: 'Es Teh Manis', category: 'Minuman', price: 7000, costPrice: 3000, stock: 45, minStock: 10, icon: '🥤', imageData: '', status: 'Aktif', description: 'Es teh manis dingin dan segar.', weight: 250, condition: 'Baru' },
      { id: 4, sku: 'SKU-ROTI-004', barcode: '899000000004', name: 'Roti Bakar', category: 'Snack', price: 12000, costPrice: 7000, stock: 20, minStock: 6, icon: '🍞', imageData: '', status: 'Aktif', description: 'Roti bakar dengan topping manis.', weight: 200, condition: 'Baru' }
    ],
    transactions: [
      {
        id: 'TRX-001',
        customer: 'Pelanggan',
        customerUsername: 'pelanggan',
        items: [{ productId: 1, name: 'Kopi Susu', qty: 2, price: 15000 }],
        payment: 'Tunai',
        note: 'Contoh transaksi selesai',
        total: 30000,
        status: 'Selesai',
        date: '2026-05-24'
      },
      {
        id: 'TRX-002',
        customer: 'Pelanggan',
        customerUsername: 'pelanggan',
        items: [{ productId: 2, name: 'Nasi Goreng', qty: 1, price: 22000 }],
        payment: 'Transfer',
        note: 'Contoh transaksi diproses',
        total: 22000,
        status: 'Diproses',
        date: '2026-05-24'
      }
    ],
    activities: [
      'Master melihat semua akun',
      'Pemilik toko menambah produk',
      'Pelanggan melakukan checkout'
    ],
    cart: [],
    stockLog: [],
    wishlist: [],
    vouchers: [
      { code: 'HEMAT10', title: 'Diskon 10%', description: 'Potongan 10% maksimal Rp10.000', type: 'percent', value: 10, maxDiscount: 10000, minSpend: 30000, active: true },
      { code: 'GRATISONGKIR', title: 'Gratis Ongkir', description: 'Potongan ongkir/diskon Rp8.000', type: 'fixed', value: 8000, maxDiscount: 8000, minSpend: 25000, active: true },
      { code: 'NEWUSER', title: 'Voucher Pengguna Baru', description: 'Potongan Rp12.000 minimal belanja Rp50.000', type: 'fixed', value: 12000, maxDiscount: 12000, minSpend: 50000, active: true }
    ]
  };
}

function normalizeData(data) {
  const fresh = defaultData();
  data.users = data.users || fresh.users;
  data.employees = data.employees || fresh.employees;
  data.products = data.products || fresh.products;
  data.transactions = data.transactions || fresh.transactions;
  data.activities = data.activities || fresh.activities;
  data.cart = data.cart || [];
  data.stockLog = data.stockLog || [];
  data.wishlist = data.wishlist || [];
  data.vouchers = data.vouchers || fresh.vouchers;

  data.users = data.users.map(u => ({
    ...u,
    password: u.password || (ACCOUNTS.find(a => a.username === u.username && a.role === u.role)?.password || '123456'),
    phone: u.phone || '-',
    address: u.address || '-',
    status: u.status || 'Aktif'
  }));

  data.products = data.products.map((p, index) => ({
    category: p.category || 'Umum',
    icon: p.icon || '📦',
    status: p.status || 'Aktif',
    sku: p.sku || `SKU-${String(p.id || index + 1).padStart(3, '0')}`,
    barcode: p.barcode || `899${String(p.id || index + 1).padStart(9, '0')}`,
    costPrice: Number(p.costPrice || Math.round(Number(p.price || 0) * 0.6)),
    minStock: Number(p.minStock || 5),
    imageData: p.imageData || '',
    weight: Number(p.weight || 0),
    condition: p.condition || 'Baru',
    rating: p.rating || (4.6 + (index % 4) / 10).toFixed(1),
    sold: p.sold || Math.floor(12 + index * 7),
    description: p.description || `Produk ${p.name || 'toko'} berkualitas, cocok untuk kebutuhan pelanggan.`,
    ...p
  }));

  data.transactions = data.transactions.map(t => {
    const convertedItems = Array.isArray(t.items)
      ? t.items
      : String(t.items || '').split(',').filter(Boolean).map(name => ({ productId: null, name: name.trim(), qty: 1, price: t.total || 0 }));
    const total = convertedItems.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1), 0) || Number(t.total || 0);
    return {
      customerUsername: t.customerUsername || 'pelanggan',
      payment: t.payment || 'Tunai',
      note: t.note || '-',
      ...t,
      items: convertedItems,
      total
    };
  });

  return data;
}

function getData() {
  let data = JSON.parse(localStorage.getItem('kasir_data') || 'null');
  if (!data) data = defaultData();
  data = normalizeData(data);
  localStorage.setItem('kasir_data', JSON.stringify(data));
  return data;
}

function saveData(data) {
  localStorage.setItem('kasir_data', JSON.stringify(data));
}

function addActivity(message) {
  const data = getData();
  data.activities.unshift(`${new Date().toLocaleString('id-ID')} - ${message}`);
  saveData(data);
}

function rupiah(num) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(num || 0));
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}

function fillDemo(role) {
  const acc = ACCOUNTS.find(a => a.role === role);
  document.getElementById('role').value = acc.role;
  document.getElementById('username').value = acc.username;
  document.getElementById('password').value = acc.password;
}

function login(e) {
  e.preventDefault();
  const role = document.getElementById('role').value;
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const data = getData();
  let account = data.users.find(a => a.role === role && a.username === username && a.password === password);

  // Fallback: jika data lama di browser belum punya password, akun demo tetap bisa login.
  if (!account) {
    const demo = ACCOUNTS.find(a => a.role === role && a.username === username && a.password === password);
    if (demo) {
      account = data.users.find(a => a.role === role && a.username === username) || {
        id: Date.now(), name: demo.name, username: demo.username, password: demo.password, role: demo.role, phone: '-', address: '-', status: 'Aktif'
      };
      account.password = demo.password;
      if (!data.users.some(u => u.id === account.id)) data.users.push(account);
      saveData(data);
    }
  }

  if (!account) return showToast('Login gagal. Cek role, username, dan password.');
  if (account.status !== 'Aktif') return showToast('Akun sedang nonaktif. Hubungi akun master.');

  session = { role: account.role, username: account.username, name: account.name };
  localStorage.setItem('kasir_session', JSON.stringify(session));
  activePage = session.role === 'customer' ? 'products' : 'dashboard';
  addActivity(`${ROLE_LABEL[session.role]} login: ${session.username}`);
  showApp();
}

function logout() {
  if (session) addActivity(`${ROLE_LABEL[session.role]} logout: ${session.username}`);
  localStorage.removeItem('kasir_session');
  session = null;
  document.getElementById('appPage').classList.add('hidden');
  document.getElementById('loginPage').classList.remove('hidden');
}

function resetDemoData() {
  localStorage.setItem('kasir_data', JSON.stringify(defaultData()));
  showToast('Data demo berhasil direset.');
  renderPage();
}

function showApp() {
  document.getElementById('loginPage').classList.add('hidden');
  document.getElementById('appPage').classList.remove('hidden');
  document.getElementById('roleLabel').textContent = ROLE_LABEL[session.role];
  document.getElementById('userName').textContent = session.name;
  document.getElementById('userRole').textContent = ROLE_LABEL[session.role];
  renderMenu();
  renderPage();
}

function renderMenu() {
  const menu = document.getElementById('menu');
  menu.innerHTML = MENUS[session.role].map(([key, label]) =>
    `<button class="${activePage === key ? 'active' : ''}" onclick="goPage('${key}')">${label}</button>`
  ).join('');
}

function goPage(page) {
  activePage = page;
  renderMenu();
  renderPage();
}

function setTitle(title) {
  document.getElementById('pageTitle').textContent = title;
}

function renderPage() {
  if (!session) return;
  if (activePage === 'dashboard') return renderDashboard();
  if (activePage === 'employees') return renderEmployees();
  if (activePage === 'pos') return renderOwnerPOS();
  if (activePage === 'accounts') return renderAccounts();
  if (activePage === 'transactions') return renderTransactions();
  if (activePage === 'activity') return renderActivity();
  if (activePage === 'products') return session.role === 'owner' ? renderOwnerProducts() : renderCustomerProducts();
  if (activePage === 'orders') return renderOrders();
  if (activePage === 'cart') return renderCart();
  if (activePage === 'wishlist') return renderWishlist();
  if (activePage === 'vouchers') return renderVouchers();
  if (activePage === 'history') return renderHistory();
  if (activePage === 'reports') return renderReports();
  if (activePage === 'profile') return renderProfile();
}

function renderDashboard() {
  const data = getData();
  const sales = data.transactions.reduce((sum, trx) => sum + trx.total, 0);
  const pending = data.transactions.filter(t => t.status !== 'Selesai').length;
  const ownerEmployeeCount = (data.employees || []).length;
  const ownerActiveEmployeeCount = (data.employees || []).filter(e => e.status === 'Aktif').length;
  const firstKpiTitle = session.role === 'master' ? 'Total Akun Sistem' : 'Total Karyawan';
  const firstKpiValue = session.role === 'master' ? data.users.length : ownerEmployeeCount;
  const firstKpiNote = session.role === 'master' ? 'Semua role login' : (ownerEmployeeCount ? `${ownerActiveEmployeeCount} karyawan aktif` : 'Belum ada karyawan terdaftar');
  setTitle(session.role === 'master' ? 'Dashboard Akun Master' : 'Dashboard Pemilik Toko');
  document.getElementById('mainContent').innerHTML = `
    <div class="grid cols-3">
      <div class="card stat"><h3>${firstKpiTitle}</h3><strong>${firstKpiValue}</strong><span>${firstKpiNote}</span></div>
      <div class="card stat"><h3>Total Produk</h3><strong>${data.products.length}</strong></div>
      <div class="card stat"><h3>Total Penjualan</h3><strong>${rupiah(sales)}</strong></div>
    </div>
    <div class="grid cols-3" style="margin-top:18px">
      <div class="card stat"><h3>Transaksi</h3><strong>${data.transactions.length}</strong></div>
      <div class="card stat"><h3>Pesanan Aktif</h3><strong>${pending}</strong></div>
      <div class="card stat"><h3>Stok Total</h3><strong>${data.products.reduce((s, p) => s + Number(p.stock || 0), 0)}</strong></div>
    </div>
    <div class="card" style="margin-top:18px">
      <h3>Hak Akses ${ROLE_LABEL[session.role]}</h3>
      <p>${session.role === 'master'
        ? 'Akun master mengontrol akun, status akun, semua transaksi, status transaksi, dan semua aktivitas sistem.'
        : 'Pemilik toko mengontrol produk, stok, harga, kategori, pesanan masuk, riwayat transaksi toko, serta melihat total karyawan toko/ruko.'}</p>
    </div>
    <div class="grid cols-2" style="margin-top:18px">
      <div class="card"><h3>Produk Terbaru</h3>${productMiniList(data.products)}</div>
      <div class="card"><h3>Transaksi Terbaru</h3>${transactionMiniList(data.transactions)}</div>
    </div>`;
}

function renderAccounts() {
  const data = getData();
  setTitle('Kelola Semua Akun');
  document.getElementById('mainContent').innerHTML = `
    <div class="card">
      <h3>Tambah Akun Baru</h3>
      <div class="form-row five">
        <div><label>Nama</label><input id="newName" placeholder="Nama akun"></div>
        <div><label>Username</label><input id="newUsername" placeholder="username"></div>
        <div><label>Password</label><input id="newPassword" placeholder="password"></div>
        <div><label>Role</label><select id="newRole"><option value="owner">Pemilik Toko</option><option value="customer">Pelanggan</option><option value="master">Akun Master</option></select></div>
        <button class="btn primary" onclick="addUser()">Tambah</button>
      </div>
    </div>
    <div class="card" style="margin-top:18px">
      <h3>Daftar Akun</h3>
      <div class="table-wrap"><table>
        <thead><tr><th>Nama</th><th>Username</th><th>Password</th><th>Role</th><th>Status</th><th>Aksi</th></tr></thead>
        <tbody>${data.users.map(u => `
          <tr>
            <td>${u.name}</td><td>${u.username}</td><td>${u.password}</td><td><span class="badge">${ROLE_LABEL[u.role]}</span></td>
            <td><span class="badge ${u.status === 'Aktif' ? 'green' : 'red'}">${u.status}</span></td>
            <td class="actions compact">
              <button class="btn secondary" onclick="editUser(${u.id})">Edit</button>
              <button class="btn ghost" onclick="toggleUser(${u.id})">${u.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}</button>
              <button class="btn danger" onclick="deleteUser(${u.id})">Hapus</button>
            </td>
          </tr>`).join('')}</tbody>
      </table></div>
    </div>`;
}

function addUser() {
  const data = getData();
  const name = document.getElementById('newName').value.trim();
  const username = document.getElementById('newUsername').value.trim();
  const password = document.getElementById('newPassword').value.trim();
  const role = document.getElementById('newRole').value;
  if (!name || !username || !password) return showToast('Nama, username, dan password wajib diisi.');
  if (data.users.some(u => u.username === username)) return showToast('Username sudah dipakai.');
  data.users.push({ id: Date.now(), name, username, password, role, phone: '-', address: '-', status: 'Aktif' });
  data.activities.unshift(`Master menambah akun ${username} sebagai ${ROLE_LABEL[role]}`);
  saveData(data);
  showToast('Akun berhasil ditambahkan.');
  renderAccounts();
}

function editUser(id) {
  const data = getData();
  const user = data.users.find(u => u.id === id);
  const name = prompt('Edit nama akun:', user.name);
  if (name === null) return;
  const username = prompt('Edit username:', user.username);
  if (username === null) return;
  const password = prompt('Edit password:', user.password);
  if (password === null) return;
  const phone = prompt('Edit no HP:', user.phone || '-');
  if (phone === null) return;
  const address = prompt('Edit alamat:', user.address || '-');
  if (address === null) return;
  if (!name.trim() || !username.trim() || !password.trim()) return showToast('Data akun tidak boleh kosong.');
  if (data.users.some(u => u.id !== id && u.username === username.trim())) return showToast('Username sudah dipakai.');
  Object.assign(user, { name: name.trim(), username: username.trim(), password: password.trim(), phone: phone.trim(), address: address.trim() });
  data.activities.unshift(`Master mengedit akun ${user.username}`);
  saveData(data);
  showToast('Akun berhasil diedit.');
  renderAccounts();
}

function toggleUser(id) {
  const data = getData();
  const user = data.users.find(u => u.id === id);
  user.status = user.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
  data.activities.unshift(`Master mengubah status akun ${user.username} menjadi ${user.status}`);
  saveData(data);
  renderAccounts();
}

function deleteUser(id) {
  const data = getData();
  const user = data.users.find(u => u.id === id);
  if (user.username === session.username) return showToast('Akun yang sedang login tidak bisa dihapus.');
  if (!confirm(`Hapus akun ${user.username}?`)) return;
  data.users = data.users.filter(u => u.id !== id);
  data.activities.unshift(`Master menghapus akun ${user.username}`);
  saveData(data);
  renderAccounts();
}

function renderTransactions() {
  const data = getData();
  setTitle('Semua Transaksi');
  document.getElementById('mainContent').innerHTML = transactionTable(data.transactions, 'master');
}

function renderActivity() {
  const data = getData();
  setTitle('Log Aktivitas Sistem');
  document.getElementById('mainContent').innerHTML = `
    <div class="card">
      <h3>Aktivitas Terbaru</h3>
      ${data.activities.map(a => `<div class="cart-item"><span>${a}</span><span class="badge">Log</span></div>`).join('')}
    </div>`;
}



function renderEmployees() {
  const data = getData();
  setTitle('Pengaturan Karyawan Toko');
  const employees = data.employees || [];
  const active = employees.filter(e => e.status === 'Aktif').length;
  const payroll = employees.reduce((sum, e) => sum + Number(e.salary || 0), 0);
  document.getElementById('mainContent').innerHTML = `
    <div class="seller-hero card">
      <div>
        <p class="eyebrow">EMPLOYEE MANAGEMENT</p>
        <h2>Daftar Karyawan Toko / Ruko</h2>
        <p class="muted">Data karyawan dimulai dari 0. Pemilik toko bisa mendaftarkan kasir, admin gudang, kurir, supervisor, dan staff lain.</p>
      </div>
      <div class="report-actions">
        <button class="btn primary" onclick="openEmployeeModal()">+ Daftar Karyawan</button>
        <button class="btn secondary" onclick="exportEmployeesCSV()">Export CSV</button>
      </div>
    </div>

    <div class="grid cols-4 report-kpis">
      <div class="card stat pro"><h3>Total Karyawan</h3><strong>${employees.length}</strong><span>Terdaftar oleh pemilik</span></div>
      <div class="card stat pro"><h3>Karyawan Aktif</h3><strong>${active}</strong><span>Siap bertugas</span></div>
      <div class="card stat pro"><h3>Nonaktif</h3><strong>${employees.length - active}</strong><span>Cuti / keluar</span></div>
      <div class="card stat pro"><h3>Estimasi Gaji</h3><strong>${rupiah(payroll)}</strong><span>Total gaji bulanan</span></div>
    </div>

    <div class="card owner-filter no-print">
      <div class="search-box"><span>🔎</span><input id="employeeKeyword" placeholder="Cari nama, jabatan, nomor HP..." oninput="renderEmployeesFiltered()"></div>
      <select id="employeeStatus" onchange="renderEmployeesFiltered()"><option>Semua</option><option>Aktif</option><option>Nonaktif</option></select>
      <select id="employeePosition" onchange="renderEmployeesFiltered()"><option>Semua Jabatan</option>${[...new Set(employees.map(e => e.position).filter(Boolean))].map(pos => `<option>${pos}</option>`).join('')}</select>
      <button class="btn ghost" onclick="renderEmployeesFiltered()">Filter</button>
    </div>

    <div class="card" style="margin-top:18px">
      <div class="card-title-row"><h3>Daftar Karyawan</h3><span class="badge">${employees.length} data</span></div>
      <div id="employeeTableWrap">${employeeTable(employees)}</div>
    </div>`;
}

function renderEmployeesFiltered() {
  const data = getData();
  const keyword = (document.getElementById('employeeKeyword')?.value || '').toLowerCase().trim();
  const status = document.getElementById('employeeStatus')?.value || 'Semua';
  const position = document.getElementById('employeePosition')?.value || 'Semua Jabatan';
  const rows = (data.employees || []).filter(e => {
    const text = `${e.name} ${e.position} ${e.phone} ${e.email || ''} ${e.address || ''}`.toLowerCase();
    return (!keyword || text.includes(keyword))
      && (status === 'Semua' || e.status === status)
      && (position === 'Semua Jabatan' || e.position === position);
  });
  document.getElementById('employeeTableWrap').innerHTML = employeeTable(rows);
}

function employeeTable(rows) {
  if (!rows.length) return `<div class="empty-state"><h3>Belum ada karyawan</h3><p class="muted">Klik tombol <strong>Daftar Karyawan</strong> untuk menambahkan data karyawan toko.</p></div>`;
  return `<div class="table-wrap"><table>
    <thead><tr><th>Nama</th><th>Jabatan</th><th>Kontak</th><th>Shift</th><th>Gaji</th><th>Status</th><th>Aksi</th></tr></thead>
    <tbody>${rows.map(e => `<tr>
      <td><strong>${e.name}</strong><br><small>${e.email || '-'}</small></td>
      <td>${e.position}</td>
      <td>${e.phone || '-'}<br><small>${e.address || '-'}</small></td>
      <td>${e.shift || '-'}</td>
      <td>${rupiah(e.salary || 0)}</td>
      <td><span class="badge ${e.status === 'Aktif' ? 'green' : 'red'}">${e.status}</span></td>
      <td class="actions compact">
        <button class="btn secondary" onclick="openEmployeeModal(${e.id})">Edit</button>
        <button class="btn ghost" onclick="toggleEmployee(${e.id})">${e.status === 'Aktif' ? 'Nonaktif' : 'Aktif'}</button>
        <button class="btn danger" onclick="deleteEmployee(${e.id})">Hapus</button>
      </td>
    </tr>`).join('')}</tbody>
  </table></div>`;
}

function openEmployeeModal(id = null) {
  const data = getData();
  const e = id ? data.employees.find(x => x.id === id) : { name: '', position: 'Kasir', phone: '', email: '', address: '', shift: 'Pagi', salary: 0, status: 'Aktif' };
  document.body.insertAdjacentHTML('beforeend', `
    <div class="modal-backdrop" onclick="closeEmployeeModal(event)">
      <div class="modal-card employee-modal" onclick="event.stopPropagation()">
        <button class="modal-close" onclick="closeEmployeeModal()">×</button>
        <p class="eyebrow">${id ? 'EDIT KARYAWAN' : 'DAFTAR KARYAWAN'}</p>
        <h2>${id ? 'Edit Data Karyawan' : 'Tambah Karyawan Toko'}</h2>
        <div class="editor-fields">
          <div><label>Nama Karyawan</label><input id="empName" value="${escapeHtml(e.name)}" placeholder="Nama lengkap"></div>
          <div><label>Jabatan</label><select id="empPosition"><option ${e.position === 'Kasir' ? 'selected' : ''}>Kasir</option><option ${e.position === 'Admin Gudang' ? 'selected' : ''}>Admin Gudang</option><option ${e.position === 'Kurir' ? 'selected' : ''}>Kurir</option><option ${e.position === 'Supervisor' ? 'selected' : ''}>Supervisor</option><option ${e.position === 'Staff Toko' ? 'selected' : ''}>Staff Toko</option></select></div>
          <div><label>No HP</label><input id="empPhone" value="${escapeHtml(e.phone)}" placeholder="08xxxxxxxxxx"></div>
          <div><label>Email</label><input id="empEmail" value="${escapeHtml(e.email || '')}" placeholder="email opsional"></div>
          <div><label>Shift</label><select id="empShift"><option ${e.shift === 'Pagi' ? 'selected' : ''}>Pagi</option><option ${e.shift === 'Siang' ? 'selected' : ''}>Siang</option><option ${e.shift === 'Malam' ? 'selected' : ''}>Malam</option><option ${e.shift === 'Full Day' ? 'selected' : ''}>Full Day</option></select></div>
          <div><label>Gaji Bulanan</label><input id="empSalary" type="number" value="${e.salary || 0}" placeholder="0"></div>
          <div><label>Status</label><select id="empStatus"><option ${e.status === 'Aktif' ? 'selected' : ''}>Aktif</option><option ${e.status === 'Nonaktif' ? 'selected' : ''}>Nonaktif</option></select></div>
          <div><label>Alamat</label><input id="empAddress" value="${escapeHtml(e.address || '')}" placeholder="Alamat karyawan"></div>
        </div>
        <div class="actions" style="justify-content:flex-end;margin-top:18px">
          <button class="btn ghost" onclick="closeEmployeeModal()">Batal</button>
          <button class="btn primary" onclick="saveEmployee(${id || 'null'})">Simpan</button>
        </div>
      </div>
    </div>`);
}

function closeEmployeeModal(e) {
  if (e && !e.target.classList.contains('modal-backdrop')) return;
  document.querySelector('.employee-modal')?.closest('.modal-backdrop')?.remove();
}

function saveEmployee(id = null) {
  const data = getData();
  data.employees = data.employees || [];
  const employee = {
    id: id || Date.now(),
    name: document.getElementById('empName').value.trim(),
    position: document.getElementById('empPosition').value,
    phone: document.getElementById('empPhone').value.trim(),
    email: document.getElementById('empEmail').value.trim(),
    shift: document.getElementById('empShift').value,
    salary: Number(document.getElementById('empSalary').value || 0),
    status: document.getElementById('empStatus').value,
    address: document.getElementById('empAddress').value.trim()
  };
  if (!employee.name || !employee.phone) return showToast('Nama dan no HP wajib diisi.');
  const existing = id ? data.employees.find(e => e.id === id) : null;
  if (existing) Object.assign(existing, employee);
  else data.employees.unshift(employee);
  data.activities.unshift(`Pemilik toko ${id ? 'mengedit' : 'mendaftarkan'} karyawan ${employee.name}`);
  saveData(data);
  closeEmployeeModal();
  showToast('Data karyawan berhasil disimpan.');
  renderEmployees();
}

function toggleEmployee(id) {
  const data = getData();
  const emp = data.employees.find(e => e.id === id);
  emp.status = emp.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
  data.activities.unshift(`Pemilik toko mengubah status karyawan ${emp.name} menjadi ${emp.status}`);
  saveData(data);
  renderEmployees();
}

function deleteEmployee(id) {
  const data = getData();
  const emp = data.employees.find(e => e.id === id);
  if (!confirm(`Hapus karyawan ${emp.name}?`)) return;
  data.employees = data.employees.filter(e => e.id !== id);
  data.activities.unshift(`Pemilik toko menghapus karyawan ${emp.name}`);
  saveData(data);
  renderEmployees();
}

function exportEmployeesCSV() {
  const data = getData();
  const header = ['Nama','Jabatan','No HP','Email','Shift','Gaji','Status','Alamat'];
  const body = (data.employees || []).map(e => [e.name, e.position, e.phone, e.email || '', e.shift || '', e.salary || 0, e.status, e.address || '']);
  const csv = [header, ...body].map(row => row.map(cell => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `data-karyawan-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Data karyawan berhasil diexport.');
}

function getPOSCart() {
  return JSON.parse(localStorage.getItem('kasir_pos_cart') || '[]');
}

function savePOSCart(cart) {
  localStorage.setItem('kasir_pos_cart', JSON.stringify(cart));
}

function renderOwnerPOS() {
  const data = getData();
  setTitle('Kasir / Scan Barcode');
  const cart = getPOSCart();
  const rows = cart.map(item => {
    const p = data.products.find(x => x.id === item.productId);
    return p ? { ...item, product: p, subtotal: Number(p.price || 0) * Number(item.qty || 0) } : null;
  }).filter(Boolean);
  const subtotal = rows.reduce((sum, r) => sum + r.subtotal, 0);
  const discount = Number(document.getElementById('posDiscount')?.value || 0);
  const tax = Number(document.getElementById('posTax')?.value || 0);
  const grandTotal = Math.max(0, subtotal - discount + tax);
  const lowStock = data.products.filter(p => Number(p.stock) > 0 && Number(p.stock) <= Number(p.minStock || 0)).length;

  document.getElementById('mainContent').innerHTML = `
    <div class="pos-hero card">
      <div>
        <p class="eyebrow">OWNER TRANSACTION RULES</p>
        <h2>Kasir Offline + Scan Barcode</h2>
        <p class="muted">Pemilik toko bisa membuat transaksi langsung, scan barcode/SKU, kelola pembayaran, cetak struk, dan stok otomatis berkurang.</p>
      </div>
      <div class="pos-rules">
        <span>✅ Scan barcode / input manual</span>
        <span>✅ Transaksi offline</span>
        <span>✅ Stok otomatis berkurang</span>
        <span>✅ Riwayat masuk laporan</span>
      </div>
    </div>

    <div class="grid pos-layout" style="margin-top:18px">
      <div>
        <div class="card scan-card">
          <h3>Scan / Input Produk</h3>
          <div class="scan-input-row">
            <input id="barcodeInput" placeholder="Scan barcode, ketik barcode/SKU/nama produk" autofocus onkeydown="handleBarcodeKey(event)">
            <button class="btn primary" onclick="scanAddProduct()">Tambah</button>
          </div>
          <div class="actions" style="margin-top:12px">
            <button class="btn secondary" onclick="startCameraBarcode()">Scan Kamera</button>
            <button class="btn ghost" onclick="stopCameraBarcode()">Stop Kamera</button>
            <button class="btn ghost" onclick="document.getElementById('barcodeInput').focus()">Fokus Scanner</button>
          </div>
          <video id="barcodeVideo" class="barcode-video hidden" autoplay muted playsinline></video>
          <p class="muted">Catatan: scanner barcode USB biasanya langsung mengetik kode lalu tekan Enter. Kamera memakai BarcodeDetector browser jika tersedia.</p>
        </div>

        <div class="card" style="margin-top:18px">
          <div class="card-title-row"><h3>Filter Produk Transaksi</h3><span class="badge">Cepat cari item</span></div>
          <div class="pos-product-filter no-print">
            <div class="search-box"><span>🔎</span><input id="posProductKeyword" placeholder="Cari nama / SKU / barcode produk" oninput="renderPOSProductResults()"></div>
            <select id="posProductCategory" onchange="renderPOSProductResults()"><option>Semua</option>${[...new Set(data.products.map(p => p.category || 'Umum'))].map(c => `<option>${c}</option>`).join('')}</select>
            <select id="posProductStock" onchange="renderPOSProductResults()"><option>Semua Stok</option><option>Stok Tersedia</option><option>Stok Menipis</option></select>
          </div>
          <div id="posProductResults" class="quick-product-grid"></div>
        </div>
      </div>

      <div class="card checkout-card">
        <div class="card-title-row"><h3>Transaksi Kasir</h3><span class="badge">${rows.length} item</span></div>
        <div class="pos-cart-list">
          ${rows.length ? rows.map(r => `<div class="pos-cart-item">
            <div><strong>${r.product.name}</strong><br><span class="muted">${r.product.barcode || r.product.sku} · ${rupiah(r.product.price)}</span></div>
            <div class="pos-qty"><button onclick="updatePOSQty(${r.productId}, -1)">-</button><b>${r.qty}</b><button onclick="updatePOSQty(${r.productId}, 1)">+</button></div>
            <strong>${rupiah(r.subtotal)}</strong>
            <button class="btn danger" onclick="removePOSItem(${r.productId})">×</button>
          </div>`).join('') : '<p class="muted">Belum ada item transaksi.</p>'}
        </div>
        <div class="checkout-row"><span>Subtotal</span><strong>${rupiah(subtotal)}</strong></div>
        <div class="checkout-row"><span>Diskon Manual</span><input id="posDiscount" type="number" value="${discount}" oninput="renderOwnerPOS()"></div>
        <div class="checkout-row"><span>Pajak / Biaya</span><input id="posTax" type="number" value="${tax}" oninput="renderOwnerPOS()"></div>
        <div><label>Nama Pelanggan</label><input id="posCustomer" value="${escapeHtml(document.getElementById('posCustomer')?.value || 'Walk-in Customer')}" placeholder="Walk-in Customer"></div>
        <div style="margin-top:10px"><label>Metode Bayar</label><select id="posPayment"><option>Tunai</option><option>QRIS</option><option>Transfer</option><option>Debit</option></select></div>
        <div style="margin-top:10px"><label>Uang Diterima</label><input id="posPaid" type="number" value="${document.getElementById('posPaid')?.value || ''}" placeholder="Contoh: 50000"></div>
        <div style="margin-top:10px"><label>Catatan</label><input id="posNote" value="${escapeHtml(document.getElementById('posNote')?.value || '')}" placeholder="Catatan transaksi"></div>
        <div class="checkout-row total"><span>Total Bayar</span><strong>${rupiah(grandTotal)}</strong></div>
        <div class="actions" style="margin-top:12px">
          <button class="btn danger" onclick="clearPOSCart()">Kosongkan</button>
          <button class="btn primary" onclick="checkoutPOS()" ${rows.length === 0 ? 'disabled' : ''}>Bayar & Simpan</button>
        </div>
      </div>
    </div>

    <div class="grid cols-3" style="margin-top:18px">
      <div class="card stat"><h3>Stok Menipis</h3><strong>${lowStock}</strong></div>
      <div class="card stat"><h3>Transaksi Hari Ini</h3><strong>${data.transactions.filter(t => t.date === new Date().toISOString().slice(0,10)).length}</strong></div>
      <div class="card stat"><h3>Omzet Hari Ini</h3><strong>${rupiah(data.transactions.filter(t => t.date === new Date().toISOString().slice(0,10)).reduce((a,t)=>a+Number(t.total||0),0))}</strong></div>
    </div>`;

  setTimeout(() => {
    renderPOSProductResults();
    document.getElementById('barcodeInput')?.focus();
  }, 80);
}


function renderPOSProductResults() {
  const data = getData();
  const keyword = (document.getElementById('posProductKeyword')?.value || '').toLowerCase().trim();
  const category = document.getElementById('posProductCategory')?.value || 'Semua';
  const stockFilter = document.getElementById('posProductStock')?.value || 'Semua Stok';
  const products = data.products.filter(p => {
    const text = `${p.name} ${p.sku} ${p.barcode || ''} ${p.category}`.toLowerCase();
    return p.status === 'Aktif'
      && (!keyword || text.includes(keyword))
      && (category === 'Semua' || p.category === category)
      && (stockFilter === 'Semua Stok'
        || (stockFilter === 'Stok Tersedia' && Number(p.stock || 0) > 0)
        || (stockFilter === 'Stok Menipis' && Number(p.stock || 0) > 0 && Number(p.stock || 0) <= Number(p.minStock || 0)));
  }).slice(0, 24);
  const el = document.getElementById('posProductResults');
  if (!el) return;
  el.innerHTML = products.map(p => `<button class="quick-product" onclick="addPOSToCart(${p.id})"><span>${p.imageData ? `<img src='${p.imageData}'>` : (p.icon || '📦')}</span><strong>${p.name}</strong><small>${p.barcode || p.sku}</small><small>${rupiah(p.price)} · stok ${p.stock}</small></button>`).join('') || '<p class="muted">Produk tidak ditemukan.</p>';
}

function handleBarcodeKey(e) {
  if (e.key === 'Enter') scanAddProduct();
}

function findProductByScan(code) {
  const q = String(code || '').trim().toLowerCase();
  const data = getData();
  return data.products.find(p => p.status === 'Aktif' && String(p.barcode || '').toLowerCase() === q)
    || data.products.find(p => p.status === 'Aktif' && String(p.sku || '').toLowerCase() === q)
    || data.products.find(p => p.status === 'Aktif' && String(p.name || '').toLowerCase().includes(q));
}

function scanAddProduct() {
  const input = document.getElementById('barcodeInput');
  const code = input.value.trim();
  if (!code) return showToast('Masukkan barcode / SKU / nama produk.');
  const product = findProductByScan(code);
  if (!product) return showToast('Produk tidak ditemukan.');
  addPOSToCart(product.id);
  input.value = '';
}

function addPOSToCart(productId) {
  const data = getData();
  const product = data.products.find(p => p.id === productId);
  if (!product || product.status !== 'Aktif') return showToast('Produk tidak aktif.');
  const cart = getPOSCart();
  const item = cart.find(i => i.productId === productId);
  const qty = item ? item.qty + 1 : 1;
  if (qty > Number(product.stock || 0)) return showToast(`Stok ${product.name} tidak cukup.`);
  if (item) item.qty = qty;
  else cart.push({ productId, qty: 1 });
  savePOSCart(cart);
  showToast(`${product.name} masuk transaksi.`);
  renderOwnerPOS();
}

function updatePOSQty(productId, delta) {
  const data = getData();
  const product = data.products.find(p => p.id === productId);
  let cart = getPOSCart();
  const item = cart.find(i => i.productId === productId);
  if (!item) return;
  const next = item.qty + delta;
  if (next < 1) cart = cart.filter(i => i.productId !== productId);
  else {
    if (next > Number(product.stock || 0)) return showToast('Jumlah melebihi stok.');
    item.qty = next;
  }
  savePOSCart(cart);
  renderOwnerPOS();
}

function removePOSItem(productId) {
  savePOSCart(getPOSCart().filter(i => i.productId !== productId));
  renderOwnerPOS();
}

function clearPOSCart() {
  savePOSCart([]);
  renderOwnerPOS();
}

function checkoutPOS() {
  const data = getData();
  const cart = getPOSCart();
  if (!cart.length) return showToast('Transaksi masih kosong.');
  const detail = [];
  for (const item of cart) {
    const p = data.products.find(x => x.id === item.productId);
    if (!p || Number(p.stock || 0) < item.qty) return showToast(`Stok ${p?.name || 'produk'} tidak cukup.`);
    p.stock -= item.qty;
    p.sold = Number(p.sold || 0) + item.qty;
    recordStockLog(data, p, 'Keluar', item.qty, 'Transaksi kasir offline');
    detail.push({ productId: p.id, name: p.name, qty: item.qty, price: p.price });
  }
  const subtotal = detail.reduce((sum, i) => sum + i.price * i.qty, 0);
  const discount = Number(document.getElementById('posDiscount')?.value || 0);
  const serviceFee = Number(document.getElementById('posTax')?.value || 0);
  const total = Math.max(0, subtotal - discount + serviceFee);
  const paid = Number(document.getElementById('posPaid')?.value || 0);
  const id = `TRX-${String(data.transactions.length + 1).padStart(3, '0')}`;
  const trx = {
    id,
    customer: document.getElementById('posCustomer')?.value || 'Walk-in Customer',
    customerUsername: 'offline-cashier',
    cashier: session.username,
    channel: 'Kasir Offline',
    items: detail,
    payment: document.getElementById('posPayment')?.value || 'Tunai',
    note: document.getElementById('posNote')?.value || '-',
    shippingAddress: 'Transaksi langsung toko',
    voucherCode: '-', discount, serviceFee, subtotal, total,
    paid, change: Math.max(0, paid - total),
    status: 'Selesai',
    date: new Date().toISOString().slice(0, 10)
  };
  data.transactions.unshift(trx);
  data.activities.unshift(`Pemilik toko membuat transaksi kasir ${id}`);
  saveData(data);
  savePOSCart([]);
  showReceipt(trx);
  renderOwnerPOS();
}

function showReceipt(trx) {
  const items = trx.items.map(i => `${i.name} x${i.qty} = ${rupiah(i.price * i.qty)}`).join('\n');
  alert(`STRUK TRANSAKSI\n${trx.id}\n\n${items}\n\nSubtotal: ${rupiah(trx.subtotal)}\nDiskon: ${rupiah(trx.discount)}\nBiaya/Pajak: ${rupiah(trx.serviceFee)}\nTotal: ${rupiah(trx.total)}\nBayar: ${rupiah(trx.paid)}\nKembali: ${rupiah(trx.change)}\n\nTersimpan ke semua transaksi & laporan.`);
}

let barcodeStream = null;
let barcodeDetectorLoop = null;
async function startCameraBarcode() {
  if (!('BarcodeDetector' in window)) return showToast('Browser belum mendukung scan kamera. Pakai scanner USB/manual input.');
  try {
    const video = document.getElementById('barcodeVideo');
    video.classList.remove('hidden');
    barcodeStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    video.srcObject = barcodeStream;
    const detector = new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'code_128', 'qr_code'] });
    const scanLoop = async () => {
      if (!barcodeStream) return;
      try {
        const codes = await detector.detect(video);
        if (codes.length) {
          document.getElementById('barcodeInput').value = codes[0].rawValue;
          scanAddProduct();
          stopCameraBarcode();
          return;
        }
      } catch (e) {}
      barcodeDetectorLoop = requestAnimationFrame(scanLoop);
    };
    barcodeDetectorLoop = requestAnimationFrame(scanLoop);
  } catch (e) {
    showToast('Kamera tidak bisa dibuka. Izinkan akses kamera atau pakai input manual.');
  }
}

function stopCameraBarcode() {
  if (barcodeDetectorLoop) cancelAnimationFrame(barcodeDetectorLoop);
  barcodeDetectorLoop = null;
  if (barcodeStream) barcodeStream.getTracks().forEach(t => t.stop());
  barcodeStream = null;
  document.getElementById('barcodeVideo')?.classList.add('hidden');
}

function getOwnerProductFilters() {
  return {
    keyword: (document.getElementById('ownerProductKeyword')?.value || '').toLowerCase().trim(),
    category: document.getElementById('ownerProductCategory')?.value || 'Semua',
    stock: document.getElementById('ownerStockFilter')?.value || 'Semua',
    status: document.getElementById('ownerStatusFilter')?.value || 'Semua'
  };
}

function filterOwnerProducts(products, filters) {
  return products.filter(p => {
    const keywordText = `${p.sku} ${p.barcode || ''} ${p.name} ${p.category} ${p.description}`.toLowerCase();
    const keywordOk = !filters.keyword || keywordText.includes(filters.keyword);
    const categoryOk = filters.category === 'Semua' || p.category === filters.category;
    const statusOk = filters.status === 'Semua' || p.status === filters.status;
    const stockOk = filters.stock === 'Semua'
      || (filters.stock === 'Aman' && Number(p.stock) > Number(p.minStock || 0))
      || (filters.stock === 'Menipis' && Number(p.stock) > 0 && Number(p.stock) <= Number(p.minStock || 0))
      || (filters.stock === 'Habis' && Number(p.stock) <= 0);
    return keywordOk && categoryOk && statusOk && stockOk;
  });
}

function renderOwnerProducts() {
  const data = getData();
  setTitle('Manajemen Produk & Stok');
  const filters = getOwnerProductFilters();
  const categories = ['Semua', ...new Set(data.products.map(p => p.category || 'Umum'))];
  const products = filterOwnerProducts(data.products, filters);
  const totalValue = data.products.reduce((sum, p) => sum + Number(p.stock || 0) * Number(p.costPrice || 0), 0);
  const potentialSales = data.products.reduce((sum, p) => sum + Number(p.stock || 0) * Number(p.price || 0), 0);
  const lowStock = data.products.filter(p => Number(p.stock) > 0 && Number(p.stock) <= Number(p.minStock || 0)).length;
  const outStock = data.products.filter(p => Number(p.stock) <= 0).length;

  document.getElementById('mainContent').innerHTML = `
    <div class="seller-hero card">
      <div>
        <p class="eyebrow">SELLER CENTER OFFLINE</p>
        <h2>Produk, Stok, Gambar & Harga</h2>
        <p class="muted">Kelola katalog seperti marketplace: SKU, gambar produk, harga jual, modal, stok minimum, status aktif, dan deskripsi.</p>
      </div>
      <div class="report-actions">
        <button class="btn primary" onclick="openProductModal()">+ Input Produk</button>
        <button class="btn secondary" onclick="exportProductsCSV()">Export Produk CSV</button>
      </div>
    </div>

    <div class="grid cols-4 report-kpis">
      <div class="card stat pro"><h3>Total Produk</h3><strong>${data.products.length}</strong><span>${data.products.filter(p => p.status === 'Aktif').length} aktif</span></div>
      <div class="card stat pro"><h3>Stok Menipis</h3><strong>${lowStock}</strong><span>${outStock} habis</span></div>
      <div class="card stat pro"><h3>Nilai Modal Stok</h3><strong>${rupiah(totalValue)}</strong><span>Estimasi inventory</span></div>
      <div class="card stat pro"><h3>Potensi Penjualan</h3><strong>${rupiah(potentialSales)}</strong><span>Jika semua stok terjual</span></div>
    </div>

    <div class="card owner-filter no-print">
      <div class="search-box"><span>🔎</span><input id="ownerProductKeyword" value="${escapeHtml(filters.keyword)}" placeholder="Cari SKU, nama, kategori..." oninput="renderOwnerProductsDebounced()"></div>
      <select id="ownerProductCategory" onchange="renderOwnerProducts()">${categories.map(c => `<option ${c === filters.category ? 'selected' : ''}>${c}</option>`).join('')}</select>
      <select id="ownerStockFilter" onchange="renderOwnerProducts()">${['Semua','Aman','Menipis','Habis'].map(x => `<option ${x === filters.stock ? 'selected' : ''}>${x}</option>`).join('')}</select>
      <select id="ownerStatusFilter" onchange="renderOwnerProducts()">${['Semua','Aktif','Nonaktif'].map(x => `<option ${x === filters.status ? 'selected' : ''}>${x}</option>`).join('')}</select>
    </div>

    <div class="card" style="margin-top:18px">
      <div class="card-title-row"><h3>Katalog Produk</h3><span class="badge">${products.length} produk</span></div>
      <div class="table-wrap"><table class="owner-product-table">
        <thead><tr><th>Produk</th><th>SKU / Barcode</th><th>Kategori</th><th>Harga</th><th>Modal</th><th>Stok</th><th>Status</th><th>Aksi</th></tr></thead>
        <tbody>${products.map(ownerProductRow).join('') || '<tr><td colspan="8">Produk tidak ditemukan</td></tr>'}</tbody>
      </table></div>
    </div>

    <div class="grid report-layout" style="margin-top:18px">
      <div class="card"><h3>Riwayat Perubahan Stok</h3>${stockLogList(data.stockLog.slice(0, 12))}</div>
      <div class="card"><h3>Rekomendasi Seller</h3>${sellerRecommendations(data.products)}</div>
    </div>`;
}

let ownerProductTimer = null;
function renderOwnerProductsDebounced() {
  clearTimeout(ownerProductTimer);
  ownerProductTimer = setTimeout(renderOwnerProducts, 300);
}

function ownerProductRow(p) {
  const stockClass = Number(p.stock) <= 0 ? 'red' : Number(p.stock) <= Number(p.minStock || 0) ? '' : 'green';
  const stockLabel = Number(p.stock) <= 0 ? 'Habis' : Number(p.stock) <= Number(p.minStock || 0) ? 'Menipis' : 'Aman';
  return `<tr>
    <td><div class="owner-product-cell"><div class="owner-thumb">${p.imageData ? `<img src="${p.imageData}" alt="${escapeHtml(p.name)}">` : (p.icon || '📦')}</div><div><strong>${p.name}</strong><span>${escapeHtml((p.description || '').slice(0, 54))}</span></div></div></td>
    <td><strong>${p.sku}</strong><br><small>${p.barcode || '-'}</small></td><td>${p.category}</td><td>${rupiah(p.price)}</td><td>${rupiah(p.costPrice)}</td>
    <td><span class="badge ${stockClass}">${p.stock} / min ${p.minStock}</span><br><small>${stockLabel}</small></td>
    <td><span class="badge ${p.status === 'Aktif' ? 'green' : 'red'}">${p.status}</span></td>
    <td class="actions compact">
      <button class="btn secondary" onclick="openProductModal(${p.id})">Edit</button>
      <button class="btn ghost" onclick="quickStock(${p.id}, 'add')">+ Stok</button>
      <button class="btn ghost" onclick="quickStock(${p.id}, 'reduce')">- Stok</button>
      <button class="btn ghost" onclick="toggleProduct(${p.id})">${p.status === 'Aktif' ? 'Nonaktif' : 'Aktif'}</button>
      <button class="btn danger" onclick="deleteProduct(${p.id})">Hapus</button>
    </td>
  </tr>`;
}

function stockLogList(logs) {
  if (!logs.length) return '<p class="muted">Belum ada perubahan stok.</p>';
  return logs.map(log => `<div class="cart-item"><div><strong>${log.productName}</strong><br><span class="muted">${log.date} · ${log.note}</span></div><span class="badge ${log.type === 'Masuk' ? 'green' : 'red'}">${log.type} ${log.qty}</span></div>`).join('');
}

function sellerRecommendations(products) {
  const low = products.filter(p => Number(p.stock) > 0 && Number(p.stock) <= Number(p.minStock || 0));
  const empty = products.filter(p => Number(p.stock) <= 0);
  const inactive = products.filter(p => p.status !== 'Aktif');
  const top = [...products].sort((a, b) => Number(b.sold || 0) - Number(a.sold || 0))[0];
  return `
    <div class="recommend-list">
      <div><strong>${empty.length}</strong><span>Produk habis perlu restock</span></div>
      <div><strong>${low.length}</strong><span>Produk stok menipis</span></div>
      <div><strong>${inactive.length}</strong><span>Produk nonaktif</span></div>
      <div><strong>${top ? top.name : '-'}</strong><span>Produk terlaris</span></div>
    </div>`;
}

function openProductModal(id = null) {
  const data = getData();
  const p = id ? data.products.find(x => x.id === id) : {
    id: '', sku: `SKU-${Date.now()}`, barcode: `899${Date.now()}`, name: '', category: '', price: '', costPrice: '', stock: '', minStock: 5, icon: '📦', imageData: '', description: '', weight: '', condition: 'Baru', status: 'Aktif'
  };
  document.body.insertAdjacentHTML('beforeend', `
    <div class="modal-backdrop" onclick="closeProductModalOwner(event)">
      <div class="modal-card product-editor-modal" onclick="event.stopPropagation()">
        <button class="modal-close" onclick="closeProductModalOwner()">×</button>
        <p class="eyebrow">${id ? 'EDIT PRODUK' : 'INPUT PRODUK BARU'}</p>
        <h2>${id ? 'Edit Detail Produk' : 'Tambah Produk Toko'}</h2>
        <div class="product-editor-grid">
          <div>
            <label>Gambar Produk</label>
            <div id="productImagePreview" class="image-preview">${p.imageData ? `<img src="${p.imageData}">` : (p.icon || '📦')}</div>
            <input id="editImage" type="file" accept="image/*" onchange="previewOwnerImage(event)">
            <small class="muted">Gambar disimpan offline di browser.</small>
          </div>
          <div class="editor-fields">
            <div><label>Nama Produk</label><input id="editName" value="${escapeHtml(p.name)}" placeholder="Nama produk"></div>
            <div><label>SKU / Kode Barang</label><input id="editSku" value="${escapeHtml(p.sku)}" placeholder="SKU-001"></div>
            <div><label>Barcode / Kode Scan</label><input id="editBarcode" value="${escapeHtml(p.barcode || '')}" placeholder="899000000001"></div>
            <div><label>Kategori</label><input id="editCategory" value="${escapeHtml(p.category)}" placeholder="Makanan / Minuman"></div>
            <div><label>Harga Jual</label><input id="editPrice" type="number" value="${p.price}" placeholder="15000"></div>
            <div><label>Harga Modal</label><input id="editCost" type="number" value="${p.costPrice}" placeholder="9000"></div>
            <div><label>Stok</label><input id="editStock" type="number" value="${p.stock}" placeholder="20"></div>
            <div><label>Stok Minimum</label><input id="editMinStock" type="number" value="${p.minStock}" placeholder="5"></div>
            <div><label>Berat gram</label><input id="editWeight" type="number" value="${p.weight || ''}" placeholder="250"></div>
            <div><label>Emoji Fallback</label><input id="editIcon" value="${escapeHtml(p.icon || '📦')}" placeholder="📦"></div>
            <div><label>Kondisi</label><select id="editCondition"><option ${p.condition === 'Baru' ? 'selected' : ''}>Baru</option><option ${p.condition === 'Bekas' ? 'selected' : ''}>Bekas</option></select></div>
            <div><label>Status</label><select id="editStatus"><option ${p.status === 'Aktif' ? 'selected' : ''}>Aktif</option><option ${p.status === 'Nonaktif' ? 'selected' : ''}>Nonaktif</option></select></div>
            <div class="span-2"><label>Deskripsi Produk</label><textarea id="editDescription" rows="4" placeholder="Deskripsi produk yang tampil ke pelanggan">${escapeHtml(p.description || '')}</textarea></div>
          </div>
        </div>
        <div class="actions" style="justify-content:flex-end;margin-top:18px">
          <button class="btn ghost" onclick="closeProductModalOwner()">Batal</button>
          <button class="btn primary" onclick="saveProductFromModal(${id || 'null'})">Simpan Produk</button>
        </div>
      </div>
    </div>`);
}

function closeProductModalOwner(e) {
  if (e && !e.target.classList.contains('modal-backdrop')) return;
  document.querySelector('.product-editor-modal')?.closest('.modal-backdrop')?.remove();
}

function previewOwnerImage(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    window.__ownerImageData = reader.result;
    document.getElementById('productImagePreview').innerHTML = `<img src="${reader.result}">`;
  };
  reader.readAsDataURL(file);
}

function saveProductFromModal(id = null) {
  const data = getData();
  const name = document.getElementById('editName').value.trim();
  const sku = document.getElementById('editSku').value.trim();
  const barcode = document.getElementById('editBarcode').value.trim();
  const category = document.getElementById('editCategory').value.trim() || 'Umum';
  const price = Number(document.getElementById('editPrice').value);
  const costPrice = Number(document.getElementById('editCost').value || 0);
  const stock = Number(document.getElementById('editStock').value);
  const minStock = Number(document.getElementById('editMinStock').value || 0);
  if (!name || !sku || price <= 0 || stock < 0) return showToast('Nama, SKU, harga, dan stok wajib valid.');
  if (data.products.some(p => p.id !== id && p.sku === sku)) return showToast('SKU sudah digunakan produk lain.');
  if (barcode && data.products.some(p => p.id !== id && p.barcode === barcode)) return showToast('Barcode sudah digunakan produk lain.');

  const oldProduct = id ? data.products.find(p => p.id === id) : null;
  const imageData = window.__ownerImageData || oldProduct?.imageData || '';
  const productData = {
    id: id || Date.now(), sku, barcode, name, category, price, costPrice, stock, minStock,
    icon: document.getElementById('editIcon').value.trim() || '📦', imageData,
    description: document.getElementById('editDescription').value.trim(),
    weight: Number(document.getElementById('editWeight').value || 0),
    condition: document.getElementById('editCondition').value,
    status: document.getElementById('editStatus').value,
    rating: oldProduct?.rating || '4.8', sold: oldProduct?.sold || 0
  };

  if (oldProduct) {
    const oldStock = Number(oldProduct.stock || 0);
    Object.assign(oldProduct, productData);
    if (oldStock !== stock) recordStockLog(data, oldProduct, stock > oldStock ? 'Masuk' : 'Keluar', Math.abs(stock - oldStock), `Edit stok manual dari ${oldStock} ke ${stock}`);
    data.activities.unshift(`Pemilik toko mengedit produk ${name}`);
  } else {
    data.products.unshift(productData);
    recordStockLog(data, productData, 'Masuk', stock, 'Input produk baru');
    data.activities.unshift(`Pemilik toko menambah produk ${name}`);
  }
  window.__ownerImageData = '';
  saveData(data);
  closeProductModalOwner();
  showToast('Produk berhasil disimpan.');
  renderOwnerProducts();
}

function addProduct() { openProductModal(); }
function editProduct(id) { openProductModal(id); }

function recordStockLog(data, product, type, qty, note) {
  if (!qty) return;
  data.stockLog = data.stockLog || [];
  data.stockLog.unshift({ id: Date.now(), productId: product.id, productName: product.name, type, qty, note, date: new Date().toLocaleString('id-ID') });
}

function quickStock(id, mode) {
  const data = getData();
  const p = data.products.find(x => x.id === id);
  const qty = Number(prompt(`${mode === 'add' ? 'Tambah' : 'Kurangi'} stok ${p.name}:`, '1'));
  if (!qty || qty <= 0) return showToast('Jumlah stok tidak valid.');
  const oldStock = Number(p.stock || 0);
  p.stock = mode === 'add' ? oldStock + qty : Math.max(0, oldStock - qty);
  recordStockLog(data, p, mode === 'add' ? 'Masuk' : 'Keluar', qty, mode === 'add' ? 'Restock manual' : 'Pengurangan manual');
  data.activities.unshift(`Pemilik toko mengubah stok ${p.name} dari ${oldStock} ke ${p.stock}`);
  saveData(data);
  renderOwnerProducts();
}

function changeStock(id, delta) {
  const data = getData();
  const p = data.products.find(x => x.id === id);
  const oldStock = Number(p.stock || 0);
  p.stock = Math.max(0, oldStock + delta);
  recordStockLog(data, p, delta > 0 ? 'Masuk' : 'Keluar', Math.abs(delta), 'Update cepat stok');
  data.activities.unshift(`Pemilik toko mengubah stok ${p.name} menjadi ${p.stock}`);
  saveData(data);
  renderOwnerProducts();
}

function toggleProduct(id) {
  const data = getData();
  const p = data.products.find(x => x.id === id);
  p.status = p.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
  data.activities.unshift(`Pemilik toko mengubah status produk ${p.name} menjadi ${p.status}`);
  saveData(data);
  renderOwnerProducts();
}

function deleteProduct(id) {
  const data = getData();
  const p = data.products.find(x => x.id === id);
  if (!confirm(`Hapus produk ${p.name}?`)) return;
  data.products = data.products.filter(x => x.id !== id);
  data.activities.unshift(`Pemilik toko menghapus produk ${p.name}`);
  saveData(data);
  renderOwnerProducts();
}

function exportProductsCSV() {
  const data = getData();
  const header = ['SKU','Barcode','Nama','Kategori','Harga Jual','Harga Modal','Stok','Stok Minimum','Status','Terjual','Berat','Kondisi','Deskripsi'];
  const body = data.products.map(p => [p.sku, p.barcode || '', p.name, p.category, p.price, p.costPrice, p.stock, p.minStock, p.status, p.sold || 0, p.weight || 0, p.condition || 'Baru', p.description || '']);
  const csv = [header, ...body].map(row => row.map(cell => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `produk-stok-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Data produk berhasil diexport.');
}

function renderOrders() {
  const data = getData();
  setTitle('Kelola Pesanan Masuk');
  document.getElementById('mainContent').innerHTML = transactionTable(data.transactions.filter(t => t.status !== 'Selesai'), 'owner');
}

function renderHistory() {
  const data = getData();
  const list = session.role === 'customer'
    ? data.transactions.filter(t => t.customerUsername === session.username)
    : data.transactions;
  setTitle(session.role === 'customer' ? 'Riwayat Transaksi Saya' : 'Riwayat Transaksi Toko');
  if (session.role === 'customer') return renderCustomerOrders(list);
  document.getElementById('mainContent').innerHTML = transactionTable(list, 'owner');
}


function getReportFilters() {
  return {
    start: document.getElementById('reportStart')?.value || '',
    end: document.getElementById('reportEnd')?.value || '',
    status: document.getElementById('reportStatus')?.value || 'Semua',
    payment: document.getElementById('reportPayment')?.value || 'Semua',
    keyword: (document.getElementById('reportKeyword')?.value || '').toLowerCase().trim()
  };
}

function filterTransactions(transactions, filters) {
  return transactions.filter(t => {
    const inStart = !filters.start || t.date >= filters.start;
    const inEnd = !filters.end || t.date <= filters.end;
    const inStatus = filters.status === 'Semua' || t.status === filters.status;
    const inPayment = filters.payment === 'Semua' || (t.payment || '-') === filters.payment;
    const text = `${t.id} ${t.customer} ${t.customerUsername} ${itemsText(t.items)} ${t.note || ''}`.toLowerCase();
    const inKeyword = !filters.keyword || text.includes(filters.keyword);
    return inStart && inEnd && inStatus && inPayment && inKeyword;
  });
}

function groupSum(rows, keyGetter, valueGetter = t => t.total) {
  return rows.reduce((acc, row) => {
    const key = keyGetter(row) || '-';
    acc[key] = (acc[key] || 0) + Number(valueGetter(row) || 0);
    return acc;
  }, {});
}

function groupCount(rows, keyGetter) {
  return rows.reduce((acc, row) => {
    const key = keyGetter(row) || '-';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function sortedEntries(obj, limit = 999) {
  return Object.entries(obj).sort((a, b) => Number(b[1]) - Number(a[1])).slice(0, limit);
}

function getReportRows(transactions) {
  const data = getData();
  const productMap = Object.fromEntries(data.products.map(p => [p.id, p]));
  const products = {};
  const categories = {};

  transactions.forEach(t => {
    (t.items || []).forEach(item => {
      const product = productMap[item.productId] || {};
      const name = item.name || product.name || 'Produk';
      const category = product.category || 'Umum';
      const qty = Number(item.qty || 0);
      const subtotal = Number(item.price || 0) * qty;
      if (!products[name]) products[name] = { qty: 0, sales: 0 };
      products[name].qty += qty;
      products[name].sales += subtotal;
      categories[category] = (categories[category] || 0) + subtotal;
    });
  });

  return { products, categories };
}

function renderReports() {
  const data = getData();
  setTitle('Reporting Profesional');

  const previous = getReportFilters();
  const today = new Date().toISOString().slice(0, 10);
  const firstDate = data.transactions.map(t => t.date).sort()[0] || today;
  const defaultFilters = {
    start: previous.start || firstDate,
    end: previous.end || today,
    status: previous.status || 'Semua',
    payment: previous.payment || 'Semua',
    keyword: previous.keyword || ''
  };

  const rows = filterTransactions(data.transactions, defaultFilters);
  const completedRows = rows.filter(t => t.status === 'Selesai');
  const grossSales = rows.reduce((sum, t) => sum + Number(t.total || 0), 0);
  const completedSales = completedRows.reduce((sum, t) => sum + Number(t.total || 0), 0);
  const pendingSales = rows.filter(t => t.status === 'Diproses').reduce((sum, t) => sum + Number(t.total || 0), 0);
  const canceledSales = rows.filter(t => t.status === 'Dibatalkan').reduce((sum, t) => sum + Number(t.total || 0), 0);
  const productMapForProfit = Object.fromEntries(data.products.map(p => [p.id, p]));
  const estimatedCost = rows.reduce((sum, t) => sum + (t.items || []).reduce((s, item) => s + Number(productMapForProfit[item.productId]?.costPrice || 0) * Number(item.qty || 0), 0), 0);
  const estimatedProfit = grossSales - estimatedCost;
  const lowStockCount = data.products.filter(p => Number(p.stock) > 0 && Number(p.stock) <= Number(p.minStock || 0)).length;
  const outStockCount = data.products.filter(p => Number(p.stock) <= 0).length;
  const avgOrder = rows.length ? grossSales / rows.length : 0;
  const totalItems = rows.reduce((sum, t) => sum + (t.items || []).reduce((s, i) => s + Number(i.qty || 0), 0), 0);
  const statusCount = groupCount(rows, t => t.status);
  const paymentCount = groupCount(rows, t => t.payment || '-');
  const dailySales = groupSum(rows, t => t.date, t => t.total);
  const { products, categories } = getReportRows(rows);

  document.getElementById('mainContent').innerHTML = `
    <div class="report-hero card">
      <div>
        <p class="eyebrow">OFFLINE BUSINESS REPORT</p>
        <h2>Laporan Penjualan & Operasional</h2>
        <p class="muted">Ringkasan transaksi tersimpan offline di browser. Gunakan filter untuk analisis harian, mingguan, atau bulanan.</p>
      </div>
      <div class="report-actions">
        <button class="btn secondary" onclick="exportReportCSV()">Export CSV</button>
        <button class="btn ghost" onclick="window.print()">Print / PDF</button>
      </div>
    </div>

    <div class="card report-filter no-print">
      <div><label>Dari Tanggal</label><input id="reportStart" type="date" value="${defaultFilters.start}" onchange="renderReports()"></div>
      <div><label>Sampai Tanggal</label><input id="reportEnd" type="date" value="${defaultFilters.end}" onchange="renderReports()"></div>
      <div><label>Status</label><select id="reportStatus" onchange="renderReports()">${['Semua','Diproses','Selesai','Dibatalkan'].map(x => `<option ${x === defaultFilters.status ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
      <div><label>Pembayaran</label><select id="reportPayment" onchange="renderReports()">${['Semua','Tunai','Transfer','QRIS'].map(x => `<option ${x === defaultFilters.payment ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
      <div><label>Cari</label><input id="reportKeyword" value="${escapeHtml(defaultFilters.keyword)}" placeholder="ID, pelanggan, produk" oninput="renderReportsDebounced()"></div>
    </div>

    <div class="grid cols-4 report-kpis">
      <div class="card stat pro"><h3>Omzet Filter</h3><strong>${rupiah(grossSales)}</strong><span>${rows.length} transaksi</span></div>
      <div class="card stat pro"><h3>Penjualan Selesai</h3><strong>${rupiah(completedSales)}</strong><span>${completedRows.length} selesai</span></div>
      <div class="card stat pro"><h3>Rata-rata Order</h3><strong>${rupiah(avgOrder)}</strong><span>${totalItems} item terjual</span></div>
      <div class="card stat pro"><h3>Potensi Pending</h3><strong>${rupiah(pendingSales)}</strong><span>Dibatalkan ${rupiah(canceledSales)}</span></div>
    </div>
    <div class="grid cols-4 report-kpis">
      <div class="card stat pro"><h3>Estimasi Modal</h3><strong>${rupiah(estimatedCost)}</strong><span>Berdasarkan HPP produk</span></div>
      <div class="card stat pro"><h3>Estimasi Profit</h3><strong>${rupiah(estimatedProfit)}</strong><span>Omzet - modal</span></div>
      <div class="card stat pro"><h3>Stok Menipis</h3><strong>${lowStockCount}</strong><span>Segera restock</span></div>
      <div class="card stat pro"><h3>Stok Habis</h3><strong>${outStockCount}</strong><span>Perlu tindakan</span></div>
    </div>

    <div class="grid report-layout" style="margin-top:18px">
      <div class="card chart-card">
        <div class="card-title-row"><h3>Grafik Penjualan Harian</h3><span class="badge">${defaultFilters.start} s/d ${defaultFilters.end}</span></div>
        <canvas id="salesChart" height="220"></canvas>
      </div>
      <div class="card">
        <h3>Status Transaksi</h3>
        ${progressList(statusCount, rows.length)}
        <h3 style="margin-top:22px">Metode Pembayaran</h3>
        ${progressList(paymentCount, rows.length)}
      </div>
    </div>

    <div class="grid cols-2" style="margin-top:18px">
      <div class="card">
        <h3>Top Produk</h3>
        <div class="table-wrap"><table>
          <thead><tr><th>Produk</th><th>Qty</th><th>Penjualan</th></tr></thead>
          <tbody>${sortedEntries(products, 10).map(([name, val]) => `<tr><td>${name}</td><td>${val.qty}</td><td>${rupiah(val.sales)}</td></tr>`).join('') || '<tr><td colspan="3">Belum ada data</td></tr>'}</tbody>
        </table></div>
      </div>
      <div class="card">
        <h3>Penjualan per Kategori</h3>
        <div class="table-wrap"><table>
          <thead><tr><th>Kategori</th><th>Total</th><th>Kontribusi</th></tr></thead>
          <tbody>${sortedEntries(categories, 10).map(([name, val]) => `<tr><td>${name}</td><td>${rupiah(val)}</td><td>${grossSales ? Math.round(val / grossSales * 100) : 0}%</td></tr>`).join('') || '<tr><td colspan="3">Belum ada data</td></tr>'}</tbody>
        </table></div>
      </div>
    </div>

    <div class="card" style="margin-top:18px">
      <div class="card-title-row"><h3>Detail Transaksi</h3><span class="badge">${rows.length} data</span></div>
      <div class="table-wrap"><table>
        <thead><tr><th>ID</th><th>Tanggal</th><th>Pelanggan</th><th>Item</th><th>Pembayaran</th><th>Status</th><th>Total</th></tr></thead>
        <tbody>${rows.map(t => `<tr><td>${t.id}</td><td>${t.date}</td><td>${t.customer}</td><td>${itemsText(t.items)}</td><td>${t.payment || '-'}</td><td><span class="badge ${t.status === 'Selesai' ? 'green' : t.status === 'Dibatalkan' ? 'red' : ''}">${t.status}</span></td><td>${rupiah(t.total)}</td></tr>`).join('') || '<tr><td colspan="7">Belum ada data sesuai filter</td></tr>'}</tbody>
      </table></div>
    </div>`;

  setTimeout(() => drawSalesChart(dailySales), 50);
}

let reportTypingTimer = null;
function renderReportsDebounced() {
  clearTimeout(reportTypingTimer);
  reportTypingTimer = setTimeout(renderReports, 350);
}

function progressList(obj, total) {
  const entries = sortedEntries(obj, 8);
  if (!entries.length) return '<p class="muted">Belum ada data.</p>';
  return entries.map(([name, count]) => {
    const percent = total ? Math.round(Number(count) / total * 100) : 0;
    return `<div class="progress-row"><div><strong>${name}</strong><span>${count} transaksi</span></div><div class="progress"><i style="width:${percent}%"></i></div><b>${percent}%</b></div>`;
  }).join('');
}

function drawSalesChart(dailySales) {
  const canvas = document.getElementById('salesChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = 220 * dpr;
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = 220;
  ctx.clearRect(0, 0, width, height);
  const entries = Object.entries(dailySales).sort((a, b) => a[0].localeCompare(b[0]));
  if (!entries.length) {
    ctx.fillStyle = '#6b7a90';
    ctx.font = '14px Arial';
    ctx.fillText('Belum ada data untuk ditampilkan.', 18, 110);
    return;
  }

  const padding = 34;
  const max = Math.max(...entries.map(e => Number(e[1])), 1);
  const barGap = 10;
  const barWidth = Math.max(18, (width - padding * 2 - barGap * (entries.length - 1)) / entries.length);

  ctx.strokeStyle = '#dbe7f6';
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const y = padding + i * ((height - padding * 2) / 3);
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
  }

  entries.forEach(([date, value], index) => {
    const barHeight = (Number(value) / max) * (height - padding * 2);
    const x = padding + index * (barWidth + barGap);
    const y = height - padding - barHeight;
    const gradient = ctx.createLinearGradient(0, y, 0, height - padding);
    gradient.addColorStop(0, '#0d6efd');
    gradient.addColorStop(1, '#8cc4ff');
    ctx.fillStyle = gradient;
    roundRect(ctx, x, y, barWidth, barHeight, 8);
    ctx.fill();

    ctx.fillStyle = '#14213d';
    ctx.font = '11px Arial';
    ctx.fillText(date.slice(5), x, height - 10);
  });
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function exportReportCSV() {
  const data = getData();
  const filters = getReportFilters();
  const rows = filterTransactions(data.transactions, filters);
  const header = ['ID', 'Tanggal', 'Pelanggan', 'Username', 'Item', 'Pembayaran', 'Status', 'Catatan', 'Total'];
  const body = rows.map(t => [t.id, t.date, t.customer, t.customerUsername, itemsText(t.items), t.payment || '-', t.status, t.note || '-', t.total]);
  const csv = [header, ...body].map(row => row.map(cell => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `laporan-kasir-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Laporan CSV berhasil dibuat.');
}

function renderProfile() {
  const data = getData();
  const user = data.users.find(u => u.username === session.username);
  setTitle('Profil Pelanggan');
  document.getElementById('mainContent').innerHTML = `
    <div class="card">
      <h3>Data Profil Saya</h3>
      <div class="grid cols-2">
        <div><label>Nama</label><input id="profileName" value="${escapeHtml(user.name)}"></div>
        <div><label>No HP</label><input id="profilePhone" value="${escapeHtml(user.phone || '')}"></div>
        <div><label>Alamat</label><input id="profileAddress" value="${escapeHtml(user.address || '')}"></div>
        <div><label>Password</label><input id="profilePassword" value="${escapeHtml(user.password || '')}"></div>
      </div>
      <button class="btn primary" style="margin-top:14px" onclick="saveProfile()">Simpan Profil</button>
    </div>`;
}

function saveProfile() {
  const data = getData();
  const user = data.users.find(u => u.username === session.username);
  user.name = document.getElementById('profileName').value.trim() || user.name;
  user.phone = document.getElementById('profilePhone').value.trim() || '-';
  user.address = document.getElementById('profileAddress').value.trim() || '-';
  user.password = document.getElementById('profilePassword').value.trim() || user.password;
  session.name = user.name;
  localStorage.setItem('kasir_session', JSON.stringify(session));
  data.activities.unshift(`Pelanggan mengedit profil ${session.username}`);
  saveData(data);
  showToast('Profil berhasil disimpan.');
  showApp();
}

function renderCustomerProducts() {
  const data = getData();
  setTitle('Belanja Produk Toko');
  const filters = getShopFilters();
  let products = data.products.filter(p => p.status === 'Aktif');
  if (filters.category !== 'Semua') products = products.filter(p => p.category === filters.category);
  if (filters.keyword) products = products.filter(p => `${p.name} ${p.category} ${p.description}`.toLowerCase().includes(filters.keyword));
  if (filters.sort === 'Termurah') products.sort((a, b) => a.price - b.price);
  if (filters.sort === 'Termahal') products.sort((a, b) => b.price - a.price);
  if (filters.sort === 'Terlaris') products.sort((a, b) => Number(b.sold || 0) - Number(a.sold || 0));
  if (filters.sort === 'Rating') products.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));

  const categories = ['Semua', ...new Set(data.products.map(p => p.category || 'Umum'))];
  const cartCount = data.cart.filter(c => c.customerUsername === session.username).reduce((sum, c) => sum + Number(c.qty || 0), 0);

  document.getElementById('mainContent').innerHTML = `
    <div class="shop-hero card">
      <div>
        <p class="eyebrow">CUSTOMER MARKETPLACE</p>
        <h2>Belanja Mudah Seperti Marketplace</h2>
        <p class="muted">Cari produk, pakai voucher, simpan wishlist, checkout, dan pantau pesanan secara offline.</p>
      </div>
      <div class="shop-hero-stats">
        <div><strong>${products.length}</strong><span>Produk</span></div>
        <div><strong>${cartCount}</strong><span>Item Keranjang</span></div>
        <div><strong>${data.vouchers.filter(v => v.active).length}</strong><span>Voucher</span></div>
      </div>
    </div>

    <div class="card shop-filter no-print">
      <div class="search-box"><span>🔎</span><input id="shopKeyword" value="${escapeHtml(filters.keyword)}" placeholder="Cari makanan, minuman, kategori..." oninput="renderCustomerProductsDebounced()"></div>
      <select id="shopSort" onchange="renderCustomerProducts()">${['Rekomendasi','Termurah','Termahal','Terlaris','Rating'].map(x => `<option ${x === filters.sort ? 'selected' : ''}>${x}</option>`).join('')}</select>
    </div>

    <div class="category-strip no-print">
      ${categories.map(cat => `<button class="category-chip ${cat === filters.category ? 'active' : ''}" onclick="setShopCategory('${cat.replaceAll("'", "\\'")}')">${cat}</button>`).join('')}
    </div>

    <div class="voucher-strip no-print">
      ${data.vouchers.filter(v => v.active).slice(0, 3).map(v => `<div class="voucher-mini"><strong>${v.code}</strong><span>${v.description}</span></div>`).join('')}
    </div>

    <div class="product-grid marketplace-grid" style="margin-top:18px">
      ${products.map(customerProductCard).join('') || '<div class="card"><p class="muted">Produk tidak ditemukan.</p></div>'}
    </div>`;
}

let shopTypingTimer = null;
function renderCustomerProductsDebounced() {
  clearTimeout(shopTypingTimer);
  shopTypingTimer = setTimeout(renderCustomerProducts, 300);
}

function getShopFilters() {
  return {
    keyword: (document.getElementById('shopKeyword')?.value || '').toLowerCase().trim(),
    sort: document.getElementById('shopSort')?.value || 'Rekomendasi',
    category: localStorage.getItem('kasir_shop_category') || 'Semua'
  };
}

function setShopCategory(category) {
  localStorage.setItem('kasir_shop_category', category);
  renderCustomerProducts();
}

function customerProductCard(p) {
  const data = getData();
  const wished = data.wishlist.some(w => w.customerUsername === session.username && w.productId === p.id);
  return `<div class="card product-card marketplace-card">
    <button class="wish-btn ${wished ? 'active' : ''}" onclick="toggleWishlist(${p.id})">${wished ? '♥' : '♡'}</button>
    <div class="product-img">${p.imageData ? `<img src="${p.imageData}" alt="${escapeHtml(p.name)}">` : (p.icon || '📦')}</div>
    <div class="product-body">
      <h3>${p.name}</h3>
      <p><span class="badge">${p.category}</span></p>
      <p class="market-meta">⭐ ${p.rating} · Terjual ${p.sold || 0}</p>
      <p class="price">${rupiah(p.price)}</p>
      <p class="stock-line">Stok ${p.stock}</p>
      <div class="actions product-actions">
        <button class="btn ghost" onclick="viewProductDetail(${p.id})">Detail</button>
        <button class="btn secondary" onclick="addToCart(${p.id})" ${p.stock <= 0 ? 'disabled' : ''}>Keranjang</button>
        <button class="btn primary" onclick="buyNow(${p.id})" ${p.stock <= 0 ? 'disabled' : ''}>Beli</button>
      </div>
    </div>
  </div>`;
}

function viewProductDetail(productId) {
  const data = getData();
  const p = data.products.find(x => x.id === productId);
  const html = `
    <div class="modal-backdrop" onclick="closeProductModal(event)">
      <div class="modal-card" onclick="event.stopPropagation()">
        <button class="modal-close" onclick="closeProductModal()">×</button>
        <div class="modal-product">
          <div class="modal-icon">${p.imageData ? `<img src="${p.imageData}" alt="${escapeHtml(p.name)}">` : (p.icon || '📦')}</div>
          <div>
            <p class="eyebrow">DETAIL PRODUK</p>
            <h2>${p.name}</h2>
            <p><span class="badge">${p.category}</span> <span class="badge green">⭐ ${p.rating}</span></p>
            <p class="price">${rupiah(p.price)}</p>
            <p>${p.description || '-'}</p>
            <p class="muted">Stok: ${p.stock} · Terjual: ${p.sold || 0}</p>
            <div class="actions">
              <button class="btn ghost" onclick="toggleWishlist(${p.id}); closeProductModal();">Wishlist</button>
              <button class="btn secondary" onclick="addToCart(${p.id}); closeProductModal();">Tambah Keranjang</button>
              <button class="btn primary" onclick="buyNow(${p.id}); closeProductModal();">Beli Sekarang</button>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
}

function closeProductModal(e) {
  if (e && !e.target.classList.contains('modal-backdrop')) return;
  document.querySelector('.modal-backdrop')?.remove();
}

function toggleWishlist(productId) {
  const data = getData();
  const exists = data.wishlist.some(w => w.customerUsername === session.username && w.productId === productId);
  const product = data.products.find(p => p.id === productId);
  if (exists) {
    data.wishlist = data.wishlist.filter(w => !(w.customerUsername === session.username && w.productId === productId));
    data.activities.unshift(`Pelanggan ${session.username} menghapus ${product.name} dari wishlist`);
  } else {
    data.wishlist.push({ customerUsername: session.username, productId, date: new Date().toISOString().slice(0, 10) });
    data.activities.unshift(`Pelanggan ${session.username} menyimpan ${product.name} ke wishlist`);
  }
  saveData(data);
  showToast(exists ? 'Dihapus dari wishlist.' : 'Disimpan ke wishlist.');
  if (activePage === 'products') renderCustomerProducts();
  if (activePage === 'wishlist') renderWishlist();
}

function buyNow(productId) {
  addToCart(productId);
  activePage = 'cart';
  renderMenu();
  renderCart();
}

function renderWishlist() {
  const data = getData();
  setTitle('Wishlist Saya');
  const wishedIds = data.wishlist.filter(w => w.customerUsername === session.username).map(w => w.productId);
  const products = data.products.filter(p => wishedIds.includes(p.id));
  document.getElementById('mainContent').innerHTML = `
    <div class="card shop-hero"><div><p class="eyebrow">WISHLIST</p><h2>Produk Favorit</h2><p class="muted">Simpan produk sebelum checkout supaya mudah ditemukan kembali.</p></div></div>
    <div class="product-grid marketplace-grid" style="margin-top:18px">
      ${products.map(customerProductCard).join('') || '<div class="card"><p class="muted">Wishlist masih kosong.</p></div>'}
    </div>`;
}

function renderVouchers() {
  const data = getData();
  setTitle('Voucher Belanja');
  document.getElementById('mainContent').innerHTML = `
    <div class="card shop-hero"><div><p class="eyebrow">PROMO CUSTOMER</p><h2>Voucher Tersedia</h2><p class="muted">Voucher akan otomatis dihitung di halaman keranjang jika memenuhi minimal belanja.</p></div></div>
    <div class="voucher-grid" style="margin-top:18px">
      ${data.vouchers.map(v => `<div class="card voucher-card">
        <div class="voucher-cut"></div>
        <div><strong>${v.title}</strong><h3>${v.code}</h3><p>${v.description}</p><span class="badge">Min. ${rupiah(v.minSpend)}</span></div>
        <button class="btn primary" onclick="copyVoucher('${v.code}')">Salin Kode</button>
      </div>`).join('')}
    </div>`;
}

function copyVoucher(code) {
  navigator.clipboard?.writeText(code);
  showToast(`Kode ${code} siap digunakan.`);
}

function addToCart(productId) {
  const data = getData();
  const p = data.products.find(x => x.id === productId);
  const item = data.cart.find(c => c.productId === productId && c.customerUsername === session.username);
  const currentQty = item ? item.qty : 0;
  if (currentQty + 1 > p.stock) return showToast('Stok tidak cukup.');
  if (item) item.qty += 1;
  else data.cart.push({ customerUsername: session.username, productId, qty: 1 });
  data.activities.unshift(`Pelanggan ${session.username} menambah ${p.name} ke keranjang`);
  saveData(data);
  showToast('Produk masuk keranjang.');
}

function getCurrentUser() {
  const data = getData();
  return data.users.find(u => u.username === session?.username);
}

function renderCart() {
  const data = getData();
  setTitle('Keranjang Belanja');
  const rows = data.cart
    .filter(item => item.customerUsername === session.username)
    .map(item => {
      const p = data.products.find(x => x.id === item.productId);
      return { ...item, product: p, subtotal: p ? p.price * item.qty : 0 };
    })
    .filter(r => r.product);
  const subtotal = rows.reduce((sum, r) => sum + r.subtotal, 0);
  const selectedVoucher = document.getElementById('cartVoucher')?.value || 'none';
  const voucher = data.vouchers.find(v => v.code === selectedVoucher && v.active && subtotal >= v.minSpend);
  const discount = voucher ? Math.min(voucher.type === 'percent' ? subtotal * voucher.value / 100 : voucher.value, voucher.maxDiscount || voucher.value) : 0;
  const serviceFee = rows.length ? 1000 : 0;
  const total = Math.max(0, subtotal - discount + serviceFee);
  document.getElementById('mainContent').innerHTML = `
    <div class="grid cart-layout">
      <div class="card">
        <h3>Item Keranjang</h3>
        ${rows.length === 0 ? '<p class="muted">Keranjang masih kosong.</p>' : rows.map(r => `
          <div class="cart-item marketplace-cart-item">
            <div class="cart-product-info"><span class="cart-icon">${r.product.icon || '📦'}</span><div><strong>${r.product.name}</strong><br><span class="muted">${rupiah(r.product.price)} x ${r.qty}</span></div></div>
            <div class="actions compact">
              <button class="btn ghost" onclick="editCartQty(${r.productId})">Edit Qty</button>
              <strong>${rupiah(r.subtotal)}</strong>
              <button class="btn danger" onclick="removeCart(${r.productId})">Hapus</button>
            </div>
          </div>`).join('')}
      </div>
      <div class="card checkout-card">
        <h3>Ringkasan Checkout</h3>
        <div class="checkout-row"><span>Subtotal</span><strong>${rupiah(subtotal)}</strong></div>
        <div><label>Voucher</label><select id="cartVoucher" onchange="renderCart()"><option value="none">Tanpa Voucher</option>${data.vouchers.map(v => `<option value="${v.code}" ${selectedVoucher === v.code ? 'selected' : ''}>${v.code} - Min ${rupiah(v.minSpend)}</option>`).join('')}</select></div>
        <div class="checkout-row"><span>Diskon</span><strong class="discount">-${rupiah(discount)}</strong></div>
        <div class="checkout-row"><span>Biaya layanan offline</span><strong>${rupiah(serviceFee)}</strong></div>
        <hr>
        <div class="checkout-row total"><span>Total Bayar</span><strong>${rupiah(total)}</strong></div>
        <div style="margin-top:12px"><label>Pembayaran</label><select id="paymentMethod"><option>Tunai</option><option>Transfer</option><option>QRIS</option></select></div>
        <div style="margin-top:12px"><label>Alamat Pengiriman / Ambil</label><input id="shippingAddress" value="${escapeHtml(getCurrentUser()?.address || '')}" placeholder="Alamat pelanggan"></div>
        <div style="margin-top:12px"><label>Catatan</label><input id="orderNote" placeholder="Contoh: tanpa gula, ambil jam 3"></div>
        <button class="btn primary full" onclick="checkout()" ${rows.length === 0 ? 'disabled' : ''}>Buat Pesanan</button>
      </div>
    </div>`;
}

function editCartQty(productId) {
  const data = getData();
  const item = data.cart.find(c => c.productId === productId && c.customerUsername === session.username);
  const product = data.products.find(p => p.id === productId);
  const qty = Number(prompt(`Edit jumlah ${product.name}:`, item.qty));
  if (!qty || qty < 1) return showToast('Jumlah tidak valid.');
  if (qty > product.stock) return showToast('Jumlah melebihi stok.');
  item.qty = qty;
  data.activities.unshift(`Pelanggan ${session.username} mengedit jumlah ${product.name} di keranjang`);
  saveData(data);
  renderCart();
}

function removeCart(productId) {
  const data = getData();
  data.cart = data.cart.filter(c => !(c.productId === productId && c.customerUsername === session.username));
  data.activities.unshift(`Pelanggan ${session.username} menghapus item dari keranjang`);
  saveData(data);
  renderCart();
}

function checkout() {
  const data = getData();
  const customerCart = data.cart.filter(c => c.customerUsername === session.username);
  if (customerCart.length === 0) return;

  const detail = [];
  for (const item of customerCart) {
    const p = data.products.find(x => x.id === item.productId);
    if (!p || p.stock < item.qty) return showToast(`Stok ${p ? p.name : 'produk'} tidak cukup.`);
    p.stock -= item.qty;
    p.sold = Number(p.sold || 0) + Number(item.qty || 0);
    detail.push({ productId: p.id, name: p.name, qty: item.qty, price: p.price });
  }

  const subtotal = detail.reduce((sum, item) => sum + item.price * item.qty, 0);
  const selectedVoucher = document.getElementById('cartVoucher')?.value || 'none';
  const voucher = data.vouchers.find(v => v.code === selectedVoucher && v.active && subtotal >= v.minSpend);
  const discount = voucher ? Math.min(voucher.type === 'percent' ? subtotal * v.value / 100 : v.value, voucher.maxDiscount || voucher.value) : 0;
  const serviceFee = 1000;
  const total = Math.max(0, subtotal - discount + serviceFee);
  const id = `TRX-${String(data.transactions.length + 1).padStart(3, '0')}`;
  const payment = document.getElementById('paymentMethod')?.value || 'Tunai';
  const note = document.getElementById('orderNote')?.value || '-';
  const shippingAddress = document.getElementById('shippingAddress')?.value || getCurrentUser()?.address || '-';
  data.transactions.unshift({
    id,
    customer: session.name,
    customerUsername: session.username,
    items: detail,
    payment,
    note,
    shippingAddress,
    voucherCode: voucher ? voucher.code : '-',
    discount,
    serviceFee,
    subtotal,
    total,
    status: 'Dikemas',
    date: new Date().toISOString().slice(0, 10)
  });
  data.activities.unshift(`Pelanggan ${session.username} checkout transaksi ${id}`);
  data.cart = data.cart.filter(c => c.customerUsername !== session.username);
  saveData(data);
  showToast('Checkout berhasil. Transaksi dibuat.');
  renderCart();
}

function updateOrder(id, status) {
  const data = getData();
  const trx = data.transactions.find(t => t.id === id);
  trx.status = status;
  data.activities.unshift(`${ROLE_LABEL[session.role]} mengubah status ${id} menjadi ${status}`);
  saveData(data);
  renderPage();
}

function editTransaction(id) {
  const data = getData();
  const trx = data.transactions.find(t => t.id === id);
  const payment = prompt('Edit metode pembayaran:', trx.payment || 'Tunai');
  if (payment === null) return;
  const note = prompt('Edit catatan transaksi:', trx.note || '-');
  if (note === null) return;
  const status = prompt('Edit status transaksi: Diproses / Selesai / Dibatalkan', trx.status);
  if (status === null) return;
  const allowed = ['Diproses', 'Dikemas', 'Dikirim', 'Selesai', 'Dibatalkan'];
  if (!allowed.includes(status)) return showToast('Status tidak valid.');
  Object.assign(trx, { payment: payment.trim() || 'Tunai', note: note.trim() || '-', status });
  data.activities.unshift(`${ROLE_LABEL[session.role]} mengedit transaksi ${id}`);
  saveData(data);
  renderPage();
}

function showTransactionDetail(id) {
  const data = getData();
  const trx = data.transactions.find(t => t.id === id);
  const detail = trx.items.map(item => `${item.name} x${item.qty} @ ${rupiah(item.price)} = ${rupiah(item.price * item.qty)}`).join('\n');
  alert(`Detail ${trx.id}\n\nPelanggan: ${trx.customer}\nTanggal: ${trx.date}\nStatus: ${trx.status}\nPembayaran: ${trx.payment}\nAlamat: ${trx.shippingAddress || '-'}\nVoucher: ${trx.voucherCode || '-'}\nDiskon: ${rupiah(trx.discount || 0)}\nCatatan: ${trx.note}\n\nItem:\n${detail}\n\nTotal: ${rupiah(trx.total)}`);
}


function renderCustomerOrders(list) {
  const tabs = ['Semua', 'Dikemas', 'Dikirim', 'Selesai', 'Dibatalkan'];
  const current = localStorage.getItem('kasir_order_tab') || 'Semua';
  const rows = current === 'Semua' ? list : list.filter(t => t.status === current);
  document.getElementById('mainContent').innerHTML = `
    <div class="order-tabs no-print">${tabs.map(tab => `<button class="category-chip ${tab === current ? 'active' : ''}" onclick="setOrderTab('${tab}')">${tab}</button>`).join('')}</div>
    <div class="orders-list">
      ${rows.map(customerOrderCard).join('') || '<div class="card"><p class="muted">Belum ada pesanan.</p></div>'}
    </div>`;
}

function setOrderTab(tab) {
  localStorage.setItem('kasir_order_tab', tab);
  renderHistory();
}

function customerOrderCard(t) {
  const step = t.status === 'Dikemas' || t.status === 'Diproses' ? 1 : t.status === 'Dikirim' ? 2 : t.status === 'Selesai' ? 3 : 0;
  return `<div class="card order-card">
    <div class="order-head"><div><strong>${t.id}</strong><span>${t.date}</span></div><span class="badge ${t.status === 'Selesai' ? 'green' : t.status === 'Dibatalkan' ? 'red' : ''}">${t.status}</span></div>
    <div class="tracking"><span class="${step >= 1 ? 'done' : ''}">Dikemas</span><i></i><span class="${step >= 2 ? 'done' : ''}">Dikirim</span><i></i><span class="${step >= 3 ? 'done' : ''}">Selesai</span></div>
    <div>${(t.items || []).map(item => `<div class="cart-item"><span>${item.name} x${item.qty}</span><strong>${rupiah(item.price * item.qty)}</strong></div>`).join('')}</div>
    <div class="checkout-row"><span>Subtotal</span><strong>${rupiah(t.subtotal || t.total)}</strong></div>
    <div class="checkout-row"><span>Voucher</span><strong>${t.voucherCode || '-'} (${rupiah(t.discount || 0)})</strong></div>
    <div class="checkout-row total"><span>Total</span><strong>${rupiah(t.total)}</strong></div>
    <p class="muted">Pembayaran: ${t.payment || '-'} · Alamat: ${t.shippingAddress || '-'}</p>
    <div class="actions">
      <button class="btn ghost" onclick="showTransactionDetail('${t.id}')">Detail</button>
      ${(t.status === 'Dikemas' || t.status === 'Diproses') ? `<button class="btn danger" onclick="cancelMyOrder('${t.id}')">Batalkan</button>` : ''}
      ${t.status === 'Dikirim' ? `<button class="btn success" onclick="confirmReceived('${t.id}')">Pesanan Diterima</button>` : ''}
    </div>
  </div>`;
}

function cancelMyOrder(id) {
  if (!confirm('Batalkan pesanan ini?')) return;
  const data = getData();
  const trx = data.transactions.find(t => t.id === id && t.customerUsername === session.username);
  if (!trx) return;
  trx.status = 'Dibatalkan';
  data.activities.unshift(`Pelanggan ${session.username} membatalkan pesanan ${id}`);
  saveData(data);
  renderHistory();
}

function confirmReceived(id) {
  const data = getData();
  const trx = data.transactions.find(t => t.id === id && t.customerUsername === session.username);
  if (!trx) return;
  trx.status = 'Selesai';
  data.activities.unshift(`Pelanggan ${session.username} menyelesaikan pesanan ${id}`);
  saveData(data);
  renderHistory();
}

function productMiniList(products) {
  return products.slice(0, 4).map(p => `<div class="cart-item"><span>${p.icon || '📦'} ${p.name}</span><strong>${rupiah(p.price)}</strong></div>`).join('');
}

function transactionMiniList(transactions) {
  return transactions.slice(0, 4).map(t => `<div class="cart-item"><span>${t.id} - ${itemsText(t.items)}</span><strong>${rupiah(t.total)}</strong></div>`).join('');
}

function itemsText(items) {
  return (items || []).map(item => `${item.name} x${item.qty}`).join(', ');
}

function transactionTable(transactions, mode = 'view') {
  const canEdit = mode === 'master' || mode === 'owner';
  return `<div class="card">
    <h3>Daftar Transaksi</h3>
    ${transactions.length === 0 ? '<p class="muted">Belum ada transaksi.</p>' : `
    <div class="table-wrap"><table>
      <thead><tr><th>ID</th><th>Pelanggan</th><th>Item</th><th>Total</th><th>Status</th><th>Pembayaran</th><th>Tanggal</th><th>Aksi</th></tr></thead>
      <tbody>${transactions.map(t => `<tr>
        <td>${t.id}</td><td>${t.customer}</td><td>${itemsText(t.items)}</td><td>${rupiah(t.total)}</td>
        <td><span class="badge ${t.status === 'Selesai' ? 'green' : t.status === 'Dibatalkan' ? 'red' : ''}">${t.status}</span></td>
        <td>${t.payment || '-'}</td><td>${t.date}</td>
        <td class="actions compact">
          <button class="btn ghost" onclick="showTransactionDetail('${t.id}')">Detail</button>
          ${canEdit ? `<button class="btn secondary" onclick="editTransaction('${t.id}')">Edit</button>
          <button class="btn success" onclick="updateOrder('${t.id}', 'Selesai')">Selesai</button>
          <button class="btn danger" onclick="updateOrder('${t.id}', 'Dibatalkan')">Batal</button>` : ''}
        </td>
      </tr>`).join('')}</tbody>
    </table></div>`}
  </div>`;
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[c]));
}

document.getElementById('loginForm').addEventListener('submit', login);
getData();
if (session) showApp();
