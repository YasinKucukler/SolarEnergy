/**
 * Main — Ana Başlatma ve Global Davranışlar
 * ==========================================
 *
 * BU DOSYA: Site genelinde kullanılan genel işlevleri yönetir.
 *
 * ÖZELLİKLER:
 * 1. Sticky Header — Kaydırmada navbar'a gölge efekti
 * 2. Active Nav Link — Mevcut sayfanın menü linkini vurgulama
 *
 * DEĞİŞTİRMEK İÇİN:
 * - scrollThreshold: Kaç piksel sonra gölge eklensin (varsayılan 50)
 * - Active link tespiti: window.location.pathname kullanır
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {

    /* ============================================
       1. STICKY HEADER — Kaydırma gölge efekti
       Sayfa 50px aşağı kaydırıldığında header'a
       .header--scrolled class'ı eklenir (gölge efekti)
       ============================================ */
    var header = document.querySelector('.header');
    if (header) {
      /* DEĞİŞTİRMEK İÇİN: Bu değeri artırıp azaltabilirsiniz */
      var scrollThreshold = 50;

      function onScroll() {
        if (window.scrollY > scrollThreshold) {
          header.classList.add('header--scrolled');
        } else {
          header.classList.remove('header--scrolled');
        }
      }

      /* passive: true — kaydırma performansını artırır */
      window.addEventListener('scroll', onScroll, { passive: true });
      /* Sayfa yüklendiğinde de kontrol et (sayfa ortasında yüklendiyse) */
      onScroll();
    }

    /* ============================================
       2. ACTIVE NAV LINK — Mevcut sayfa vurgulama
       Tarayıcıdaki URL'ye göre hangi menü linkinin
       aktif olduğunu tespit eder ve vurgular.
       ============================================ */

    /* Mevcut sayfa dosya adını al (ör: "index.html", "contact.html") */
    var currentPage = window.location.pathname.split('/').pop() || 'index.html';

    /* Masaüstü navigasyon linklerini güncelle */
    var navLinks = document.querySelectorAll('.nav__link');
    navLinks.forEach(function (link) {
      var href = link.getAttribute('href');
      link.classList.remove('nav__link--active');
      if (href === currentPage) {
        link.classList.add('nav__link--active');
      }
    });

    /* Mobil navigasyon linklerini güncelle */
    var mobileLinks = document.querySelectorAll('.mobile-nav__link');
    mobileLinks.forEach(function (link) {
      var href = link.getAttribute('href');
      link.classList.remove('mobile-nav__link--active');
      if (href === currentPage) {
        link.classList.add('mobile-nav__link--active');
      }
    });
  });
})();
