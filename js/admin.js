/**
 * Admin Panel — Giriş, Mesajlar, Projeler, Site Ayarları, Bildirimler
 * ===================================================================
 *
 * BU DOSYA: admin.html'in tüm işlevlerini yönetir.
 *
 * VERİ NEREDE?
 * - Mesajlar: localStorage (solarenerji_messages) — form-validation.js yazar.
 *   Yalnızca BU tarayıcıda gönderilen formlar görünür; asıl kopya Formspree e-postasıdır.
 * - Projeler + site ayarları: yayındaki hali data/site-content.json; panelde yapılan
 *   değişiklikler önce TASLAK olarak localStorage'da tutulur (solarenerji_content_draft).
 *   "Yayınla" → site-content.json indirilir → `npm run content -- <dosya>` HTML'e yazar.
 *
 * DEĞİŞTİRMEK İÇİN:
 * - ADMIN_PASSWORD_HASH: giriş şifresinin SHA-256 özeti
 * - GALLERY_CATEGORIES: sitede proje galerisi olan kategoriler
 *   (HTML'de <!-- cms:projects:KATEGORI:start --> işareti eklendiğinde buraya da ekleyin)
 *
 * GÜVENLİK NOTU:
 * Şifre kontrolü tarayıcıda yapılır; bu panel gizli veri barındırmaz (mesajlar zaten
 * yalnızca bu tarayıcıda). Gerçek çok kullanıcılı kullanım için sunucu taraflı giriş gerekir.
 */
(function () {
  'use strict';

  /* ---- Ayarlar ---- */
  /* Şifrenin kendisi değil, SHA-256 özeti saklanır — kodda şifre görünmez.
     DEĞİŞTİRMEK İÇİN: yeni şifrenin SHA-256 özetini (küçük harf hex) buraya yazın.
     PowerShell: $s=[Security.Cryptography.SHA256]::Create(); ($s.ComputeHash([Text.Encoding]::UTF8.GetBytes('YENI_SIFRE'))|%{$_.ToString('x2')}) -join '' */
  var ADMIN_PASSWORD_HASH = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9';

  /* localStorage anahtarları — STORAGE_KEY form-validation.js ile aynı olmalı */
  var STORAGE_KEY = 'solarenerji_messages';
  var SESSION_KEY = 'solarenerji_admin_session';
  var DRAFT_KEY = 'solarenerji_content_draft';
  var NOTIFY_KEY = 'solarenerji_admin_notify';
  var TAB_KEY = 'solarenerji_admin_tab';
  var CONTENT_URL = 'data/site-content.json';

  var PAGE_SIZE = 20;
  var GALLERY_CATEGORIES = ['muhendislik'];

  var SERVICE_NAMES = {
    'gunes-enerjisi': 'Güneş Enerjisi',
    'kamera': 'Güvenlik Sistemleri',
    'muhendislik': 'Mühendislik',
    'diger': 'Diğer'
  };
  var CATEGORY_CLASS = { 'gunes-enerjisi': 'solar', 'kamera': 'camera', 'muhendislik': 'engineering' };
  var STATUS_TEXT = { 'new': 'Yeni', 'read': 'Okundu', 'replied': 'Yanıtlandı' };
  var ICONS = {
    'gunes-enerjisi': ['fa-solar-panel', 'fa-sun', 'fa-bolt', 'fa-battery-full', 'fa-house', 'fa-tractor'],
    'kamera': ['fa-video', 'fa-shield-halved', 'fa-house-lock', 'fa-bolt', 'fa-eye', 'fa-store'],
    'muhendislik': ['fa-cube', 'fa-print', 'fa-code', 'fa-drafting-compass', 'fa-microchip', 'fa-gears']
  };
  var ICON_LABELS = {
    'fa-solar-panel': 'Güneş paneli', 'fa-sun': 'Güneş', 'fa-bolt': 'Şimşek', 'fa-battery-full': 'Batarya',
    'fa-house': 'Ev', 'fa-tractor': 'Tarım', 'fa-video': 'Kamera', 'fa-shield-halved': 'Kalkan',
    'fa-house-lock': 'Güvenli ev', 'fa-eye': 'Göz', 'fa-store': 'İşyeri', 'fa-cube': 'Küp',
    'fa-print': 'Yazıcı', 'fa-code': 'Kod', 'fa-drafting-compass': 'Pergel', 'fa-microchip': 'Çip', 'fa-gears': 'Dişliler'
  };

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

  /* ==========================================================
     YARDIMCILAR
     ========================================================== */
  var $ = function (id) { return document.getElementById(id); };

  /** Seçiciye uyan her öğe için fn çalıştır (root verilmezse tüm belge) */
  function each(selector, fn, root) {
    Array.prototype.forEach.call((root || document).querySelectorAll(selector), fn);
  }

  /** id'si eşleşen kaydın dizideki sırası; yoksa -1 (mesajlar ve projeler için) */
  function indexById(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return i;
    return -1;
  }

  /** XSS koruması — metni HTML'e (ve öznitelik değerine) güvenle koy */
  function esc(text) {
    return String(text == null ? '' : text)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function store(kind, key, value) {
    try {
      var s = kind === 'session' ? sessionStorage : localStorage;
      if (value === undefined) return s.getItem(key);
      if (value === null) s.removeItem(key); else s.setItem(key, value);
      return true;
    } catch (e) {
      return value === undefined ? null : false;
    }
  }

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function toast(text, isError) {
    var box = $('admin-toasts');
    var el = document.createElement('div');
    el.className = 'admin-toast' + (isError ? ' admin-toast--error' : '');
    el.textContent = text;
    box.appendChild(el);
    setTimeout(function () { el.remove(); }, isError ? 6000 : 3000);
  }

  function lower(s) { return String(s || '').toLocaleLowerCase('tr-TR'); }

  /** Türkiye numarasını +90XXXXXXXXXX biçimine çevirir; olmuyorsa '' */
  function normalizePhone(v) {
    var d = String(v || '').replace(/\D/g, '');
    if (d.length === 12 && d.indexOf('90') === 0) return '+' + d;
    if (d.length === 11 && d.charAt(0) === '0') return '+9' + d;
    if (d.length === 10 && d.charAt(0) !== '0') return '+90' + d;
    return '';
  }

  function displayPhone(e164) {
    var d = String(e164 || '').replace(/\D/g, '').slice(2);
    if (d.length !== 10) return e164 || '';
    return '+90 (' + d.slice(0, 3) + ') ' + d.slice(3, 6) + ' ' + d.slice(6, 8) + ' ' + d.slice(8);
  }

  function formatDate(iso, withTime) {
    if (!iso) return '-';
    var d = new Date(iso);
    if (isNaN(d)) return '-';
    if (withTime) return d.toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' });
    var today = new Date();
    if (d.toDateString() === today.toDateString()) {
      return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: d.getFullYear() === today.getFullYear() ? undefined : 'numeric' });
  }

  function download(filename, text, type) {
    var blob = new Blob([text], { type: type });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  /* ==========================================================
     MODAL YÖNETİMİ — Esc ile kapanır, odak geri döner
     ========================================================== */
  var openModalEl = null;
  var modalReturnFocus = null;
  var modalOnClose = null;

  function openModal(el, onClose) {
    if (openModalEl) closeModal();
    modalReturnFocus = document.activeElement;
    modalOnClose = onClose || null;
    openModalEl = el;
    el.classList.add('visible');
    var focusable = el.querySelector('input:not([type="file"]), textarea, select, button:not(.admin-message-detail__close)');
    if (focusable) focusable.focus();
  }

  function closeModal() {
    if (!openModalEl) return;
    openModalEl.classList.remove('visible');
    openModalEl = null;
    var cb = modalOnClose;
    modalOnClose = null;
    if (cb) cb();
    if (modalReturnFocus && document.contains(modalReturnFocus)) modalReturnFocus.focus();
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && openModalEl) closeModal();
  });

  each('.admin-message-detail', function (m) {
    m.addEventListener('click', function (e) { if (e.target === m) closeModal(); });
  });
  each('[data-close-modal]', function (b) { b.addEventListener('click', closeModal); });

  /* ==========================================================
     OTURUM
     ========================================================== */
  var loginSection = $('admin-login');
  var dashboardSection = $('admin-dashboard');
  var loginForm = $('login-form');
  var loginError = $('login-error');
  var started = false;

  function checkSession() {
    if (store('session', SESSION_KEY) === 'active') showDashboard(); else showLogin();
  }

  function showLogin() {
    loginSection.style.display = 'block';
    dashboardSection.classList.remove('visible');
    document.title = 'Yönetici Paneli | KCK Tech';
  }

  function showDashboard() {
    loginSection.style.display = 'none';
    dashboardSection.classList.add('visible');
    if (!started) {
      started = true;
      initDashboard();
    }
    loadMessages();
  }

  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var input = $('admin-password');
    if (sha256(input.value) === ADMIN_PASSWORD_HASH) {
      store('session', SESSION_KEY, 'active');
      loginError.classList.remove('visible');
      input.value = '';
      showDashboard();
    } else {
      loginError.classList.add('visible');
      input.select();
    }
  });

  $('logout-btn').addEventListener('click', function () {
    store('session', SESSION_KEY, null);
    closeModal();
    showLogin();
    $('admin-password').value = '';
  });

  /* ==========================================================
     SEKMELER — ok tuşlarıyla gezilebilir
     ========================================================== */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.admin-tab'));

  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      $(t.getAttribute('aria-controls')).hidden = !on;
    });
    store('session', TAB_KEY, tab.id);
    if (focus) tab.focus();
  }

  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectTab(t); });
    t.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') next = tabs[0];
      else if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); selectTab(next, true); }
    });
  });

  each('[data-goto-tab]', function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      selectTab($(a.getAttribute('data-goto-tab')), true);
    });
  });

  /* ==========================================================
     MESAJLAR
     ========================================================== */
  var messagesList = $('messages-list');
  var emptyState = $('empty-state');
  var noResults = $('no-results');
  var filter = { q: '', service: '', status: '' };
  var visibleCount = PAGE_SIZE;
  var currentMessageId = null;
  var knownIds = null;

  /** localStorage'dan mesajları oku; kimliği olmayanlara kimlik ver */
  function getMessages() {
    var list;
    try {
      list = JSON.parse(store('local', STORAGE_KEY) || '[]');
      if (!Array.isArray(list)) list = [];
    } catch (e) {
      list = [];
    }
    var changed = false;
    list.forEach(function (m, i) {
      if (!m || typeof m !== 'object') { list[i] = m = {}; changed = true; }
      if (!m.id) {
        m.id = 'm' + (Date.parse(m.date) || Date.now()).toString(36) + i.toString(36) + Math.random().toString(36).slice(2, 6);
        changed = true;
      }
    });
    if (changed) saveMessages(list);
    return list;
  }

  function saveMessages(list) {
    if (!store('local', STORAGE_KEY, JSON.stringify(list))) toast('Kaydedilemedi: tarayıcı depolaması dolu veya kapalı.', true);
  }

  function serviceOf(m) {
    var s = m.service || m.source_page || '';
    return SERVICE_NAMES[s] && s !== 'diger' ? s : 'diger';
  }

  function matches(m) {
    if (filter.service && serviceOf(m) !== filter.service) return false;
    if (filter.status && (m.status || 'new') !== filter.status) return false;
    if (filter.q) {
      var hay = lower([m.name, m.email, m.phone, m.subject, m.message, m.note].join(' '));
      var words = lower(filter.q).split(/\s+/);
      for (var i = 0; i < words.length; i++) if (words[i] && hay.indexOf(words[i]) === -1) return false;
    }
    return true;
  }

  function loadMessages() {
    var messages = getMessages();
    updateStats(messages);
    renderMessageList(messages);
    updateUnread(messages);
    if (knownIds === null) knownIds = messages.map(function (m) { return m.id; });
  }

  function updateStats(messages) {
    var counts = { total: messages.length, 'gunes-enerjisi': 0, 'kamera': 0, 'muhendislik': 0 };
    messages.forEach(function (m) {
      var s = m.service || m.source_page || '';
      if (counts[s] !== undefined && s !== 'total') counts[s]++;
    });
    $('stat-total').textContent = counts.total;
    $('stat-solar').textContent = counts['gunes-enerjisi'];
    $('stat-camera').textContent = counts.kamera;
    $('stat-eng').textContent = counts.muhendislik;

    each('[data-filter-service]', function (b) {
      var on = b.getAttribute('data-filter-service') === filter.service;
      b.classList.toggle('is-active', on && filter.service !== '');
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  function updateUnread(messages) {
    var unread = messages.filter(function (m) { return (m.status || 'new') === 'new'; }).length;
    var badge = $('unread-badge');
    badge.textContent = unread;
    badge.hidden = unread === 0;
    document.title = (unread ? '(' + unread + ') ' : '') + 'Yönetici Paneli | KCK Tech';
  }

  function renderMessageList(messages) {
    var hasAny = messages.length > 0;
    emptyState.hidden = hasAny;
    emptyState.style.display = hasAny ? 'none' : '';

    /* Yeniden eskiye */
    var ordered = messages.map(function (m, i) { return { m: m, i: i }; }).reverse();
    var filtered = ordered.filter(function (x) { return matches(x.m); });
    var shown = filtered.slice(0, visibleCount);

    noResults.hidden = !hasAny || filtered.length > 0;
    $('msg-more-wrap').hidden = filtered.length <= visibleCount;
    $('msg-more').textContent = 'Daha fazla göster (' + (filtered.length - shown.length) + ')';

    var meta = '';
    if (hasAny) {
      var isFiltered = filter.q || filter.service || filter.status;
      meta = isFiltered ? filtered.length + ' / ' + messages.length + ' mesaj gösteriliyor' : messages.length + ' mesaj';
    }
    $('msg-meta').textContent = meta;

    messagesList.innerHTML = shown.map(function (x) {
      var m = x.m;
      var status = STATUS_TEXT[m.status] ? m.status : 'new';
      var svc = serviceOf(m);
      var contact = m.phone ? m.phone : (m.email || '');
      return '<button type="button" class="admin-message-item' + (status === 'new' ? ' admin-message-item--new' : '') +
        '" data-index="' + x.i + '" data-id="' + esc(m.id) + '">' +
          '<span class="admin-message-item__who">' +
            '<span class="admin-message-item__name">' + esc(m.name || 'İsimsiz') + '</span>' +
            '<span class="admin-message-item__contact">' + esc(contact) + '</span>' +
          '</span>' +
          '<span class="admin-message-item__subject">' + esc(m.subject || m.message || 'Konu belirtilmemiş') +
            (m.note ? ' <i class="fas fa-sticky-note" title="Not var" aria-label="Not var"></i>' : '') + '</span>' +
          '<span class="admin-message-item__meta">' +
            '<span class="svc-dot svc-dot--' + svc + '" title="' + esc(SERVICE_NAMES[svc]) + '"></span>' +
            '<span class="status-badge status-badge--' + status + '">' + STATUS_TEXT[status] + '</span>' +
            '<span class="admin-message-item__date">' + esc(formatDate(m.date)) + '</span>' +
          '</span>' +
        '</button>';
    }).join('');
  }

  messagesList.addEventListener('click', function (e) {
    var row = e.target.closest('.admin-message-item');
    if (row) showMessageDetail(row.getAttribute('data-id'));
  });

  /* Filtreler */
  var searchTimer;
  $('msg-search').addEventListener('input', function () {
    var v = this.value;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () { filter.q = v.trim(); visibleCount = PAGE_SIZE; loadMessages(); }, 150);
  });
  $('msg-filter-service').addEventListener('change', function () {
    filter.service = this.value; visibleCount = PAGE_SIZE; loadMessages();
  });
  $('msg-filter-status').addEventListener('change', function () {
    filter.status = this.value; visibleCount = PAGE_SIZE; loadMessages();
  });
  each('[data-filter-service]', function (b) {
    b.addEventListener('click', function () {
      var v = b.getAttribute('data-filter-service');
      filter.service = filter.service === v ? '' : v;
      $('msg-filter-service').value = filter.service;
      visibleCount = PAGE_SIZE;
      loadMessages();
    });
  });
  $('msg-more').addEventListener('click', function () {
    visibleCount += PAGE_SIZE;
    loadMessages();
  });

  /* CSV — Excel'in Türkçe ayarına uygun: noktalı virgül + UTF-8 BOM */
  $('msg-export').addEventListener('click', function () {
    var rows = getMessages().filter(matches).reverse();
    if (!rows.length) { toast('Dışa aktarılacak mesaj yok.'); return; }
    var cols = [['date', 'Tarih'], ['name', 'İsim'], ['email', 'E-posta'], ['phone', 'Telefon'], ['service', 'Hizmet'],
      ['subject', 'Konu'], ['message', 'Mesaj'], ['status', 'Durum'], ['note', 'Not']];
    var cell = function (v) {
      v = String(v == null ? '' : v);
      if (/^[=+\-@\t\r]/.test(v)) v = "'" + v; /* Excel formül enjeksiyonunu engelle */
      return '"' + v.replace(/"/g, '""') + '"';
    };
    var lines = [cols.map(function (c) { return cell(c[1]); }).join(';')];
    rows.forEach(function (m) {
      lines.push(cols.map(function (c) {
        var v = m[c[0]];
        if (c[0] === 'date') v = formatDate(v, true);
        if (c[0] === 'service') v = SERVICE_NAMES[serviceOf(m)];
        if (c[0] === 'status') v = STATUS_TEXT[m.status] || 'Yeni';
        return cell(v);
      }).join(';'));
    });
    download('mesajlar-' + new Date().toISOString().slice(0, 10) + '.csv', '﻿' + lines.join('\r\n'), 'text/csv;charset=utf-8');
  });

  /* ---- Mesaj Detayı ---- */
  var detailModal = $('message-detail');
  var noteInput = $('detail-note');
  var noteTimer;

  function showMessageDetail(id) {
    var messages = getMessages();
    var idx = indexById(messages, id);
    if (idx === -1) return;
    var m = messages[idx];
    currentMessageId = id;

    /* Açılınca otomatik okundu */
    if ((m.status || 'new') === 'new') {
      m.status = 'read';
      saveMessages(messages);
      loadMessages();
    }

    var svc = serviceOf(m);
    var tel = normalizePhone(m.phone);
    var row = function (label, value) {
      return '<div class="detail-row"><div class="detail-row__label">' + label + '</div><div class="detail-row__value">' + value + '</div></div>';
    };
    var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.email || '');

    $('detail-content').innerHTML =
      row('İsim', esc(m.name || '-')) +
      row('E-posta', emailOk ? '<a href="mailto:' + esc(m.email) + '">' + esc(m.email) + '</a>' : esc(m.email || '-')) +
      row('Telefon', tel ? '<a href="tel:' + tel + '">' + esc(m.phone) + '</a>' : esc(m.phone || '-')) +
      row('Hizmet', '<span class="svc-dot svc-dot--' + svc + '"></span> ' + esc(SERVICE_NAMES[svc])) +
      row('Konu', esc(m.subject || '-')) +
      row('Kaynak', esc(m.source_page || 'Doğrudan')) +
      row('Tarih', esc(formatDate(m.date, true))) +
      '<div class="detail-message">' + esc(m.message || '-') + '</div>';

    /* Hızlı yanıt butonları */
    var first = String(m.name || '').trim().split(/\s+/)[0] || '';
    var greet = 'Merhaba' + (first ? ' ' + first : '') + ',\n\nKCK Tech web sitesi üzerinden ilettiğiniz mesaj için teşekkür ederiz.\n\n';
    var reply = '';
    if (emailOk) {
      reply += '<a class="btn btn--sm btn--primary" href="mailto:' + esc(m.email) +
        '?subject=' + encodeURIComponent('Re: ' + (m.subject || 'Talebiniz hakkında')) +
        '&body=' + encodeURIComponent(greet) + '"><i class="fas fa-envelope"></i> E-posta ile yanıtla</a>';
    }
    if (tel) {
      reply += '<a class="btn btn--sm btn--whatsapp" target="_blank" rel="noopener" href="https://wa.me/' + tel.slice(1) +
        '?text=' + encodeURIComponent(greet.replace(/\n+$/, '')) + '"><i class="fab fa-whatsapp"></i> WhatsApp ile yanıtla</a>';
      reply += '<a class="btn btn--sm admin-btn-ghost" href="tel:' + tel + '"><i class="fas fa-phone"></i> Ara</a>';
    }
    $('detail-reply').innerHTML = reply;

    noteInput.value = m.note || '';
    $('detail-note-status').textContent = '';
    syncStatusButtons(m.status || 'new');

    openModal(detailModal, function () { flushNote(); currentMessageId = null; });
  }

  /** Mevcut durumun butonunu vurgula (butonlar gizlenmez — tekrar tıklamak zararsız) */
  function syncStatusButtons(status) {
    [['btn-mark-new', 'new'], ['btn-mark-read', 'read'], ['btn-mark-replied', 'replied']].forEach(function (b) {
      var on = b[1] === status;
      $(b[0]).classList.toggle('is-current', on);
      $(b[0]).setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  /** Mesajın bir alanını güncelle */
  function patchMessage(id, patch) {
    var messages = getMessages();
    var idx = indexById(messages, id);
    if (idx === -1) return false;
    for (var k in patch) if (Object.prototype.hasOwnProperty.call(patch, k)) messages[idx][k] = patch[k];
    saveMessages(messages);
    return true;
  }

  function flushNote() {
    clearTimeout(noteTimer);
    if (!currentMessageId) return;
    var messages = getMessages();
    var idx = indexById(messages, currentMessageId);
    if (idx === -1 || (messages[idx].note || '') === noteInput.value) return;
    patchMessage(currentMessageId, { note: noteInput.value });
    loadMessages();
  }

  noteInput.addEventListener('input', function () {
    clearTimeout(noteTimer);
    $('detail-note-status').textContent = '';
    noteTimer = setTimeout(function () {
      flushNote();
      $('detail-note-status').textContent = 'Not kaydedildi';
    }, 600);
  });

  function setStatus(status) {
    if (!currentMessageId) return;
    flushNote();
    patchMessage(currentMessageId, { status: status });
    loadMessages();
    closeModal();
    toast('Durum: ' + STATUS_TEXT[status]);
  }

  $('btn-mark-read').addEventListener('click', function () { setStatus('read'); });
  $('btn-mark-replied').addEventListener('click', function () { setStatus('replied'); });
  $('btn-mark-new').addEventListener('click', function () { setStatus('new'); });
  $('detail-close').addEventListener('click', closeModal);

  $('btn-delete-msg').addEventListener('click', function () {
    if (!currentMessageId) return;
    if (!confirm('Bu mesajı silmek istediğinize emin misiniz?')) return;
    var messages = getMessages();
    var idx = indexById(messages, currentMessageId);
    if (idx !== -1) messages.splice(idx, 1);
    saveMessages(messages);
    currentMessageId = null;
    closeModal();
    loadMessages();
    toast('Mesaj silindi');
  });

  /* ==========================================================
     BİLDİRİMLER — yeni mesaj gelince (başka sekmede form gönderilince)
     ========================================================== */
  function notifyEnabled() {
    return store('local', NOTIFY_KEY) === '1' && 'Notification' in window && Notification.permission === 'granted';
  }

  function notifyNew(newOnes) {
    var m = newOnes[newOnes.length - 1];
    var text = newOnes.length > 1 ? newOnes.length + ' yeni mesaj' : 'Yeni mesaj: ' + (m.name || 'İsimsiz');
    toast(text);
    if (notifyEnabled()) {
      try {
        var n = new Notification(text, {
          body: newOnes.length > 1 ? 'Panelde görüntüleyin.' : (m.subject || m.message || '').slice(0, 120),
          icon: 'img/favicon.png',
          tag: 'kck-admin-message'
        });
        n.onclick = function () { window.focus(); if (newOnes.length === 1) showMessageDetail(m.id); n.close(); };
      } catch (e) { /* bazı mobil tarayıcılar sayfa içi Notification desteklemez */ }
    }
  }

  window.addEventListener('storage', function (e) {
    if (!dashboardSection.classList.contains('visible')) return;
    if (e.key === STORAGE_KEY || e.key === null) {
      var messages = getMessages();
      var prev = knownIds || [];
      var fresh = messages.filter(function (m) { return prev.indexOf(m.id) === -1 && (m.status || 'new') === 'new'; });
      knownIds = messages.map(function (m) { return m.id; });
      loadMessages();
      if (fresh.length) notifyNew(fresh);
    }
    if (e.key === DRAFT_KEY) { readDraft(); renderContent(); }
  });

  function renderNotifySettings() {
    var toggle = $('notify-toggle');
    var status = $('notify-status');
    var supported = 'Notification' in window;
    toggle.checked = notifyEnabled();
    toggle.disabled = !supported || (supported && Notification.permission === 'denied');
    if (!supported) status.textContent = 'Bu tarayıcı masaüstü bildirimlerini desteklemiyor.';
    else if (Notification.permission === 'denied') status.textContent = 'Bildirim izni engellenmiş. Adres çubuğundaki kilit simgesinden izin verin.';
    else status.textContent = toggle.checked ? 'Açık — panel açık bir sekmede durduğu sürece bildirim alırsınız.' : 'Kapalı.';
  }

  $('notify-toggle').addEventListener('change', function () {
    var toggle = this;
    if (!toggle.checked) { store('local', NOTIFY_KEY, '0'); renderNotifySettings(); return; }
    var done = function (perm) {
      store('local', NOTIFY_KEY, perm === 'granted' ? '1' : '0');
      renderNotifySettings();
    };
    var p = Notification.requestPermission(done);
    if (p && p.then) p.then(done);
  });

  $('notify-test').addEventListener('click', function () {
    notifyNew([{ id: '', name: 'Deneme Müşteri', subject: 'Çatı GES teklifi' }]);
    if (!notifyEnabled()) toast('Masaüstü bildirimi için önce anahtarı açın.');
  });

  /* ==========================================================
     İÇERİK — projeler + site ayarları (taslak → yayın)
     ========================================================== */
  var published = null; /* data/site-content.json */
  var draft = null;     /* localStorage taslağı ya da null */
  var contentError = '';

  function working() { return draft || published; }

  function readDraft() {
    try { draft = JSON.parse(store('local', DRAFT_KEY) || 'null'); } catch (e) { draft = null; }
    if (draft && published && sameAsPublished(draft)) {
      /* Taslak yayına alınmış — temizle */
      store('local', DRAFT_KEY, null);
      draft = null;
    }
  }

  /** Yayına alındıktan sonra gömülü görseller yol olur; karşılaştırırken bunu hesaba kat */
  function normalizeForCompare(c, ref) {
    var x = clone(c);
    (x.projects || []).forEach(function (p) {
      if (p.imageData) {
        var refList = (ref && ref.projects) || [];
        var match = refList[indexById(refList, p.id)];
        p.image = match && match.image ? match.image : '__new__';
        delete p.imageData;
      }
    });
    return JSON.stringify(x);
  }

  function sameAsPublished(c) {
    return normalizeForCompare(c, published) === JSON.stringify(published);
  }

  function saveDraft(next) {
    if (sameAsPublished(next)) {
      store('local', DRAFT_KEY, null);
      draft = null;
    } else {
      if (!store('local', DRAFT_KEY, JSON.stringify(next))) {
        toast('Taslak kaydedilemedi: tarayıcı depolaması dolu. Büyük fotoğrafları kaldırıp tekrar deneyin.', true);
        return false;
      }
      draft = next;
    }
    renderContent();
    return true;
  }

  /** Yayındakiyle taslak arasındaki farkları insan diliyle listeler */
  function describeChanges() {
    if (!draft || !published) return [];
    var out = [];
    var a = published.contact, b = draft.contact;
    var labels = { phone1: 'Telefon 1', phone2: 'Telefon 2', email: 'E-posta', instagram: 'Instagram',
      facebook: 'Facebook', linkedin: 'LinkedIn', youtube: 'YouTube' };
    Object.keys(labels).forEach(function (k) {
      if ((a[k] || '') !== (b[k] || '')) out.push(labels[k] + ': ' + ((k.indexOf('phone') === 0 ? displayPhone(b[k]) : b[k]) || '(boş)'));
    });
    if ((a.mapsLat || '') !== (b.mapsLat || '') || (a.mapsLng || '') !== (b.mapsLng || '')) out.push('Harita konumu');
    if ((published.formspreeId || '') !== (draft.formspreeId || '')) out.push('Formspree ID: ' + (draft.formspreeId || '(boş)'));
    if (JSON.stringify(published.stats) !== JSON.stringify(draft.stats)) out.push('Ana sayfa sayaçları');

    var oldById = {};
    published.projects.forEach(function (p) { oldById[p.id] = p; });
    var added = 0, edited = 0, removed = 0;
    draft.projects.forEach(function (p) {
      var o = oldById[p.id];
      if (!o) added++;
      else if (p.imageData || JSON.stringify(o) !== JSON.stringify(p)) edited++;
    });
    var newIds = draft.projects.map(function (p) { return p.id; });
    published.projects.forEach(function (p) { if (newIds.indexOf(p.id) === -1) removed++; });
    var orderChanged = !added && !removed && JSON.stringify(newIds) !== JSON.stringify(published.projects.map(function (p) { return p.id; }));
    var parts = [];
    if (added) parts.push(added + ' yeni');
    if (edited) parts.push(edited + ' düzenlendi');
    if (removed) parts.push(removed + ' silindi');
    if (orderChanged) parts.push('sıralama');
    if (parts.length) out.push('Projeler: ' + parts.join(', '));
    return out;
  }

  function renderContent() {
    var changes = describeChanges();
    $('publish-bar').hidden = !draft;
    $('publish-summary').textContent = changes.length ? changes.slice(0, 3).join(' · ') + (changes.length > 3 ? ' …' : '') : '';
    renderProjects();
    fillSettings();
    renderFormspree();
  }

  function contentUnavailable(container) {
    container.innerHTML = '<div class="admin-empty"><div class="admin-empty__icon"><i class="fas fa-plug-circle-xmark"></i></div><p>' +
      esc(contentError) + '</p></div>';
  }

  function loadContent() {
    var useContent = function (json) {
      published = json;
      readDraft();
      renderContent();
    };
    /* Dosyadan açıldıysa fetch hiç çalışmaz — doğrudan data/site-content.js'teki kopyayı kullan */
    var p = location.protocol === 'file:'
      ? Promise.reject(new Error('file'))
      : fetch(CONTENT_URL, { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
    p.then(useContent)
      .catch(function () {
        if (window.SITE_CONTENT && Array.isArray(window.SITE_CONTENT.projects)) { useContent(window.SITE_CONTENT); return; }
        contentError = 'Site içeriği yüklenemedi (data/site-content.json ve data/site-content.js bulunamadı). ' +
          'Proje klasöründe "npm run content" çalıştırıp sayfayı yenileyin.';
        contentUnavailable($('projects-list'));
        $('proj-add').disabled = true;
        each('#settings-form input, #settings-form button, #formspree-form input, #formspree-form button', function (el) { el.disabled = true; });
        $('settings-status').textContent = contentError;
        $('formspree-status').textContent = 'Bilinmiyor';
      });
  }

  $('draft-discard').addEventListener('click', function () {
    if (!confirm('Yayınlanmamış tüm proje ve ayar değişiklikleri silinsin mi?')) return;
    store('local', DRAFT_KEY, null);
    draft = null;
    renderContent();
    toast('Taslak silindi');
  });

  /* ---- Yayınlama ---- */
  $('publish-open').addEventListener('click', function () {
    $('publish-changes').innerHTML = describeChanges().map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('');
    openModal($('publish-modal'));
  });

  $('publish-download').addEventListener('click', function () {
    if (!draft) return;
    download('site-content.json', JSON.stringify(draft, null, 2), 'application/json');
    toast('İndirildi. Şimdi komutu çalıştırın.');
  });

  $('publish-copy').addEventListener('click', function () {
    var text = $('publish-cmd').textContent;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function () { toast('Komut kopyalandı'); }, function () { toast('Kopyalanamadı', true); });
    }
  });

  /* ---- Projeler ---- */
  var projFilter = '';
  var editingProjectId = null;
  var pendingImage; /* undefined: değişmedi, '': kaldırıldı, 'data:…': yeni */

  function projectVisual(p) {
    var src = p.imageData || p.image;
    if (src) return '<img src="' + esc(src) + '" alt="" loading="lazy">';
    var icon = /^fa-[a-z0-9-]+$/.test(p.icon || '') ? p.icon : ICONS[p.category][0];
    return '<i class="fas ' + icon + '" aria-hidden="true"></i>';
  }

  function renderProjects() {
    if (!published) return;
    var list = working().projects;
    var shown = list.filter(function (p) { return !projFilter || p.category === projFilter; });
    $('projects-empty').hidden = shown.length > 0;
    $('projects-list').innerHTML = shown.map(function (p) {
      var idx = list.indexOf(p);
      var noGallery = GALLERY_CATEGORIES.indexOf(p.category) === -1;
      return '<article class="admin-project" data-id="' + esc(p.id) + '">' +
        '<div class="admin-project__image project-card__image--' + CATEGORY_CLASS[p.category] + '">' + projectVisual(p) +
          '<span class="admin-project__badge">' + esc(SERVICE_NAMES[p.category]) + '</span></div>' +
        '<div class="admin-project__body">' +
          '<h3 class="admin-project__title">' + esc(p.title) + '</h3>' +
          '<p class="admin-project__desc">' + esc(p.desc || '') + '</p>' +
          (noGallery ? '<p class="admin-project__warn"><i class="fas fa-triangle-exclamation"></i> Sitede bu kategorinin galerisi yok; görünmez.</p>' : '') +
        '</div>' +
        '<div class="admin-project__actions">' +
          '<button type="button" data-act="up" aria-label="Yukarı taşı" title="Öne al"' + (idx === 0 ? ' disabled' : '') + '><i class="fas fa-arrow-left"></i></button>' +
          '<button type="button" data-act="down" aria-label="Aşağı taşı" title="Sona al"' + (idx === list.length - 1 ? ' disabled' : '') + '><i class="fas fa-arrow-right"></i></button>' +
          '<button type="button" data-act="edit" aria-label="Düzenle" title="Düzenle"><i class="fas fa-pen"></i></button>' +
          '<button type="button" data-act="delete" aria-label="Sil" title="Sil"><i class="fas fa-trash"></i></button>' +
        '</div></article>';
    }).join('');
  }

  $('proj-filter').addEventListener('change', function () { projFilter = this.value; renderProjects(); });

  $('projects-list').addEventListener('click', function (e) {
    var btn = e.target.closest('button[data-act]');
    if (!btn) return;
    var id = btn.closest('.admin-project').getAttribute('data-id');
    var next = clone(working());
    var list = next.projects;
    var i = indexById(list, id);
    if (i === -1) return;
    var act = btn.getAttribute('data-act');
    if (act === 'edit') { openProjectForm(list[i]); return; }
    if (act === 'delete') {
      if (!confirm('"' + list[i].title + '" projesi silinsin mi?')) return;
      list.splice(i, 1);
    } else {
      var j = act === 'up' ? i - 1 : i + 1;
      if (j < 0 || j >= list.length) return;
      var t = list[i]; list[i] = list[j]; list[j] = t;
    }
    saveDraft(next);
  });

  $('proj-add').addEventListener('click', function () { openProjectForm(null); });

  function fillIconSelect(category, current) {
    var sel = $('proj-icon');
    sel.innerHTML = ICONS[category].map(function (ic) {
      return '<option value="' + ic + '"' + (ic === current ? ' selected' : '') + '>' + esc(ICON_LABELS[ic] || ic) + '</option>';
    }).join('');
  }

  function updateImagePreview() {
    var cat = $('proj-category').value;
    var list = working().projects;
    var p = editingProjectId ? list[indexById(list, editingProjectId)] : null;
    var src = pendingImage !== undefined ? pendingImage : (p ? (p.imageData || p.image) : '');
    var box = $('proj-image-preview');
    box.className = 'admin-image-pick__preview project-card__image--' + CATEGORY_CLASS[cat];
    box.innerHTML = src ? '<img src="' + esc(src) + '" alt="Önizleme">' : '<i class="fas ' + esc($('proj-icon').value) + '" aria-hidden="true"></i>';
    $('proj-image-clear').hidden = !src;
    $('proj-category-hint').textContent = GALLERY_CATEGORIES.indexOf(cat) === -1 ? 'Sitede bu kategorinin galerisi henüz yok.' : '';
  }

  function openProjectForm(p) {
    var form = $('project-form');
    form.reset();
    clearErrors(form);
    editingProjectId = p ? p.id : null;
    pendingImage = undefined;
    $('project-modal-title').textContent = p ? 'Projeyi düzenle' : 'Yeni proje';
    $('proj-title').value = p ? p.title : '';
    $('proj-category').value = p ? p.category : (projFilter || GALLERY_CATEGORIES[0]);
    $('proj-tag').value = p ? (p.tag || '') : '';
    $('proj-desc').value = p ? (p.desc || '') : '';
    fillIconSelect($('proj-category').value, p && p.icon);
    updateImagePreview();
    openModal($('project-modal'));
  }

  $('proj-category').addEventListener('change', function () {
    fillIconSelect(this.value);
    updateImagePreview();
  });
  $('proj-icon').addEventListener('change', updateImagePreview);
  $('proj-image-clear').addEventListener('click', function () { pendingImage = ''; $('proj-image').value = ''; updateImagePreview(); });

  /** Fotoğrafı tarayıcıda küçült (en fazla 1200 px, JPEG) — depolama ve sayfa hızı için */
  $('proj-image').addEventListener('change', function () {
    var file = this.files && this.files[0];
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { toast('Yalnızca JPG, PNG veya WebP.', true); return; }
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () {
        var max = 1200;
        var scale = Math.min(1, max / Math.max(img.width, img.height));
        var canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        pendingImage = canvas.toDataURL('image/jpeg', 0.82);
        updateImagePreview();
      };
      img.onerror = function () { toast('Fotoğraf okunamadı.', true); };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

  $('project-form').addEventListener('submit', function (e) {
    e.preventDefault();
    clearErrors(this);
    var title = $('proj-title').value.trim();
    if (title.length < 2) { fieldError($('proj-title'), 'Başlık en az 2 karakter olmalı.'); return; }

    var next = clone(working());
    var p;
    if (editingProjectId) {
      p = next.projects[indexById(next.projects, editingProjectId)];
      if (!p) { closeModal(); return; }
    } else {
      p = { id: 'p-' + Date.now().toString(36), image: '' };
      next.projects.push(p);
    }
    p.title = title;
    p.category = $('proj-category').value;
    p.tag = $('proj-tag').value.trim();
    p.desc = $('proj-desc').value.trim();
    p.icon = $('proj-icon').value;
    if (pendingImage === '') { p.image = ''; delete p.imageData; }
    else if (pendingImage) { p.imageData = pendingImage; }

    if (saveDraft(next)) {
      closeModal();
      toast(editingProjectId ? 'Proje güncellendi (taslak)' : 'Proje eklendi (taslak)');
    }
  });

  /* ---- Form hata yardımcıları ---- */
  function fieldError(input, msg) {
    input.classList.add('error');
    var el = input.parentElement.querySelector('.form-error');
    if (el) { el.textContent = msg; el.classList.add('visible'); }
    input.focus();
  }

  function clearErrors(form) {
    each('.error', function (el) { el.classList.remove('error'); }, form);
    each('.form-error', function (el) { el.textContent = ''; el.classList.remove('visible'); }, form);
  }

  /* ---- Site Ayarları ---- */
  function fillSettings() {
    if (!published) return;
    var c = working();
    var k = c.contact;
    $('set-phone1').value = displayPhone(k.phone1);
    $('set-phone2').value = displayPhone(k.phone2);
    $('set-email').value = k.email || '';
    $('set-instagram').value = k.instagram || '';
    $('set-facebook').value = k.facebook || '';
    $('set-linkedin').value = k.linkedin || '';
    $('set-youtube').value = k.youtube || '';
    $('set-maps').value = k.mapsLat && k.mapsLng ? k.mapsLat + ', ' + k.mapsLng : '';
    $('stats-edit').innerHTML = c.stats.map(function (s, i) {
      return '<div class="admin-stat-row">' +
        '<input class="form-input" type="number" min="0" max="99999" name="stat-value-' + i + '" value="' + esc(s.value) + '" aria-label="Sayaç ' + (i + 1) + ' değeri">' +
        '<input class="form-input" maxlength="3" name="stat-suffix-' + i + '" value="' + esc(s.suffix) + '" aria-label="Sayaç ' + (i + 1) + ' son eki (ör. +)">' +
        '<input class="form-input" maxlength="30" name="stat-label-' + i + '" value="' + esc(s.label) + '" aria-label="Sayaç ' + (i + 1) + ' etiketi">' +
        '</div>';
    }).join('');
    $('settings-status').textContent = draft ? '' : 'Yayındaki değerler gösteriliyor.';
  }

  $('settings-form').addEventListener('submit', function (e) {
    e.preventDefault();
    if (!published) return;
    var form = this;
    clearErrors(form);
    var next = clone(working());
    var k = next.contact;

    var p1 = normalizePhone($('set-phone1').value);
    if (!p1) return fieldError($('set-phone1'), 'Geçerli bir numara girin (ör. 0543 619 48 98).');
    var p2 = normalizePhone($('set-phone2').value);
    if (!p2) return fieldError($('set-phone2'), 'Geçerli bir numara girin.');
    var email = $('set-email').value.trim();
    if (!/^[^\s@"<>]+@[^\s@"<>]+\.[^\s@"<>]+$/.test(email)) return fieldError($('set-email'), 'Geçerli bir e-posta girin.');
    var ig = $('set-instagram').value.trim().replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/\/.*$/, '');
    if (!/^[A-Za-z0-9._]+$/.test(ig)) return fieldError($('set-instagram'), 'Yalnızca kullanıcı adı (ör. kucukler_muh).');

    var socials = ['facebook', 'linkedin', 'youtube'];
    for (var i = 0; i < socials.length; i++) {
      var inp = $('set-' + socials[i]);
      var v = inp.value.trim();
      if (v && !/^https:\/\/[^\s"<>]+\.[^\s"<>]+$/.test(v)) return fieldError(inp, 'https:// ile başlayan tam adres girin ya da boş bırakın.');
      k[socials[i]] = v;
    }

    var maps = $('set-maps').value.trim();
    if (maps) {
      var mm = /^(-?\d{1,2}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)$/.exec(maps);
      if (!mm) return fieldError($('set-maps'), 'Biçim: 36.8394, 28.7645');
      k.mapsLat = mm[1]; k.mapsLng = mm[2];
    } else {
      k.mapsLat = ''; k.mapsLng = '';
    }

    var stats = [];
    for (var s = 0; s < 4; s++) {
      var val = form.querySelector('[name="stat-value-' + s + '"]');
      var label = form.querySelector('[name="stat-label-' + s + '"]');
      var n = parseInt(val.value, 10);
      if (isNaN(n) || n < 0) return fieldError(val, 'Sayı girin.');
      if (!label.value.trim()) return fieldError(label, 'Etiket girin.');
      stats.push({ value: n, suffix: form.querySelector('[name="stat-suffix-' + s + '"]').value.trim(), label: label.value.trim() });
    }

    k.phone1 = p1; k.phone2 = p2; k.email = email; k.instagram = ig;
    next.stats = stats;
    if (saveDraft(next)) {
      $('settings-status').textContent = draft ? 'Taslağa kaydedildi — yayınlamayı unutmayın.' : 'Yayındakiyle aynı.';
      toast('Ayarlar taslağa kaydedildi');
    }
  });

  /* ---- Formspree ---- */
  function renderFormspree() {
    if (!published) return;
    var pill = $('formspree-status');
    var live = published.formspreeId;
    var pending = draft && (draft.formspreeId || '') !== (live || '');
    $('set-formspree').value = working().formspreeId || '';
    if (pending) {
      pill.className = 'admin-pill admin-pill--off';
      pill.innerHTML = '<i class="fas fa-clock"></i> Taslakta — yayınlanmadı';
    } else if (live) {
      pill.className = 'admin-pill admin-pill--on';
      pill.innerHTML = '<i class="fas fa-check"></i> Açık';
    } else {
      pill.className = 'admin-pill admin-pill--off';
      pill.innerHTML = '<i class="fas fa-xmark"></i> Kapalı — form e-posta göndermiyor';
    }
  }

  $('formspree-form').addEventListener('submit', function (e) {
    e.preventDefault();
    if (!published) return;
    clearErrors(this);
    var input = $('set-formspree');
    var raw = input.value.trim();
    var m = /formspree\.io\/f\/([A-Za-z0-9]+)/.exec(raw);
    var id = m ? m[1] : raw;
    if (id && !/^[A-Za-z0-9]{4,}$/.test(id)) return fieldError(input, 'Form ID yalnızca harf ve rakamdan oluşur (ör. xrgvkbqa).');
    var next = clone(working());
    next.formspreeId = id;
    if (saveDraft(next)) toast(id ? 'Formspree ID taslağa kaydedildi' : 'Formspree kaldırıldı (taslak)');
  });

  /* ==========================================================
     BAŞLATMA
     ========================================================== */
  function initDashboard() {
    var saved = $(store('session', TAB_KEY) || '');
    if (saved && tabs.indexOf(saved) !== -1) selectTab(saved);
    renderNotifySettings();
    loadContent();
  }

  checkSession();

})();
