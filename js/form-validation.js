/**
 * İletişim Formu — doğrulama + Formspree gönderimi + localStorage kaydı
 *
 * - Alanlar blur'da doğrulanır; hatalı alan yazarken yeniden kontrol edilir
 * - Honeypot (_gotcha) doluysa gönderim sessizce iptal edilir
 * - Mesaj, Formspree sonucundan bağımsız olarak localStorage'a da yazılır (admin paneli okur)
 *
 * DEĞİŞTİRMEK İÇİN:
 * - Kurallar ve hata metinleri: VALIDATORS
 * - STORAGE_KEY: admin.js ile aynı olmalı
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'solarenerji_messages';

  /* Her kural: geçerliyse '', değilse hata metni döner */
  var VALIDATORS = {
    name: function (v) {
      return v.trim().length >= 2 ? '' : 'Lütfen adınızı girin (en az 2 karakter).';
    },
    email: function (v) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Geçerli bir e-posta adresi girin.';
    },
    phone: function (v) {
      return v.trim() === '' || /^[\d\s\+\-\(\)]{7,}$/.test(v) ? '' : 'Geçerli bir telefon numarası girin.';
    },
    subject: function (v) {
      return v.trim().length >= 2 ? '' : 'Lütfen bir konu girin.';
    },
    message: function (v) {
      return v.trim().length >= 10 ? '' : 'Mesajınız en az 10 karakter olmalıdır.';
    }
  };

  var FIELDS = ['name', 'email', 'phone', 'subject', 'service', 'source_page', 'message'];

  /* Hata metnini göster ya da ('' ile) temizle */
  function setError(input, message) {
    input.classList.toggle('error', !!message);
    var errorEl = input.parentElement.querySelector('.form-error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.toggle('visible', !!message);
    }
  }

  function validateField(input) {
    var validator = VALIDATORS[input.getAttribute('name')];
    if (!validator) return true;
    var error = validator(input.value);
    setError(input, error);
    return !error;
  }

  /* Admin paneli bu kaydı okur */
  function saveToLocalStorage(formData) {
    try {
      var messages = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      var msg = {
        id: 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        date: new Date().toISOString(),
        status: 'new'
      };
      FIELDS.forEach(function (f) { msg[f] = formData.get(f) || ''; });
      messages.push(msg);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn('localStorage kayıt hatası:', e);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('contact-form');
    if (!form) return;

    var successMsg = document.querySelector('.form-message--success');
    var errorMsg = document.querySelector('.form-message--error');
    var inputs = form.querySelectorAll('.form-input, .form-textarea');

    inputs.forEach(function (input) {
      input.addEventListener('blur', function () { validateField(input); });
      input.addEventListener('input', function () {
        if (input.classList.contains('error')) validateField(input);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var hp = form.querySelector('[name="_gotcha"]');
      if (hp && hp.value) return;

      var allValid = true;
      inputs.forEach(function (input) {
        if (!validateField(input)) allValid = false;
      });
      if (!allValid) return;

      var submitBtn = form.querySelector('[type="submit"]');
      var originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gönderiliyor...';
      submitBtn.disabled = true;

      var formData = new FormData(form);
      saveToLocalStorage(formData);

      fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      })
        .then(function (response) {
          if (!response.ok) throw new Error('Form gönderilemedi');
          if (successMsg) successMsg.classList.add('visible');
          if (errorMsg) errorMsg.classList.remove('visible');
          form.reset();
        })
        .catch(function () {
          if (errorMsg) errorMsg.classList.add('visible');
        })
        .finally(function () {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
        });
    });
  });
})();
