/**
 * Animated Counters — Kaydırmada Sayaç Animasyonu
 * =================================================
 *
 * BU DOSYA: İstatistik sayılarını animasyonlu olarak sayar.
 *
 * NASIL ÇALIŞIR:
 * 1. .counter class'lı elementleri bulur
 * 2. IntersectionObserver ile görünür alana girişini izler
 * 3. Görünür olduğunda 0'dan hedef sayıya kadar animasyonlu sayar
 * 4. easeOutCubic easing ile doğal bir yavaşlama efekti verir
 * 5. requestAnimationFrame ile akıcı 60fps animasyon
 *
 * KULLANIM (HTML):
 * <span class="counter" data-target="100" data-suffix="+">0</span>
 *
 * HTML ATTRIBUTE'LARI:
 * - data-target: Hedef sayı (zorunlu) — ör: 100, 5000
 * - data-suffix: Sayı sonuna eklenecek metin (opsiyonel) — ör: "+", " MW", " ton"
 *
 * DEĞİŞTİRMEK İÇİN:
 * - duration: Animasyon süresi (ms) — varsayılan 2000
 * - threshold: Tetikleme eşiği — varsayılan 0.3 (%30 görününce)
 * - easeOutCubic: Farklı easing fonksiyonu kullanılabilir
 * - toLocaleString: Sayı formatını değiştirir (şimdi tr-TR: 1.000)
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    /* Tüm sayaç elementlerini bul */
    var counters = document.querySelectorAll('.counter');
    if (!counters.length) return;

    /**
     * Tek bir sayacı animasyonla say
     * @param {HTMLElement} el - .counter elementi
     */
    function animateCounter(el) {
      var target = parseInt(el.getAttribute('data-target'), 10);  /* Hedef sayı */
      var suffix = el.getAttribute('data-suffix') || '';           /* Ek metin (+, MW, vb.) */
      var duration = 2000;  /* Animasyon süresi: 2 saniye */
      var startTime = null;

      /**
       * Easing fonksiyonu — yavaşlayarak bitiş efekti
       * t: 0-1 arası ilerleme
       */
      function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
      }

      /**
       * Animasyon frame'i — her karede çağrılır
       * requestAnimationFrame ile 60fps akıcılık sağlanır
       */
      function step(timestamp) {
        if (!startTime) startTime = timestamp;

        /* İlerleme hesapla (0-1 arası) */
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var easedProgress = easeOutCubic(progress);
        var current = Math.floor(easedProgress * target);

        /* Sayıyı Türkçe formatla göster (1000 → 1.000) */
        el.textContent = current.toLocaleString('tr-TR') + suffix;

        /* Animasyon devam mı? */
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          /* Son değeri kesin olarak yaz */
          el.textContent = target.toLocaleString('tr-TR') + suffix;
        }
      }

      /* Animasyonu başlat */
      requestAnimationFrame(step);
    }

    /* IntersectionObserver — sayaç görünür olunca animasyonu başlat */
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);  /* Tekrar tetiklenmesini önle */
          }
        });
      },
      { threshold: 0.3 }  /* %30 görününce tetikle */
    );

    /* Tüm sayaçları izlemeye başla */
    counters.forEach(function (counter) {
      observer.observe(counter);
    });
  });
})();
