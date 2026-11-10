/**
 * Admin Panel — Yönetici Giriş, Dashboard, Mesaj Yönetimi
 * ========================================================
 *
 * BU DOSYA: Admin panelinin tüm işlevlerini yönetir.
 *
 * ÖZELLİKLER:
 * - Basit şifre ile giriş (demo amaçlı)
 * - localStorage'dan mesajları okuma
 * - İstatistik kartlarını güncelleme
 * - Mesaj listesi ve detay görüntüleme
 * - Mesaj durumu değiştirme (Yeni/Okundu/Yanıtlandı)
 * - Mesaj silme
 *
 * DEĞİŞTİRMEK İÇİN:
 * - ADMIN_PASSWORD_HASH: Giriş şifresinin SHA-256 özeti
 * - STORAGE_KEY: localStorage anahtar adını değiştirin
 * - Gerçek bir backend eklendiğinde fetch() ile API'ye bağlanılabilir
 *
 * GÜVENLİK NOTU:
 * Bu panel DEMO amaçlıdır. Gerçek üretimde sunucu taraflı
 * kimlik doğrulama (session/JWT) kullanılmalıdır.
 */
(function () {
  'use strict';

  /* ---- Ayarlar ---- */
  /* Şifrenin kendisi değil, SHA-256 özeti saklanır — kodda şifre görünmez.
     DEĞİŞTİRMEK İÇİN: yeni şifrenin SHA-256 özetini (küçük harf hex) buraya yazın.
     PowerShell: $s=[Security.Cryptography.SHA256]::Create(); ($s.ComputeHash([Text.Encoding]::UTF8.GetBytes('YENI_SIFRE'))|%{$_.ToString('x2')}) -join '' */
  var ADMIN_PASSWORD_HASH = 'e9718687a9faa98575e03553a6c1fd28c096ef328be2e2a29287f5038cf5562f';

  /** UTF-8 metnin SHA-256 özeti (hex). Senkron; http üzerinde de çalışır. */
  function sha256(text) {
    var bytes = unescape(encodeURIComponent(text));
    var K = [], H = [], i, j;
    var isPrime = function (n) { for (var d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; };
    for (var n = 2, c = 0; c < 64; n++) {
      if (isPrime(n)) {
        if (c < 8) H[c] = (Math.pow(n, 1 / 2) * 4294967296) | 0;
        K[c++] = (Math.pow(n, 1 / 3) * 4294967296) | 0;
      }
    }
    var len = bytes.length, words = [];
    for (i = 0; i < len; i++) words[i >> 2] |= bytes.charCodeAt(i) << (24 - (i % 4) * 8);
    words[len >> 2] |= 0x80 << (24 - (len % 4) * 8);
    words[(((len + 8) >> 6) << 4) + 15] = len * 8;
    var rotr = function (x, r) { return (x >>> r) | (x << (32 - r)); };
    for (i = 0; i < words.length; i += 16) {
      var w = [], a = H.slice(0);
      for (j = 0; j < 16; j++) w[j] = words[i + j] | 0;
      for (j = 0; j < 64; j++) {
        if (j >= 16) {
          var w15 = w[j - 15], w2 = w[j - 2];
          w[j] = (w[j - 16] + (rotr(w15, 7) ^ rotr(w15, 18) ^ (w15 >>> 3)) +
                  w[j - 7] + (rotr(w2, 17) ^ rotr(w2, 19) ^ (w2 >>> 10))) | 0;
        }
        var e = a[4];
        var t1 = a[7] + (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) + ((e & a[5]) ^ (~e & a[6])) + K[j] + w[j];
        var t2 = (rotr(a[0], 2) ^ rotr(a[0], 13) ^ rotr(a[0], 22)) + ((a[0] & a[1]) ^ (a[0] & a[2]) ^ (a[1] & a[2]));
        a = [(t1 + t2) | 0].concat(a.slice(0, 7));
        a[4] = (a[4] + t1) | 0;
      }
      for (j = 0; j < 8; j++) H[j] = (H[j] + a[j]) | 0;
    }
    var hex = '';
    for (i = 0; i < 8; i++) hex += ('00000000' + (H[i] >>> 0).toString(16)).slice(-8);
    return hex;
  }

  /* localStorage anahtarı — form-validation.js ile aynı olmalı */
  var STORAGE_KEY = 'solarenerji_messages';

  /* Oturum anahtarı */
  var SESSION_KEY = 'solarenerji_admin_session';

  /* ---- DOM Referansları ---- */
  var loginSection = document.getElementById('admin-login');
  var dashboardSection = document.getElementById('admin-dashboard');
  var loginForm = document.getElementById('login-form');
  var loginError = document.getElementById('login-error');
  var logoutBtn = document.getElementById('logout-btn');
  var messagesList = document.getElementById('messages-list');
  var emptyState = document.getElementById('empty-state');
  var detailModal = document.getElementById('message-detail');
  var detailContent = document.getElementById('detail-content');
  var detailClose = document.getElementById('detail-close');

  /* Şu an görüntülenen mesaj index'i */
  var currentMessageIndex = null;

  /* ---- Oturum Yönetimi ---- */

  /**
   * Oturum durumunu kontrol et
   * sessionStorage kullanıyoruz — sekme kapanınca oturum biter
   */
  function checkSession() {
    var session = sessionStorage.getItem(SESSION_KEY);
    if (session === 'active') {
      showDashboard();
    } else {
      showLogin();
    }
  }

  /** Giriş ekranını göster */
  function showLogin() {
    loginSection.style.display = 'block';
    dashboardSection.classList.remove('visible');
  }

  /** Dashboard'u göster ve verileri yükle */
  function showDashboard() {
    loginSection.style.display = 'none';
    dashboardSection.classList.add('visible');
    loadMessages();
  }

  /* ---- Giriş İşlemi ---- */
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var password = document.getElementById('admin-password').value;

      if (sha256(password) === ADMIN_PASSWORD_HASH) {
        /* Şifre doğru — oturumu başlat */
        sessionStorage.setItem(SESSION_KEY, 'active');
        loginError.classList.remove('visible');
        showDashboard();
      } else {
        /* Şifre yanlış — hata göster */
        loginError.classList.add('visible');
      }
    });
  }

  /* ---- Çıkış İşlemi ---- */
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      sessionStorage.removeItem(SESSION_KEY);
      showLogin();
      /* Şifre alanını temizle */
      document.getElementById('admin-password').value = '';
    });
  }

  /* ---- Mesaj Yükleme ve Listeleme ---- */

  /**
   * localStorage'dan mesajları oku ve göster
   * form-validation.js tarafından kaydedilen mesajlar okunur
   */
  function loadMessages() {
    var messages = getMessages();

    /* İstatistikleri güncelle */
    updateStats(messages);

    /* Mesaj listesini oluştur */
    renderMessageList(messages);
  }

  /** localStorage'dan mesaj dizisini al */
  function getMessages() {
    try {
      var data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  /** Mesajları localStorage'a kaydet */
  function saveMessages(messages) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }

  /**
   * İstatistik kartlarını güncelle
   * Toplam mesaj + hizmet bazlı dağılım
   */
  function updateStats(messages) {
    var total = messages.length;
    var solar = 0;
    var camera = 0;
    var eng = 0;

    messages.forEach(function (msg) {
      var svc = msg.service || msg.source_page || '';
      if (svc === 'gunes-enerjisi') solar++;
      else if (svc === 'kamera') camera++;
      else if (svc === 'muhendislik') eng++;
    });

    /* DOM'u güncelle */
    var statTotal = document.getElementById('stat-total');
    var statSolar = document.getElementById('stat-solar');
    var statCamera = document.getElementById('stat-camera');
    var statEng = document.getElementById('stat-eng');

    if (statTotal) statTotal.textContent = total;
    if (statSolar) statSolar.textContent = solar;
    if (statCamera) statCamera.textContent = camera;
    if (statEng) statEng.textContent = eng;
  }

  /**
   * Mesaj listesini HTML olarak oluştur
   * Son 10 mesajı yeniden eskiye sıralar
   */
  function renderMessageList(messages) {
    if (!messagesList) return;

    /* Mesaj yoksa boş durum göster */
    if (messages.length === 0) {
      messagesList.innerHTML = '';
      messagesList.appendChild(emptyState);
      emptyState.style.display = 'block';
      return;
    }

    /* Son 10 mesajı al (yeniden eskiye) */
    var recent = messages.slice(-10).reverse();

    var html = '';
    recent.forEach(function (msg, i) {
      /* Gerçek index'i hesapla (orijinal dizideki) */
      var realIndex = messages.length - 1 - i;

      /* Durum badge'i */
      var status = msg.status || 'new';
      var statusClass = 'status-badge--' + status;
      var statusText = status === 'new' ? 'Yeni' : (status === 'read' ? 'Okundu' : 'Yanıtlandı');

      /* Tarih formatla */
      var date = msg.date ? new Date(msg.date).toLocaleDateString('tr-TR') : '-';

      html += '<div class="admin-message-item" data-index="' + realIndex + '">' +
        '<div><div class="admin-message-item__name">' + escapeHtml(msg.name || 'İsimsiz') + '</div></div>' +
        '<div class="admin-message-item__subject">' + escapeHtml(msg.subject || 'Konu belirtilmemiş') + '</div>' +
        '<div><span class="status-badge ' + statusClass + '">' + statusText + '</span></div>' +
        '<div class="admin-message-item__date">' + date + '</div>' +
        '</div>';
    });

    messagesList.innerHTML = html;

    /* Mesaj satırlarına tıklama olayı ekle */
    var items = messagesList.querySelectorAll('.admin-message-item');
    items.forEach(function (item) {
      item.addEventListener('click', function () {
        var index = parseInt(this.getAttribute('data-index'));
        showMessageDetail(index);
      });
    });
  }

  /* ---- Mesaj Detay Modalı ---- */

  /** Mesaj detayını modal içinde göster */
  function showMessageDetail(index) {
    var messages = getMessages();
    var msg = messages[index];
    if (!msg) return;

    currentMessageIndex = index;

    /* Hizmet adını insan-okuyabilir formata çevir */
    var serviceNames = {
      'gunes-enerjisi': 'Güneş Enerjisi',
      'kamera': 'Güvenlik Sistemleri',
      'muhendislik': 'Mühendislik',
      'diger': 'Diğer'
    };

    var serviceName = serviceNames[msg.service] || serviceNames[msg.source_page] || 'Belirtilmemiş';
    var date = msg.date ? new Date(msg.date).toLocaleString('tr-TR') : '-';

    /* Detay HTML'ini oluştur */
    detailContent.innerHTML =
      '<div class="detail-row"><div class="detail-row__label">İsim:</div><div class="detail-row__value">' + escapeHtml(msg.name || '-') + '</div></div>' +
      '<div class="detail-row"><div class="detail-row__label">E-posta:</div><div class="detail-row__value">' + escapeHtml(msg.email || '-') + '</div></div>' +
      '<div class="detail-row"><div class="detail-row__label">Telefon:</div><div class="detail-row__value">' + escapeHtml(msg.phone || '-') + '</div></div>' +
      '<div class="detail-row"><div class="detail-row__label">Hizmet:</div><div class="detail-row__value">' + serviceName + '</div></div>' +
      '<div class="detail-row"><div class="detail-row__label">Konu:</div><div class="detail-row__value">' + escapeHtml(msg.subject || '-') + '</div></div>' +
      '<div class="detail-row"><div class="detail-row__label">Kaynak:</div><div class="detail-row__value">' + escapeHtml(msg.source_page || 'Doğrudan') + '</div></div>' +
      '<div class="detail-row"><div class="detail-row__label">Tarih:</div><div class="detail-row__value">' + date + '</div></div>' +
      '<hr style="margin:var(--space-4) 0;border-color:var(--border-color)">' +
      '<div class="detail-row"><div class="detail-row__label">Mesaj:</div></div>' +
      '<p style="color:var(--text-secondary);line-height:var(--lh-relaxed)">' + escapeHtml(msg.message || '-') + '</p>';

    /* Modalı göster */
    detailModal.classList.add('visible');
  }

  /** Modalı kapat */
  function closeDetail() {
    detailModal.classList.remove('visible');
    currentMessageIndex = null;
  }

  /* Modal kapatma olayları */
  if (detailClose) {
    detailClose.addEventListener('click', closeDetail);
  }
  if (detailModal) {
    detailModal.addEventListener('click', function (e) {
      if (e.target === detailModal) closeDetail();
    });
  }

  /* ---- Durum Değiştirme ---- */

  /** Mesaj durumunu güncelle */
  function updateMessageStatus(status) {
    if (currentMessageIndex === null) return;
    var messages = getMessages();
    if (messages[currentMessageIndex]) {
      messages[currentMessageIndex].status = status;
      saveMessages(messages);
      loadMessages();
      closeDetail();
    }
  }

  /* Durum butonları */
  var btnRead = document.getElementById('btn-mark-read');
  var btnReplied = document.getElementById('btn-mark-replied');
  var btnDelete = document.getElementById('btn-delete-msg');

  if (btnRead) {
    btnRead.addEventListener('click', function () {
      updateMessageStatus('read');
    });
  }

  if (btnReplied) {
    btnReplied.addEventListener('click', function () {
      updateMessageStatus('replied');
    });
  }

  /* Mesaj silme */
  if (btnDelete) {
    btnDelete.addEventListener('click', function () {
      if (currentMessageIndex === null) return;
      if (!confirm('Bu mesajı silmek istediğinize emin misiniz?')) return;

      var messages = getMessages();
      messages.splice(currentMessageIndex, 1);
      saveMessages(messages);
      loadMessages();
      closeDetail();
    });
  }

  /* ---- Yardımcı Fonksiyonlar ---- */

  /** XSS koruması — HTML karakter kaçışı */
  function escapeHtml(text) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  }

  /* ---- Başlatma ---- */
  checkSession();

})();
