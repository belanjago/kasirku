/*
  KASIRKU SUPABASE ADAPTER
  Tahap ini membuat file siap-online tanpa menghapus mode offline.
  Aplikasi utama masih bisa jalan offline. File ini menyediakan koneksi,
  backup data offline ke Supabase, dan restore data dari Supabase.
*/
(function () {
  const cfg = window.KASIRKU_CONFIG || {};
  const isConfigured = cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && !cfg.SUPABASE_URL.includes('ISI_') && !cfg.SUPABASE_ANON_KEY.includes('ISI_');

  function showOnlineBadge() {
    const badge = document.createElement('div');
    badge.className = 'online-badge';
    badge.innerHTML = cfg.APP_MODE === 'online' && isConfigured
      ? '🟢 Online Ready: Supabase aktif'
      : '🟡 Offline Mode: isi online-config.js untuk online';
    document.body.appendChild(badge);
  }

  window.addEventListener('DOMContentLoaded', showOnlineBadge);

  if (!window.supabase || !isConfigured) {
    window.KasirCloud = {
      enabled: false,
      message: 'Supabase belum dikonfigurasi. Mode offline tetap aktif.'
    };
    return;
  }

  const client = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);

  async function getDefaultStoreId() {
    let { data: store, error } = await client.from('stores').select('*').eq('owner_username', 'pemilik').limit(1).single();
    if (error || !store) {
      const result = await client.from('stores').insert({ owner_username: 'pemilik', name: cfg.DEFAULT_STORE_NAME || 'Toko Saya' }).select().single();
      store = result.data;
    }
    return store.id;
  }

  async function backupLocalToSupabase() {
    const local = JSON.parse(localStorage.getItem('kasir_data') || '{}');
    const storeId = await getDefaultStoreId();

    if (Array.isArray(local.employees)) {
      for (const e of local.employees) {
        await client.from('employees').insert({
          store_id: storeId,
          name: e.name,
          position: e.position,
          phone: e.phone,
          email: e.email,
          shift: e.shift,
          salary: e.salary || 0,
          status: e.status || 'Aktif',
          address: e.address
        });
      }
    }

    if (Array.isArray(local.products)) {
      for (const p of local.products) {
        await client.from('products').insert({
          store_id: storeId,
          sku: p.sku,
          barcode: p.barcode,
          name: p.name,
          category: p.category,
          price: p.price || 0,
          cost_price: p.costPrice || 0,
          stock: p.stock || 0,
          min_stock: p.minStock || 0,
          icon: p.icon || '📦',
          image_url: p.imageData || '',
          description: p.description || '',
          weight: p.weight || 0,
          condition: p.condition || 'Baru',
          status: p.status || 'Aktif',
          rating: p.rating || 4.8,
          sold: p.sold || 0
        });
      }
    }

    alert('Backup data offline ke Supabase selesai. Cek tabel Supabase.');
  }

  async function restoreProductsFromSupabase() {
    const storeId = await getDefaultStoreId();
    const { data: products, error } = await client.from('products').select('*').eq('store_id', storeId);
    if (error) return alert('Gagal ambil produk: ' + error.message);

    const local = JSON.parse(localStorage.getItem('kasir_data') || '{}');
    local.products = (products || []).map(p => ({
      id: p.id,
      sku: p.sku,
      barcode: p.barcode,
      name: p.name,
      category: p.category,
      price: Number(p.price || 0),
      costPrice: Number(p.cost_price || 0),
      stock: Number(p.stock || 0),
      minStock: Number(p.min_stock || 0),
      icon: p.icon || '📦',
      imageData: p.image_url || '',
      description: p.description || '',
      weight: Number(p.weight || 0),
      condition: p.condition || 'Baru',
      status: p.status || 'Aktif',
      rating: p.rating || 4.8,
      sold: p.sold || 0
    }));
    localStorage.setItem('kasir_data', JSON.stringify(local));
    alert('Produk dari Supabase berhasil dimuat ke aplikasi lokal. Refresh halaman.');
  }

  window.KasirCloud = {
    enabled: true,
    client,
    backupLocalToSupabase,
    restoreProductsFromSupabase
  };
})();
