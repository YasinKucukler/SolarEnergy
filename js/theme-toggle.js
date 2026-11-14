/**
 * Theme Toggle — karanlık/aydınlık tema
 *
 * Öncelik: localStorage > sistem tercihi (prefers-color-scheme) > aydınlık.
 * Tema <html data-theme="…"> ile uygulanır; tema flaşını <head>'deki inline script önler,
 * bu dosya onun yedeğidir.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'theme';
  var root = document.documentElement;

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }

  apply(localStorage.getItem(STORAGE_KEY) ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        apply(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
      });
    });
  });
})();
