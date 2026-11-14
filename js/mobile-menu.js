/**
 * Mobile Menu — hamburger, çekmece ve overlay
 *
 * Hamburger ile aç/kapat; overlay tıklaması, Escape ve menü linki kapatır.
 * Menü açıkken sayfa kaydırması kilitlenir, aria-expanded güncellenir.
 *
 * DEĞİŞTİRMEK İÇİN: animasyon süresi → --transition-slow, çekmece genişliği → .mobile-nav width
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var hamburger = document.querySelector('.hamburger');
    var mobileNav = document.querySelector('.mobile-nav');
    var overlay = document.querySelector('.nav-overlay');
    if (!hamburger || !mobileNav) return;

    function setOpen(open) {
      hamburger.classList.toggle('hamburger--active', open);
      hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
      hamburger.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
      mobileNav.classList.toggle('mobile-nav--open', open);
      if (overlay) overlay.classList.toggle('nav-overlay--visible', open);
      document.body.style.overflow = open ? 'hidden' : '';
    }

    function close() { setOpen(false); }

    hamburger.addEventListener('click', function () {
      setOpen(!hamburger.classList.contains('hamburger--active'));
    });
    if (overlay) overlay.addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
    mobileNav.querySelectorAll('.mobile-nav__link').forEach(function (link) {
      link.addEventListener('click', close);
    });
  });
})();
