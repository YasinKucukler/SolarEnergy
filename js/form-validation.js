/**
 * Form Validation + Formspree Submission + localStorage Kayıt
 * ===========================================================
 *
 * BU DOSYA: İletişim formunun doğrulama ve gönderim işlemlerini yönetir.
 *
 * ÖZELLİKLER:
 * - Gerçek zamanlı alan doğrulama (blur + input olayları)
 * - Honeypot spam koruması
 * - Formspree'ye AJAX ile gönderim
 * - localStorage'a kayıt (admin paneli için)
 * - Gönderim sırasında spinner animasyonu
 *
 * DOĞRULAMA KURALLARI:
 * - Ad Soyad: minimum 2 karakter
 * - E-posta: geçerli format (x@x.x)
 * - Telefon: opsiyonel, girilirse min 7 karakter
 * - Konu: minimum 2 karakter
 * - Mesaj: minimum 10 karakter
 *
 * DEĞİŞTİRMEK İÇİN:
 * - Doğrulama kuralları: validators objesindeki fonksiyonları düzenleyin
 * - Hata mesajları: her fonksiyondaki string'leri değiştirin
 * - localStorage anahtarı: STORAGE_KEY değişkenini değiştirin
 */
(function () {
  'use strict';

  /* localStorage anahtarı — admin.js ile aynı olmalı */
  var STORAGE_KEY = 'solarenerji_messages';

  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('contact-form');
    if (!form) return;

    /* Başarı ve hata mesajı elementleri */
    var successMsg = document.querySelector('.form-message--success');
    var errorMsg = document.querySelector('.form-message--error');

    /**
     * Doğrulama kuralları
     * Her alan için bir fonksiyon: boşsa hata mesajı döner, geçerliyse boş string
     * DEĞİŞTİRMEK İÇİN: Kuralları veya hata mesajlarını burada değiştirin
     */
    var validators = {
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

    /** Hata mesajını göster — input'a kırmızı kenarlık + altına hata metni */
    function showError(input, message) {
      input.classList.add('error');
      var errorEl = input.parentElement.querySelector('.form-error');
      if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add('visible');
      }
    }

    /** Hata mesajını temizle */
    function clearError(input) {
      input.classList.remove('error');
      var errorEl = input.parentElement.querySelector('.form-error');
      if (errorEl) {
        errorEl.textContent = '';
        errorEl.classList.remove('visible');
      }
    }

    /** Tek bir alanı doğrula */
    function validateField(input) {
      var name = input.getAttribute('name');
      var validator = validators[name];
      if (!validator) return true;

      var error = validator(input.value);
      if (error) {
        showError(input, error);
        return false;
      }
      clearError(input);
      return true;
    }

    /* ---- Gerçek Zamanlı Doğrulama ---- */
    /* blur: alandan çıkınca doğrula */
    /* input: yazarken hata varsa temizle */
    var inputs = form.querySelectorAll('.form-input, .form-textarea');
    inputs.forEach(function (input) {
      input.addEventListener('blur', function () {
        validateField(this);
      });

      input.addEventListener('input', function () {
        if (this.classList.contains('error')) {
          validateField(this);
        }
      });
    });

    /* ---- Form Gönderimi ---- */
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      /* Honeypot kontrolü — bot doldurduysa sessizce iptal et */
      var hp = form.querySelector('[name="_gotcha"]');
      if (hp && hp.value) return;

      /* Tüm alanları doğrula */
      var allValid = true;
      inputs.forEach(function (input) {
        if (!validateField(input)) allValid = false;
      });

      if (!allValid) return;

      /* Gönderim butonu durumu — spinner göster */
      var submitBtn = form.querySelector('[type="submit"]');
      var originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gönderiliyor...';
      submitBtn.disabled = true;

      /* Form verilerini topla */
      var formData = new FormData(form);

      /**
       * localStorage'a kaydet — Admin paneli bu veriyi okur
       * Formspree'den bağımsız olarak çalışır
       */
      saveToLocalStorage(formData);

      /* Formspree'ye gönder */
      fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      })
        .then(function (response) {
          if (response.ok) {
            /* Başarılı — yeşil mesaj göster, formu sıfırla */
            if (successMsg) {
              successMsg.classList.add('visible');
            }
            form.reset();
            if (errorMsg) errorMsg.classList.remove('visible');
          } else {
            throw new Error('Form gönderilemedi');
          }
        })
        .catch(function () {
          /* Hata — kırmızı mesaj göster */
          /* NOT: localStorage kaydı yine de yapılmış olur */
          if (errorMsg) {
            errorMsg.classList.add('visible');
          }
        })
        .finally(function () {
          /* Butonu eski haline getir */
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
        });
    });

    /**
     * Form verisini localStorage'a kaydet
     * Admin panelinde görüntülenmek üzere mesajı JSON olarak saklar
     *
     * DEĞİŞTİRMEK İÇİN:
     * - Ek alanlar eklemek için messageObj'ye yeni key ekleyin
     * - STORAGE_KEY'i değiştirerek farklı bir anahtar kullanın
     */
    function saveToLocalStorage(formData) {
      try {
        /* Mevcut mesajları oku */
        var messages = [];
        var existing = localStorage.getItem(STORAGE_KEY);
        if (existing) {
          messages = JSON.parse(existing);
        }

        /* Yeni mesaj objesi oluştur */
        var messageObj = {
          name: formData.get('name') || '',
          email: formData.get('email') || '',
          phone: formData.get('phone') || '',
          subject: formData.get('subject') || '',
          service: formData.get('service') || '',
          source_page: formData.get('source_page') || '',
          message: formData.get('message') || '',
          date: new Date().toISOString(),
          status: 'new'  /* Varsayılan durum: yeni */
        };

        /* Diziye ekle ve kaydet */
        messages.push(messageObj);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch (e) {
        /* localStorage hatası — sessizce geç */
        console.warn('localStorage kayıt hatası:', e);
      }
    }
  });
})();
