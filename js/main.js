/**
 * Main — Sticky header gölgesi + aktif menü linki
 *
 * DEĞİŞTİRMEK İÇİN:
 * - SCROLL_THRESHOLD: kaç piksel kaydırınca header'a gölge eklensin
 */
(function () {
  'use strict';

  var SCROLL_THRESHOLD = 50;

  document.addEventListener('DOMContentLoaded', function () {
    /* Kaydırınca header'a .header--scrolled ekle */
    var header = document.querySelector('.header');
    if (header) {
      var onScroll = function () {
        header.classList.toggle('header--scrolled', window.scrollY > SCROLL_THRESHOLD);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    /* Bulunulan sayfanın linkini vurgula (masaüstü + mobil menü) */
    var currentPage = window.location.pathname.split('/').pop() || 'index.html';
    [['.nav__link', 'nav__link--active'], ['.mobile-nav__link', 'mobile-nav__link--active']].forEach(function (pair) {
      document.querySelectorAll(pair[0]).forEach(function (link) {
        link.classList.toggle(pair[1], link.getAttribute('href') === currentPage);
      });
    });
  });
})();
