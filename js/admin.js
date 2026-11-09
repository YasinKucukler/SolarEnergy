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
 * - ADMIN_PASSWORD: Giriş şifresini değiştirin (satır 26)
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
  /* DEĞİŞTİRMEK İÇİN: Bu şifreyi kendi şifrenizle değiştirin */
  var ADMIN_PASSWORD = 'admin123';

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

      if (password === ADMIN_PASSWORD) {
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
