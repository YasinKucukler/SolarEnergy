/**
 * Mobile Menu — Hamburger Menü, Çekmece ve Overlay
 * ==================================================
 *
 * BU DOSYA: Mobil cihazlarda hamburger menü işlevselliğini yönetir.
 *
 * ÖZELLİKLER:
 * - Hamburger butonu tıklama ile çekmeceyi açar/kapatır
 * - Arka plan overlay'ı (yarı saydam karartma)
 * - Escape tuşu ile kapatma
 * - Menü linki tıklayınca otomatik kapanma
 * - body scroll kilitleme (menü açıkken)
 * - ARIA erişilebilirlik desteği (aria-expanded)
 *
 * DEĞİŞTİRMEK İÇİN:
 * - Animasyon süresi: CSS'de --transition-slow (350ms)
 * - Çekmece genişliği: CSS'de .mobile-nav width (300px)
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    /* DOM elementlerini seç */
    var hamburger = document.querySelector('.hamburger');
    var mobileNav = document.querySelector('.mobile-nav');
    var overlay = document.querySelector('.nav-overlay');

    /* Elementler yoksa çık (masaüstünde gereksiz çalışmasını önle) */
    if (!hamburger || !mobileNav) return;

    /**
     * Menüyü aç
     * - Hamburger'ı X şekline dönüştür
     * - Çekmeceyi sağdan kaydır
     * - Overlay'ı göster
     * - Sayfa kaydırmayı kilitle
     */
    function openMenu() {
      hamburger.classList.add('hamburger--active');
      hamburger.setAttribute('aria-expanded', 'true');
      hamburger.setAttribute('aria-label', 'Menüyü kapat');
      mobileNav.classList.add('mobile-nav--open');
      if (overlay) overlay.classList.add('nav-overlay--visible');
      document.body.style.overflow = 'hidden';
    }

    /**
     * Menüyü kapat
     * - Hamburger'ı normal hale getir
     * - Çekmeceyi gizle
     * - Overlay'ı kaldır
     * - Sayfa kaydırmayı serbest bırak
     */
    function closeMenu() {
      hamburger.classList.remove('hamburger--active');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Menüyü aç');
      mobileNav.classList.remove('mobile-nav--open');
      if (overlay) overlay.classList.remove('nav-overlay--visible');
      document.body.style.overflow = '';
    }

    /* Hamburger butonuna tıklama — aç/kapat */
    hamburger.addEventListener('click', function () {
      var isOpen = hamburger.classList.contains('hamburger--active');
      isOpen ? closeMenu() : openMenu();
    });

    /* Overlay'a tıklama — menüyü kapat */
    if (overlay) {
      overlay.addEventListener('click', closeMenu);
    }

    /* Escape tuşu — menüyü kapat */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });

    /* Menü linklerine tıklama — menüyü kapat ve sayfaya git */
    var links = mobileNav.querySelectorAll('.mobile-nav__link');
    links.forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
  });
})();
