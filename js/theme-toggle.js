/**
 * Theme Toggle — Karanlık/Aydınlık Tema Değiştirici
 * ==================================================
 *
 * BU DOSYA: Dark mode ve light mode arasında geçiş yapar.
 *
 * NASIL ÇALIŞIR:
 * 1. localStorage'dan tercih edilen temayı okur
 * 2. Yoksa sistem tercihini (prefers-color-scheme) kontrol eder
 * 3. data-theme attribute'u ile CSS değişkenlerini override eder
 * 4. Kullanıcı seçimini localStorage'a kaydeder
 *
 * DEĞİŞTİRMEK İÇİN:
 * - localStorage anahtarı: STORAGE_KEY değişkeni
 * - Varsayılan tema: getPreferred() fonksiyonu
 */
(function () {
  'use strict';

  /* localStorage anahtarı */
  var STORAGE_KEY = 'theme';

  /* Tema sabitleri */
  var DARK = 'dark';
  var LIGHT = 'light';

  /**
   * Tercih edilen temayı al
   * Öncelik: localStorage > sistem tercihi > light (varsayılan)
   */
  function getPreferred() {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
    /* Sistem karanlık modda mı kontrol et */
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? DARK : LIGHT;
  }

  /**
   * Temayı uygula
   * HTML elementine data-theme attribute'u ekler ve localStorage'a kaydeder
   */
  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }

  /**
   * Temayı değiştir — dark ise light, light ise dark yap
   */
  function toggle() {
    var current = document.documentElement.getAttribute('data-theme') || LIGHT;
    apply(current === DARK ? LIGHT : DARK);
  }

  /* Sayfa yüklendiğinde temayı uygula (inline script'in yedek güvenliği) */
  apply(getPreferred());

  /* Tema değiştirme butonlarına tıklama olayı ekle */
  document.addEventListener('DOMContentLoaded', function () {
    var buttons = document.querySelectorAll('.theme-toggle');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', toggle);
    });
  });
})();
