/**
 * Scroll Animations — Kaydırma Animasyonları
 * ============================================
 *
 * BU DOSYA: Elementler görünür alana girdiğinde animasyon tetikler.
 *
 * NASIL ÇALIŞIR:
 * 1. [data-animate] attribute'lu tüm elementleri bulur
 * 2. IntersectionObserver ile görünür alana girişini izler
 * 3. Element görünür olduğunda .animated class'ı ekler
 * 4. CSS transition ile animasyon gerçekleşir
 * 5. Her element sadece 1 kez animasyon yapar (unobserve)
 *
 * KULLANIM (HTML):
 * <div data-animate="fade-up">...</div>
 * <div data-animate="fade-up" data-delay="200">...</div>
 *
 * ANİMASYON TİPLERİ (animations.css'de tanımlı):
 * - fade-up: aşağıdan yukarı
 * - fade-down: yukarıdan aşağı
 * - fade-left: soldan sağa
 * - fade-right: sağdan sola
 * - scale-up: küçükten büyüğe
 * - fade-in: sadece opaklık
 *
 * ERİŞİLEBİLİRLİK:
 * prefers-reduced-motion: reduce olan kullanıcılarda animasyon devre dışı
 *
 * DEĞİŞTİRMEK İÇİN:
 * - threshold: ne kadar göründüğünde tetiklensin (0.1 = %10)
 * - rootMargin: tetikleme alanını kaydır
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    /* Azaltılmış hareket tercihi — animasyonları devre dışı bırak */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    /* Animasyon yapılacak tüm elementleri bul */
    var elements = document.querySelectorAll('[data-animate]');
    if (!elements.length) return;

    /* IntersectionObserver — element görünür alana girince tetiklenir */
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            /* .animated class'ı ekle — CSS transition başlar */
            entry.target.classList.add('animated');
            /* Bir kez animasyon yap, sonra izlemeyi bırak */
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,                     /* %10 görününce tetikle */
        rootMargin: '0px 0px -40px 0px'     /* 40px erken tetikle */
      }
    );

    /* Tüm elementleri izlemeye başla */
    elements.forEach(function (el) {
      observer.observe(el);
    });
  });
})();
