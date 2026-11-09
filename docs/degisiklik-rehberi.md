# SolarEnerji -- Degisiklik Rehberi

Bu rehber, SolarEnerji web sitesinde degisiklik yapmak isteyen kullanicilar icin adim adim talimatlar icerir. Her bolum, belirli bir degisiklik turunu aciklar ve ilgili dosyalari gosterir.

**Onemli:** Degisiklik yapmadan once dosyalarinizin yedegini alin.

---

## Icindekiler

1. [Icerik Degistirme](#1-icerik-degistirme)
2. [Renk Degistirme](#2-renk-degistirme)
3. [Logo Degistirme](#3-logo-degistirme)
4. [Iletisim Bilgileri](#4-iletisim-bilgileri)
5. [Sosyal Medya](#5-sosyal-medya)
6. [Istatistikler](#6-istatistikler)
7. [Musteri Yorumlari](#7-musteri-yorumlari)
8. [Hizmet Ekleme/Cikarma](#8-hizmet-eklemecikarma)
9. [Gorsel Degistirme](#9-gorsel-degistirme)
10. [SEO](#10-seo)
11. [Formspree](#11-formspree)
12. [Admin Sifresi](#12-admin-sifresi)
13. [Google Haritalar](#13-google-haritalar)
14. [WhatsApp/Telefon](#14-whatsapptelefon)
15. [Dark Mode](#15-dark-mode)
16. [Font Degistirme](#16-font-degistirme)
17. [PHP Gecisi](#17-php-gecisi)
18. [Proje Galerisi (Tamamlanan Isler)](#18-proje-galerisi-tamamlanan-isler)

---

## 1. Icerik Degistirme

Tum HTML dosyalarinda icerik degistirilecek alanlarin yanina `DEGISTIRMEK ICIN` yorum etiketleri eklenmistir. Bu etiketleri bulmak icin dosyada `DEGISTIRMEK ICIN` ifadesini arayin.

### Genel Yontem

1. Ilgili HTML dosyasini bir metin editoru ile acin (VS Code, Notepad++ vb.)
2. `Ctrl+F` ile `DEGISTIRMEK ICIN` arayin
3. Yorumun altindaki metni kendi iceriginiZle degistirin
4. Dosyayi kaydedin ve tarayicida kontrol edin

### Sayfa Bazinda Icerik Konumlari

#### index.html (Ana Sayfa)

```html
<!-- Hero bolumu -->
<h1 class="hero__title">BURAYA BASLIK YAZIN</h1>
<p class="hero__subtitle">BURAYA ALT BASLIK YAZIN</p>

<!-- Hizmet kartlari -->
<h3 class="card__title">Hizmet Adi</h3>
<p class="card__text">Hizmet aciklamasi...</p>
```

#### gunes-enerjisi.html (Gunes Enerjisi)

- Hero baslik ve aciklama
- 6 adet hizmet karti (baslik + aciklama + ozellik listesi)
- CTA bolumu metni

#### guvenlik-sistemleri.html (Kamera Kurulumu)

- Hero baslik ve aciklama
- 4 adet hizmet karti (baslik + aciklama + ozellik listesi)
- Ozellikler/avantajlar bolumu

#### muhendislik.html (Muhendislik Destekleri)

- Hero baslik ve aciklama
- 3 adet hizmet karti (baslik + aciklama + ozellik listesi)
- Ozellikler/avantajlar bolumu

#### about.html (Hakkimizda)

- Sirket hikayesi metni
- Ekip uyesi bilgileri (isim, unvan, aciklama)
- Degerlerimiz bolumu
- Sertifika/partner isimleri

#### contact.html (Iletisim)

- Iletisim bilgileri (sag kolon)
- Calisma saatleri
- Form alan etiketleri

---

## 2. Renk Degistirme

Tum renkler `css/variables.css` dosyasinda merkezi olarak yonetilir. Bir rengi degistirdiginizde tum sitede otomatik olarak degisir.

### Ana Renkler

`css/variables.css` dosyasini acin ve su degiskenleri duzenleyin:

```css
:root {
  /* Ana arka plan rengi (navbar, koyu alanlar) */
  --color-primary: #0f2440;        /* Lacivert */
  --color-primary-light: #1a3a5c;
  --color-primary-dark: #091828;

  /* Marka yesili (butonlar, ikonlar) */
  --color-green: #0f766e;          /* Teal */
  --color-green-light: #14b8a6;
  --color-green-dark: #0d5f58;

  /* Vurgu rengi / Gunes Enerjisi rengi */
  --color-accent: #f59e0b;         /* Gold/Amber */
  --color-accent-light: #fbbf24;
  --color-accent-dark: #d97706;
}
```

### Hizmet Renklerini Degistirme

```css
:root {
  /* Kamera hizmeti (mavi tonlar) */
  --color-camera: #3b82f6;
  --color-camera-light: #60a5fa;
  --color-camera-dark: #2563eb;
  --color-camera-bg: rgba(59, 130, 246, 0.1);

  /* Muhendislik hizmeti (mor tonlar) */
  --color-engineering: #8b5cf6;
  --color-engineering-light: #a78bfa;
  --color-engineering-dark: #7c3aed;
  --color-engineering-bg: rgba(139, 92, 246, 0.1);
}
```

### Ornek: Kamera Rengini Kirmiziya Cevirmek

```css
--color-camera: #ef4444;
--color-camera-light: #f87171;
--color-camera-dark: #dc2626;
--color-camera-bg: rgba(239, 68, 68, 0.1);
```

**Ipucu:** Renk secerken [coolors.co](https://coolors.co) veya [tailwindcss.com/docs/colors](https://tailwindcss.com/docs/colors) sitelerinden yardim alabilirsiniz.

---

## 3. Logo Degistirme

### Logo Dosyalari

| Dosya | Kullanim |
|-------|----------|
| `img/logo.png` | Header ve footer amblemi. Arka plani seffaf, KCK harfleri koyu zemin icin beyaza cevrilmis (240x128) |
| `img/favicon.png` | Tarayici sekme ikonu (64x64, orijinal renkler) |
| `img/apple-touch-icon.png` | iPhone/iPad ana ekran ikonu (180x180, beyaz zemin) |
| `img/logo-full.jpg` | Sloganli tam logo (600px). `index.html` JSON-LD `logo` alaninda kullanilir |

**Onemli:** Header ve footer koyu renkli oldugu icin `img/logo.png` dosyasinda arka plan **seffaf** ve koyu lacivert harfler **beyaz** olmalidir. Orijinal (beyaz zeminli) logo dogrudan konursa beyaz kutu gibi gorunur, lacivert harfler de zeminde kaybolur.

### HTML Yapisi

Tum HTML dosyalarinda header bolumunde:

```html
<a href="index.html" class="logo" aria-label="Ana Sayfa">
  <img src="img/logo.png" alt="KCK Tech" width="83" height="44" class="logo__img">
  <span class="logo__text"><span class="logo__name">KÜÇÜKLER</span><span class="logo__sub">MÜHENDİSLİK</span></span>
</a>
```

- Amblem boyutu: `css/navigation.css` → `.logo__img { height: 44px; }`
- Yanindaki yazi: `logo__name` (ust satir) ve `logo__sub` (alt satir)
- Footer'da ayni yapi `footer__logo-img` / `footer__logo-name` / `footer__logo-sub` siniflariyla yer alir (`css/footer.css`)

### Favicon

Her HTML dosyasinin `<head>` bolumunde:

```html
<link rel="icon" href="img/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="img/apple-touch-icon.png">
```

**Not:** Logo 7 HTML dosyasinda da degistirilmelidir: `index.html`, `gunes-enerjisi.html`, `guvenlik-sistemleri.html`, `muhendislik.html`, `contact.html`, `admin.html`, `about.html`.

---

## 4. Iletisim Bilgileri

Iletisim bilgileri iki yerde guncellenmeli:

### Yer 1: Footer (Tum Sayfalar)

Her HTML dosyasinin footer bolumunde iletisim bilgilerini bulun:

```html
<!-- DEGISTIRMEK ICIN: Telefon numaranizi yazin -->
<a href="tel:+905551234567">+90 555 123 45 67</a>

<!-- DEGISTIRMEK ICIN: E-posta adresinizi yazin -->
<a href="mailto:info@solarenerji.com">info@solarenerji.com</a>

<!-- DEGISTIRMEK ICIN: Adresinizi yazin -->
<p>Ornek Mah. Gunes Cad. No:1, Ankara</p>
```

**7 HTML dosyasinda** da ayni degisikligi yapin.

### Yer 2: contact.html (Iletisim Sayfasi)

`contact.html` dosyasindaki sag kolonda ayri iletisim bilgileri ve calisma saatleri vardir:

```html
<div class="contact-info">
  <!-- Telefon, e-posta, adres bilgilerini guncelleyin -->
  <!-- Calisma saatlerini guncelleyin -->
</div>
```

### Toplu Degistirme Ipucu

VS Code kullaniyorsaniz: `Ctrl+Shift+H` ile tum dosyalarda toplu bul-degistir yapabilirsiniz. Ornegin `+90 555 123 45 67` ifadesini gercek numaranizla degistirin.

---

## 5. Sosyal Medya

Footer'daki sosyal medya linkleri su anda `#` (bos) olarak ayarlidir. Gercek URL'lerinizle degistirin.

### Her HTML Dosyasinin Footer'inda

```html
<!-- DEGISTIRMEK ICIN: Sosyal medya URL'lerinizi yazin -->
<div class="footer__social">
  <a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
  <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
  <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
  <a href="#" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
</div>
```

### Ornek Degisiklik

```html
<a href="https://www.facebook.com/solarenerji" aria-label="Facebook" target="_blank" rel="noopener">
  <i class="fab fa-facebook-f"></i>
</a>
<a href="https://www.instagram.com/solarenerji" aria-label="Instagram" target="_blank" rel="noopener">
  <i class="fab fa-instagram"></i>
</a>
```

**Ipucu:** `target="_blank"` yeni sekmede acar. `rel="noopener"` guvenlik icindir.

### Yeni Sosyal Medya Platformu Ekleme

Ornegin YouTube eklemek icin:

```html
<a href="https://www.youtube.com/@solarenerji" aria-label="YouTube" target="_blank" rel="noopener">
  <i class="fab fa-youtube"></i>
</a>
```

Font Awesome ikon listesi: [fontawesome.com/icons](https://fontawesome.com/icons?d=gallery&s=brands)

---

## 6. Istatistikler

Ana sayfadaki (`index.html`) animasyonlu sayaclar `data-target` attributesi ile yonetilir.

### Sayac HTML Yapisi

```html
<div class="stat-card">
  <!-- DEGISTIRMEK ICIN: data-target degerini degistirin -->
  <div class="stat-card__number">
    <span class="counter" data-target="1500" data-suffix="+">0</span>
  </div>
  <div class="stat-card__label">Kurulan Panel</div>
</div>
```

### Degistirmek Icin

1. `index.html` dosyasini acin
2. `data-target` ifadesini arayin
3. Degerleri kendi sayilarinizla guncelleyin:

| Alan             | data-target | data-suffix | Aciklama                    |
|------------------|-------------|-------------|-----------------------------|
| Kurulan Panel    | `1500`      | `+`         | Toplam kurulan panel sayisi |
| Toplam Kapasite  | `50`        | ` MW`       | Megawatt cinsinden kapasite |
| Mutlu Musteri    | `800`       | `+`         | Musteri sayisi              |
| CO2 Tasarrufu    | `2000`      | ` ton`      | Ton cinsinden CO2 azaltimi  |

### Ornek

```html
<!-- 2500+ Kurulan Panel -->
<span class="counter" data-target="2500" data-suffix="+">0</span>
```

**Not:** Sayac animasyonu otomatik olarak calisir. `data-suffix` degerindeki bosluga dikkat edin (ornegin ` MW` bas bosluklu).

---

## 7. Musteri Yorumlari

Ana sayfadaki (`index.html`) musteri yorumlari (testimonials) bolumunu duzenlemek icin:

### Mevcut Yorum Yapisini Bulun

```html
<div class="testimonial-card" data-animate="fade-up">
  <div class="testimonial-card__stars">
    <i class="fas fa-star"></i>
    <i class="fas fa-star"></i>
    <i class="fas fa-star"></i>
    <i class="fas fa-star"></i>
    <i class="fas fa-star"></i>
  </div>
  <p class="testimonial-card__text">
    "Musteri yorumu buraya yazilir..."
  </p>
  <div class="testimonial-card__author">
    <div class="testimonial-card__avatar">MK</div>
    <div>
      <div class="testimonial-card__name">Mehmet Kaya</div>
      <div class="testimonial-card__role">Fabrika Sahibi</div>
    </div>
  </div>
</div>
```

### Yorum Degistirme

1. `testimonial-card__text` icindeki metni degistirin
2. `testimonial-card__name` icindeki ismi degistirin
3. `testimonial-card__role` icindeki unvani degistirin
4. `testimonial-card__avatar` icindeki bas harfleri degistirin

### Yeni Yorum Ekleme

Mevcut bir `testimonial-card` div'ini kopyalayip grid'in icine yapistirin. `data-delay` degerini siraya gore ayarlayin:

```html
<!-- Yeni yorum (4. kart) -->
<div class="testimonial-card" data-animate="fade-up" data-delay="400">
  <div class="testimonial-card__stars">
    <i class="fas fa-star"></i>
    <i class="fas fa-star"></i>
    <i class="fas fa-star"></i>
    <i class="fas fa-star"></i>
    <i class="fas fa-star"></i>
  </div>
  <p class="testimonial-card__text">
    "Yeni musteri yorumu buraya..."
  </p>
  <div class="testimonial-card__author">
    <div class="testimonial-card__avatar">AY</div>
    <div>
      <div class="testimonial-card__name">Ayse Yilmaz</div>
      <div class="testimonial-card__role">Ev Sahibi</div>
    </div>
  </div>
</div>
```

### Yildiz Sayisini Degistirme

4 yildiz icin son `fa-star` ikonunu `fa-star-half-alt` veya bos birakin:

```html
<i class="fas fa-star"></i>
<i class="fas fa-star"></i>
<i class="fas fa-star"></i>
<i class="fas fa-star"></i>
<i class="far fa-star"></i>  <!-- Bos yildiz -->
```

---

## 8. Hizmet Ekleme/Cikarma

### Yeni Hizmet Karti Ekleme

Her hizmet sayfasindaki kartlar ayni HTML yapisini kullanir. Yeni bir kart eklemek icin mevcut bir karti kopyalayin.

#### Ornek: gunes-enerjisi.html'e Yeni Kart

```html
<!-- Mevcut kartlarin bulundugu grid'in icine yapistirin -->
<div class="card" data-animate="fade-up" data-delay="600">
  <div class="card__icon">
    <i class="fas fa-bolt"></i>  <!-- Font Awesome ikon -->
  </div>
  <h3 class="card__title">Yeni Hizmet Adi</h3>
  <p class="card__text">Hizmet aciklamasi buraya yazilir.</p>
  <ul class="card__features">
    <li><i class="fas fa-check"></i> Ozellik 1</li>
    <li><i class="fas fa-check"></i> Ozellik 2</li>
    <li><i class="fas fa-check"></i> Ozellik 3</li>
  </ul>
</div>
```

### Kart Cikarma

Ilgili `<div class="card">` blogunun tamamini (acilis ve kapanis etiketi dahil) silin.

### Yeni Hizmet Sayfasi Ekleme

1. Mevcut bir hizmet sayfasini kopyalayin (ornegin `guvenlik-sistemleri.html`)
2. Icerigini yeni hizmetinize gore degistirin
3. `css/pages/` altina yeni bir CSS dosyasi olusturun
4. Ilgili HTML'in `<head>` bolumune yeni CSS'i ekleyin:
   ```html
   <link rel="stylesheet" href="css/pages/yeni-hizmet.css">
   ```
5. Tum sayfalardaki navigasyona yeni linki ekleyin
6. `contact-source.js` dosyasindaki `sourceMap` objesine yeni kaynagi ekleyin:
   ```javascript
   'yeni-hizmet': {
     title: 'Yeni Hizmet Hakkinda Iletisim',
     desc: 'Yeni hizmet icin teklif almak istiyorsunuz.',
     subject: 'Yeni Hizmet Teklif Talebi',
     service: 'yeni-hizmet'
   }
   ```
7. `contact.html` formundaki hizmet dropdown'ina yeni secenegi ekleyin:
   ```html
   <option value="yeni-hizmet">Yeni Hizmet</option>
   ```

---

## 9. Gorsel Degistirme

Su anda kartlardaki ve hero bolumlerindeki gorseller CSS gradient placeholder'lari kullanmaktadir. Bunlari gercek gorsellerle degistirmek icin:

### Yontem 1: HTML img Etiketi ile

Kartta gradient yerine gercek gorsel kullanmak icin:

```html
<!-- Once (gradient placeholder) -->
<div class="card__image" style="background: linear-gradient(...)"></div>

<!-- Sonra (gercek gorsel) -->
<div class="card__image">
  <img src="img/hizmet-gorseli.jpg" alt="Hizmet aciklamasi" loading="lazy">
</div>
```

### Yontem 2: CSS Arka Plan Gorseli ile

```css
.card__image {
  background-image: url('../img/hizmet-gorseli.jpg');
  background-size: cover;
  background-position: center;
}
```

### Gorsel Onerileri

- **Format:** WebP (en iyi sikistirma) veya JPEG (genis uyumluluk)
- **Boyut:** Kart gorselleri icin 600x400px, hero icin 1920x800px
- **Dosya boyutu:** Her gorsel 200KB altinda olmali (performans icin)
- **`loading="lazy"`:** Sayfanin alt kismindaki gorsellere ekleyin (tembel yukleme)
- **`alt` metni:** Her gorsele aciklayici alt metin yazin (SEO ve erisilebirlilk)

### Gorsel Dosyalarini Ekleme

1. Gorsellerinizi `img/` klasorune kopyalayin
2. Alt klasorler olusturabilirsiniz: `img/solar/`, `img/kamera/`, `img/muhendislik/`
3. HTML'deki yollari guncelleyin

---

## 10. SEO

Her sayfanin `<head>` bolumunde SEO etiketleri bulunur. Bunlari sitenizin gercek bilgileriyle guncelleyin.

### Title Etiketi

```html
<!-- DEGISTIRMEK ICIN: max 60 karakter -->
<title>SolarEnerji | Enerji, Guvenlik ve Muhendislik Cozumleri</title>
```

Her sayfada benzersiz bir title kullanin.

### Meta Description

```html
<!-- DEGISTIRMEK ICIN: max 160 karakter -->
<meta name="description" content="Gunes enerjisi kurulumu, guvenlik kamerasi sistemleri ve muhendislik destekleri.">
```

### Canonical URL

```html
<!-- DEGISTIRMEK ICIN: gercek domain adresinizi yazin -->
<link rel="canonical" href="https://www.orneksite.com/">
```

**Tum sayfalarda** `orneksite.com` yerine gercek domain adinizi yazin.

### Open Graph (Sosyal Medya Paylasim Onizlemesi)

```html
<meta property="og:title" content="SolarEnerji | Enerji, Guvenlik ve Muhendislik Cozumleri">
<meta property="og:description" content="Gunes enerjisi, kamera kurulumu ve muhendislik destekleri.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://www.gerceksite.com/">
<meta property="og:locale" content="tr_TR">
<meta property="og:image" content="https://www.gerceksite.com/img/og-image.jpg">
```

**Ipucu:** `og:image` icin 1200x630px boyutunda bir paylasim gorseli olusturun.

### Twitter Card

```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Sayfa Basligi">
<meta name="twitter:description" content="Sayfa aciklamasi">
```

### JSON-LD (Yapisal Veri)

`index.html` dosyasinda `<script type="application/ld+json">` blogu icerisinde isletme bilgilerini guncelleyin:

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "SolarEnerji",
  "description": "Aciklama",
  "telephone": "+90-555-123-4567",
  "email": "info@solarenerji.com",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Ankara",
    "addressCountry": "TR"
  }
}
```

### Sayfa Bazinda SEO Kontrol Listesi

Her sayfa icin su etiketlerin benzersiz ve dogru oldugunu kontrol edin:

- [ ] `<title>` (benzersiz, max 60 karakter)
- [ ] `<meta name="description">` (benzersiz, max 160 karakter)
- [ ] `<link rel="canonical">` (gercek URL)
- [ ] `og:title`, `og:description`, `og:url` (sayfa bazinda benzersiz)
- [ ] `twitter:title`, `twitter:description`

---

## 11. Formspree

Iletisim formu su anda Formspree.io uzerinden calismaktadir. Gercek form gonderimleri icin bir Formspree hesabi olusturmaniz gerekir.

### Kurulum Adimlari

1. [formspree.io](https://formspree.io) adresine gidin ve ucretsiz hesap olusturun
2. Yeni bir form olusturun
3. Size verilen form ID'sini kopyalayin (ornegin `xrgvkbqa`)
4. `contact.html` dosyasini acin
5. Form etiketindeki `action` degerini guncelleyin:

```html
<!-- Once -->
<form id="contact-form" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">

<!-- Sonra -->
<form id="contact-form" action="https://formspree.io/f/xrgvkbqa" method="POST">
```

### Test Etme

1. Formu doldurun ve gonderin
2. Formspree dashboard'unda mesajin geldigini kontrol edin
3. E-posta bildirimlerini Formspree ayarlarindan yapilandirin

### Not

Form ayni zamanda localStorage'a da kaydeder. Yani Formspree calismasa bile admin panelinden mesajlari gorebilirsiniz. Ancak gercek e-posta bildirimi icin Formspree gereklidir.

---

## 12. Admin Sifresi

Admin panelinin varsayilan sifresi `admin123`'tur. Bu sifreyi degistirmeniz **kesinlikle onerilir**.

### Sifre Degistirme

1. `js/admin.js` dosyasini acin
2. Dosyanin ust kisminda su satiri bulun (yaklasik 29. satir):

```javascript
/* DEGISTIRMEK ICIN: Bu sifreyi kendi sifrenizle degistirin */
var ADMIN_PASSWORD = 'admin123';
```

3. `admin123` yerine kendi sifrenizi yazin:

```javascript
var ADMIN_PASSWORD = 'guvenli_yeni_sifre_2024';
```

4. Dosyayi kaydedin

### Guvenlik Uyarisi

Bu panel **demo amaclidir**. JavaScript tarafindaki sifre, tarayicinin gelistirici araclariyla gorulebilir. Gercek uretim ortaminda:

- Sunucu tarafli kimlik dogrulama (PHP session, JWT token) kullanin
- HTTPS baglantisi zorunlu kilin
- Veritabani tabanli kullanici yonetimi ekleyin
- Sifreleri hash'leyerek saklayin (bcrypt, argon2)

---

## 13. Google Haritalar

Iletisim sayfasina Google Maps embed eklemek icin:

### Adim 1: Google Maps'ten Embed Kodu Alin

1. [Google Maps](https://maps.google.com) adresine gidin
2. Isletmenizin adresini arayin
3. "Paylas" butonuna tiklayin
4. "Harita yerlestir" sekmesine gecin
5. HTML kodunu kopyalayin

### Adim 2: contact.html'e Ekleyin

`contact.html` dosyasinda harita placeholder'ini bulun ve iframe ile degistirin:

```html
<!-- Once (placeholder) -->
<div class="contact-map">
  <!-- Google Maps embed buraya eklenecek -->
  <div class="contact-map__placeholder">
    <i class="fas fa-map-marked-alt"></i>
    <p>Harita yuklenecek</p>
  </div>
</div>

<!-- Sonra (gercek harita) -->
<div class="contact-map">
  <iframe
    src="https://www.google.com/maps/embed?pb=SIZIN_EMBED_KODUNUZ"
    width="100%"
    height="350"
    style="border:0; border-radius: var(--radius-lg);"
    allowfullscreen=""
    loading="lazy"
    referrerpolicy="no-referrer-when-downgrade">
  </iframe>
</div>
```

### Boyutlandirma

- `width="100%"` genisligi container'a uyarlar
- `height="350"` yuksekligi piksel cinsinden belirler (ihtiyaca gore ayarlayin)
- `loading="lazy"` haritayi tembel yukler (performans icin)

---

## 14. WhatsApp/Telefon

Sayfanin sag alt kosesinde sabit WhatsApp ve Telefon butonlari bulunur.

### Buton Konumlari

Her HTML dosyasinin `</body>` etiketinden hemen once:

```html
<!-- Floating Butonlar -->
<!-- DEGISTIRMEK ICIN: Telefon numaranizi yazin -->
<a href="https://wa.me/905551234567" class="floating-btn floating-btn--whatsapp"
   target="_blank" rel="noopener" aria-label="WhatsApp ile iletisim">
  <i class="fab fa-whatsapp"></i>
</a>

<!-- DEGISTIRMEK ICIN: Telefon numaranizi yazin -->
<a href="tel:+905551234567" class="floating-btn floating-btn--phone"
   aria-label="Bizi arayin">
  <i class="fas fa-phone-alt"></i>
</a>
```

### WhatsApp Numarasini Degistirme

`wa.me/` linkinde ulke kodu ile numara arasinda bosluk veya tire OLMAMALIDIR:

```html
<!-- Dogru -->
<a href="https://wa.me/905551234567">

<!-- Yanlis -->
<a href="https://wa.me/+90 555 123 45 67">
```

### Telefon Numarasini Degistirme

`tel:` linkinde ulke kodunu `+` ile baslayin:

```html
<a href="tel:+905551234567">
```

### Varsayilan WhatsApp Mesaji Ekleme

```html
<a href="https://wa.me/905551234567?text=Merhaba%2C%20teklif%20almak%20istiyorum.">
```

**Not:** Bu butonlar **7 HTML dosyasinda** da degistirilmelidir.

---

## 15. Dark Mode

Site, kullanicinin tercihine gore karanlik ve aydinlik tema arasinda gecis yapabilir.

### Nasil Calisir

1. Kullanici header'daki tema toggle butonuna tiklar
2. `theme-toggle.js` dosyasi `<html>` etiketine `data-theme="dark"` attributesi ekler
3. `dark-mode.css` dosyasindaki CSS kurallari devreye girer
4. Tercih `localStorage`'da saklanir (sayfa yenilenince korunur)
5. Her sayfanin `<head>` icindeki inline script, sayfa yuklemeden once temayi uygular (flas onleme)

### Dark Mode Renklerini Ozellestirme

`css/dark-mode.css` dosyasini acin:

```css
[data-theme="dark"] {
  --bg-body: var(--color-gray-900);         /* Sayfa arka plani */
  --bg-surface: var(--color-gray-800);       /* Bolum arka planlari */
  --bg-surface-alt: var(--color-gray-700);   /* Alternatif yuzeyler */
  --bg-card: var(--color-gray-800);          /* Kart arka planlari */
  --text-primary: var(--color-gray-100);     /* Ana metin rengi */
  --text-secondary: var(--color-gray-300);   /* Ikincil metin */
  --text-heading: var(--color-white);        /* Baslik rengi */
  --border-color: var(--color-gray-700);     /* Kenarlik rengi */
}
```

### Belirli Bilesenler Icin Dark Mode

Yeni bir bilesen eklediyseniz ve dark mode'da farkli gorunmesini istiyorsaniz, `dark-mode.css` dosyasina yeni kurallar ekleyin:

```css
[data-theme="dark"] .yeni-bilesen {
  background-color: var(--bg-card);
  color: var(--text-primary);
  border-color: var(--border-color);
}
```

### Dark Mode'u Devre Disi Birakma

Tum sayfalardan su dosyayi kaldirin:

```html
<!-- Bu satiri silin -->
<link rel="stylesheet" href="css/dark-mode.css">
```

Ve header'daki tema toggle butonunu kaldirin.

---

## 16. Font Degistirme

### Adim 1: Google Fonts'tan Font Secin

1. [fonts.google.com](https://fonts.google.com) adresine gidin
2. Istediginiz fontu secin (ornegin "Poppins")
3. Gereken agirlik degerlerini secin (400, 500, 600, 700, 800)
4. Embed kodunu kopyalayin

### Adim 2: HTML'deki Font Linkini Degistirin

**Tum 7 HTML dosyasinda** `<head>` bolumunde:

```html
<!-- Once (Inter) -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">

<!-- Sonra (Poppins) -->
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

### Adim 3: CSS Degiskenini Guncelleyin

`css/variables.css` dosyasinda:

```css
/* Once */
--font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-family-heading: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Sonra */
--font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-family-heading: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Farkli Baslik Fontu Kullanma

Basliklar icin ayri bir font kullanmak isterseniz:

```css
--font-family: 'Inter', sans-serif;                    /* Govde metni */
--font-family-heading: 'Playfair Display', serif;       /* Basliklar */
```

Ve HTML'e her iki fontu da ekleyin:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet">
```

---

## 17. PHP Gecisi

Su an form Formspree (ucuncu parti servis) uzerinden calisiyor. Kendi sunucunuzda PHP ile form islemek isterseniz:

### Adim 1: PHP Dosyasi Olusturun

Proje kokune `form-handler.php` dosyasi olusturun:

```php
<?php
// form-handler.php -- Iletisim formu isleyici

// CORS ve guvenlik basliklarini ayarla
header('Content-Type: application/json; charset=utf-8');

// Sadece POST isteklerini kabul et
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Sadece POST istekleri kabul edilir']);
    exit;
}

// Honeypot kontrolu (spam korumasi)
if (!empty($_POST['_gotcha'])) {
    http_response_code(200);
    echo json_encode(['ok' => true]);
    exit;
}

// Form verilerini al ve temizle
$name    = htmlspecialchars(trim($_POST['name'] ?? ''));
$email   = filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL);
$phone   = htmlspecialchars(trim($_POST['phone'] ?? ''));
$subject = htmlspecialchars(trim($_POST['subject'] ?? ''));
$service = htmlspecialchars(trim($_POST['service'] ?? ''));
$message = htmlspecialchars(trim($_POST['message'] ?? ''));

// Dogrulama
if (empty($name) || empty($email) || empty($message)) {
    http_response_code(400);
    echo json_encode(['error' => 'Ad, e-posta ve mesaj alanlari zorunludur']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Gecersiz e-posta adresi']);
    exit;
}

// E-posta gonder
$to = 'info@solarenerji.com';  // DEGISTIRMEK ICIN: Kendi e-posta adresinizi yazin
$email_subject = "Iletisim Formu: $subject";
$email_body = "Ad Soyad: $name\n"
            . "E-posta: $email\n"
            . "Telefon: $phone\n"
            . "Hizmet: $service\n"
            . "Konu: $subject\n\n"
            . "Mesaj:\n$message\n";

$headers = "From: $email\r\n"
         . "Reply-To: $email\r\n"
         . "Content-Type: text/plain; charset=UTF-8\r\n";

$success = mail($to, $email_subject, $email_body, $headers);

if ($success) {
    echo json_encode(['ok' => true, 'message' => 'Mesajiniz basariyla gonderildi']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'E-posta gonderilemedi']);
}
?>
```

### Adim 2: HTML Formunun action Degerini Degistirin

`contact.html` dosyasinda:

```html
<!-- Once (Formspree) -->
<form id="contact-form" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">

<!-- Sonra (PHP) -->
<form id="contact-form" action="form-handler.php" method="POST">
```

### Adim 3: JavaScript'i Guncelleyin (Opsiyonel)

`js/form-validation.js` dosyasindaki fetch istegi zaten JSON yanit bekliyor. PHP dosyaniz JSON dondurdugu icin JavaScript'te bir degisiklik gerekmez.

### Adim 4: Sunucu Gereksinimleri

- PHP 7.4 veya ustu
- `mail()` fonksiyonunun calisir durumda olmasi (hosting saglayiciniza sorun)
- Alternatif: PHPMailer kutuphanesi ile SMTP uzerinden gonderim

### PHPMailer ile SMTP Ornegi (Opsiyonel)

Daha guvenilir e-posta gonderimi icin PHPMailer kullanabilirsiniz:

```php
// Composer ile yukleyin: composer require phpmailer/phpmailer
use PHPMailer\PHPMailer\PHPMailer;

$mail = new PHPMailer(true);
$mail->isSMTP();
$mail->Host       = 'smtp.gmail.com';       // SMTP sunucusu
$mail->SMTPAuth   = true;
$mail->Username   = 'email@gmail.com';       // SMTP kullanici adi
$mail->Password   = 'uygulama-sifresi';      // SMTP sifresi
$mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
$mail->Port       = 587;
$mail->CharSet    = 'UTF-8';

$mail->setFrom($email, $name);
$mail->addAddress('info@solarenerji.com');
$mail->Subject = $email_subject;
$mail->Body    = $email_body;

$mail->send();
```

---

## 18. Proje Galerisi (Tamamlanan Isler)

Her hizmet sayfasinin alt kisminda "Tamamlanan Projelerimiz" bolumu bulunur. Burada yaptiiginiz islerin fotograflarini ve aciklamalarini sergileyebilirsiniz.

### Proje Galerisi Hangi Dosyalarda

| Sayfa | Dosya | Yer |
|-------|-------|-----|
| Gunes Enerjisi | `gunes-enerjisi.html` | CTA bolumunun hemen ustu |
| Kamera Kurulumu | `guvenlik-sistemleri.html` | CTA bolumunun hemen ustu |
| Muhendislik | `muhendislik.html` | CTA bolumunun hemen ustu |

### Tek Proje Kartinin HTML Yapisi

```html
<div class="project-card" data-animate="fade-up" data-delay="100">
  <!-- GORSEL ALANI -->
  <div class="project-card__image project-card__image--solar">
    <!-- Secenk 1: Placeholder ikon (varsayilan) -->
    <i class="fas fa-solar-panel"></i>

    <!-- Secenk 2: Gercek fotograf (ikonu silin, img ekleyin) -->
    <!-- <img src="img/projeler/proje1.jpg" alt="Proje aciklamasi"> -->
  </div>
  <!-- BILGI ALANI -->
  <div class="project-card__body">
    <h3 class="project-card__title">Proje Basligi</h3>
    <p class="project-card__desc">Proje hakkinda kisa aciklama yazin.</p>
    <span class="project-card__tag">
      <i class="fas fa-map-marker-alt"></i> Ankara
    </span>
  </div>
</div>
```

### Gercek Fotograf Ekleme

1. Fotografinizi `img/projeler/` klasorune kopyalayin (oneri: 600x400px, WebP veya JPEG, 200KB alti)
2. Kart icindeki `<i>` ikonunu silin
3. Yerine `<img>` etiketi ekleyin:

```html
<!-- Once (placeholder ikon) -->
<div class="project-card__image project-card__image--solar">
  <i class="fas fa-solar-panel"></i>
</div>

<!-- Sonra (gercek fotograf) -->
<div class="project-card__image project-card__image--solar">
  <img src="img/projeler/ev-panel-ankara.jpg" alt="Ankara Cankaya evine cati tipi gunes paneli kurulumu" loading="lazy">
</div>
```

**Not:** `loading="lazy"` eklemeyi unutmayin — sayfa hizini arttirir.

### Yeni Proje Karti Ekleme

Mevcut bir `<div class="project-card">` blogunun tamamini kopyalayip `projects-grid` icine yapistirin. `data-delay` degerini sirayla artirin (100, 200, 300, 400...):

```html
<!-- 4. proje karti (yeni eklenen) -->
<div class="project-card" data-animate="fade-up" data-delay="400">
  <div class="project-card__image project-card__image--solar">
    <img src="img/projeler/yeni-proje.jpg" alt="Proje aciklamasi" loading="lazy">
  </div>
  <div class="project-card__body">
    <h3 class="project-card__title">Bahce Solar Sistemi</h3>
    <p class="project-card__desc">200m2 bahceye 4 panelli sulama ve aydinlatma sistemi kurulumu.</p>
    <span class="project-card__tag"><i class="fas fa-map-marker-alt"></i> Bolu</span>
  </div>
</div>
```

### Proje Karti Silme

Ilgili `<div class="project-card">` blogunun tamamini (acilis ve kapanis etiketi dahil) silin. Kalan kartlarin `data-delay` degerlerini yeniden siralayin (100, 200, 300...).

### Placeholder Gradient Renk Siniflari

Gercek fotograf yerine renkli placeholder kullanmak isterseniz, hizmet tipine gore sinif secin:

| Sinif | Renk | Kullanim |
|-------|------|----------|
| `project-card__image--solar` | Gold/Amber gradient | Gunes enerjisi projeleri |
| `project-card__image--camera` | Mavi gradient | Kamera kurulumu projeleri |
| `project-card__image--engineering` | Mor gradient | Muhendislik projeleri |

### Etiket (Tag) Cesitleri

Proje kartlarinda konum veya kategori etiketi kullanabilirsiniz:

```html
<!-- Konum etiketi -->
<span class="project-card__tag"><i class="fas fa-map-marker-alt"></i> Ankara</span>

<!-- Kategori etiketi -->
<span class="project-card__tag"><i class="fas fa-tag"></i> 3D Baski</span>

<!-- Tarih etiketi -->
<span class="project-card__tag"><i class="fas fa-calendar"></i> Ocak 2025</span>
```

### Responsive Davranis

Proje kartlari otomatik olarak ekran boyutuna uyum saglar:
- **Mobil (0-575px):** 1 sutun (tek kart)
- **Tablet (576-991px):** 2 sutun (yan yana)
- **Masaustu (992px+):** 3 sutun (yan yana)

Kart sayisini artirdiginizda grid otomatik olarak yeni satirlara sarar.

---

## Hizli Referans: Dosya ve Degisiklik Haritalari

| Degisiklik Turu           | Dosya(lar)                              |
|---------------------------|-----------------------------------------|
| Renkler                   | `css/variables.css`                     |
| Dark mode                 | `css/dark-mode.css`                     |
| Font                      | `css/variables.css` + tum HTML `<head>` |
| Logo                      | `img/logo.svg` + tum HTML header        |
| Iletisim bilgileri        | Tum HTML footer + `contact.html`        |
| Sosyal medya              | Tum HTML footer                         |
| Istatistikler             | `index.html` (data-target)              |
| Musteri yorumlari         | `index.html`                            |
| Hizmet kartlari           | Ilgili hizmet HTML dosyasi              |
| SEO etiketleri            | Ilgili HTML `<head>` bolumu             |
| Form backend              | `contact.html` (action) + `js/form-validation.js` |
| Admin sifresi             | `js/admin.js` (ADMIN_PASSWORD)          |
| Harita                    | `contact.html`                          |
| WhatsApp/Telefon          | Tum HTML (floating butonlar)            |
| Scroll animasyonlari      | `css/animations.css` + `js/scroll-animations.js` |
| Responsive breakpoints    | `css/responsive.css`                    |
| Proje galerisi            | Ilgili hizmet HTML + `css/components.css` (project-card) |

---

**Son guncelleme:** Bu rehber, SolarEnerji projesinin mevcut yapisi icin hazirlanmistir. Projede buyuk yapisal degisiklikler yapildiginda bu rehberin de guncellenmesi onerilir.
