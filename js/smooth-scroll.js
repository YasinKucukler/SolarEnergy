/**
 * Smooth Scroll — Yumuşak Kaydırma (Anchor Linkler)
 * ===================================================
 *
 * BU DOSYA: # ile başlayan (anchor) linklere tıklandığında
 * hedef bölüme yumuşak kaydırma efekti uygular.
 *
 * NASIL ÇALIŞIR:
 * 1. a[href^="#"] (# ile başlayan) tüm linkleri bulur
 * 2. Tıklama olayını yakalar ve varsayılan davranışı engeller
 * 3. Hedef elementin pozisyonunu hesaplar
 * 4. Sabit navbar yüksekliğini çıkarır (altına gizlenmemesi için)
 * 5. window.scrollTo ile yumuşak kaydırma yapar
 *
 * DEĞİŞTİRMEK İÇİN:
 * - Kaydırma davranışı: behavior parametresi ('smooth' veya 'auto')
 * - Ek offset: navHeight'a ek piksel eklenebilir
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    /* Tüm anchor linkleri bul (# ile başlayan href'ler) */
    var links = document.querySelectorAll('a[href^="#"]');

    links.forEach(function (link) {
      link.addEventListener('click', function (e) {
        var href = this.getAttribute('href');

        /* Sadece # ise hiçbir şey yapma */
        if (href === '#') return;

        /* Hedef elementi bul */
        var target = document.querySelector(href);
        if (!target) return;

        /* Varsayılan atlama davranışını engelle */
        e.preventDefault();

        /* Sabit navbar yüksekliğini al — kaydırma offset'i için */
        var navHeight = document.querySelector('.header')
          ? document.querySelector('.header').offsetHeight
          : 0;

        /* Hedef pozisyonu hesapla (navbar yüksekliğini çıkar) */
        var targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

        /* Yumuşak kaydırma */
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      });
    });
  });
})();
