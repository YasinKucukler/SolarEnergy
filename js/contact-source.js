/**
 * Contact Source — contact.html?source=… ile gelindiğinde formu ön doldurur
 *
 * KULLANIM: contact.html?source=gunes-enerjisi | kamera | muhendislik
 * Başlık, açıklama, konu, hizmet seçimi ve gizli source_page alanı doldurulur.
 *
 * DEĞİŞTİRMEK İÇİN: yeni kaynak için SOURCES'a bir kayıt ekleyin
 * (anahtar = ?source= değeri = hizmet dropdown'ındaki option value).
 */
(function () {
  'use strict';

  var SOURCES = {
    'gunes-enerjisi': {
      title: 'Güneş Enerjisi Hakkında İletişim',
      desc: 'Güneş enerjisi sistemleri için teklif almak istiyorsunuz.',
      subject: 'Güneş Enerjisi Teklif Talebi'
    },
    'kamera': {
      title: 'Güvenlik Sistemleri Hakkında İletişim',
      desc: 'Güvenlik kamerası veya elektrikli çit için teklif almak istiyorsunuz.',
      subject: 'Güvenlik Sistemleri Teklif Talebi'
    },
    'muhendislik': {
      title: 'Mühendislik Desteği Hakkında İletişim',
      desc: 'Mühendislik hizmetleri için teklif almak istiyorsunuz.',
      subject: 'Mühendislik Desteği Teklif Talebi'
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    var source = new URLSearchParams(window.location.search).get('source');
    var config = source && Object.prototype.hasOwnProperty.call(SOURCES, source) ? SOURCES[source] : null;
    if (!config) return;

    var el = function (id) { return document.getElementById(id); };
    var title = el('contact-page-title');
    var desc = el('contact-page-desc');
    var subject = el('subject');
    var service = el('service');
    var sourceInput = el('source_page');

    if (title) title.textContent = config.title;
    if (desc) desc.textContent = config.desc;
    if (subject && !subject.value) subject.value = config.subject;
    if (service) service.value = source;
    if (sourceInput) sourceInput.value = source;
  });
})();
