/**
 * Animated Counters — .counter görünür olunca 0'dan hedef sayıya sayar
 *
 * KULLANIM:
 *   <span class="counter" data-target="100" data-suffix="+">0</span>
 *   data-target: hedef sayı (zorunlu) · data-suffix: sona eklenecek metin (opsiyonel)
 *
 * DEĞİŞTİRMEK İÇİN: DURATION (ms), threshold (0.3 = %30 görününce), sayı biçimi (tr-TR → 1.000)
 */
(function () {
  'use strict';

  var DURATION = 2000;

  document.addEventListener('DOMContentLoaded', function () {
    var counters = document.querySelectorAll('.counter');
    if (!counters.length) return;

    function animateCounter(el) {
      var target = parseInt(el.getAttribute('data-target'), 10);
      var suffix = el.getAttribute('data-suffix') || '';
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / DURATION, 1);
        var eased = 1 - Math.pow(1 - progress, 3); /* easeOutCubic */
        el.textContent = Math.floor(eased * target).toLocaleString('tr-TR') + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }

      requestAnimationFrame(step);
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.3 });

    counters.forEach(function (c) { observer.observe(c); });
  });
})();
