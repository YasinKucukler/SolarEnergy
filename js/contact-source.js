/**
 * Contact Source — URL'den kaynak sayfa tespiti
 * =============================================
 *
 * BU DOSYA: İletişim sayfasına ?source= parametresi ile
 * gelindiğinde otomatik olarak:
 * - Sayfa başlığını günceller
 * - Hizmet dropdown'ını seçer
 * - Konu alanını doldurur
 * - Gizli source_page input'unu set eder
 *
 * KULLANIM:
 * contact.html?source=gunes-enerjisi
 * contact.html?source=kamera
 * contact.html?source=muhendislik
 *
 * DEĞİŞTİRMEK İÇİN:
 * - Yeni kaynak eklemek için sourceMap objesine yeni key-value ekleyin
 * - Başlık ve açıklama metinlerini değiştirin
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {

    // URL'den ?source= parametresini oku
    var params = new URLSearchParams(window.location.search);
    var source = params.get('source');

    // Kaynak yoksa hiçbir şey yapma
    if (!source) return;

    /**
     * Kaynak haritası — her kaynak için özelleştirmeler
     * DEĞİŞTİRMEK İÇİN: Yeni hizmet eklemek için buraya yeni key ekleyin
     *
     * Yapı:
     * - title: Sayfa hero başlığı
     * - desc: Sayfa hero açıklaması
     * - subject: Konu alanına yazılacak metin
     * - service: Dropdown'da seçilecek option value
     */
    var sourceMap = {
      'gunes-enerjisi': {
        title: 'Güneş Enerjisi Hakkında İletişim',
        desc: 'Güneş enerjisi sistemleri için teklif almak istiyorsunuz.',
        subject: 'Güneş Enerjisi Teklif Talebi',
        service: 'gunes-enerjisi'
      },
      'kamera': {
        title: 'Güvenlik Sistemleri Hakkında İletişim',
        desc: 'Güvenlik kamerası veya elektrikli çit için teklif almak istiyorsunuz.',
        subject: 'Güvenlik Sistemleri Teklif Talebi',
        service: 'kamera'
      },
      'muhendislik': {
        title: 'Mühendislik Desteği Hakkında İletişim',
        desc: 'Mühendislik hizmetleri için teklif almak istiyorsunuz.',
        subject: 'Mühendislik Desteği Teklif Talebi',
        service: 'muhendislik'
      }
    };

    // Eşleşen kaynak var mı kontrol et
    var config = sourceMap[source];
    if (!config) return;

    // Sayfa başlığını güncelle
    var titleEl = document.getElementById('contact-page-title');
    if (titleEl) {
      titleEl.textContent = config.title;
    }

    // Sayfa açıklamasını güncelle
    var descEl = document.getElementById('contact-page-desc');
    if (descEl) {
      descEl.textContent = config.desc;
    }

    // Konu alanını otomatik doldur
    var subjectEl = document.getElementById('subject');
    if (subjectEl && !subjectEl.value) {
      subjectEl.value = config.subject;
    }

    // Hizmet dropdown'ını otomatik seç
    var serviceEl = document.getElementById('service');
    if (serviceEl) {
      serviceEl.value = config.service;
    }

    // Gizli kaynak input'unu set et
    var sourceInput = document.getElementById('source_page');
    if (sourceInput) {
      sourceInput.value = source;
    }
  });
})();
