/**
 * Scroll Animations — [data-animate] elementleri görünür alana girince .animated ekler
 *
 * KULLANIM:
 *   <div data-animate="fade-up">...</div>
 *   <div data-animate="fade-up" data-delay="200">...</div>
 * Tipler animations.css'te: fade-up, fade-down, fade-left, fade-right, scale-up, fade-in
 *
 * prefers-reduced-motion açıksa hiçbir şey yapılmaz.
 *
 * DEĞİŞTİRMEK İÇİN: threshold (0.1 = %10 görününce), rootMargin (erken tetikleme)
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var elements = document.querySelectorAll('[data-animate]');
    if (!elements.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('animated');
        observer.unobserve(entry.target); /* her element bir kez */
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(function (el) { observer.observe(el); });
  });
})();
