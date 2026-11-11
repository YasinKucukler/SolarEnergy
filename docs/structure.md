# Proje Yapisi ve Uygulama Adimlari -- SolarEnerji

Bu belge, SolarEnerji projesinin tam yapisini, sayfa haritasini, dosya agacini ve uygulama adimlarini icerir. Proje, uc ana hizmet (gunes enerjisi, kamera kurulumu, muhendislik destekleri) sunan cok hizmetli bir kurumsal web sitesidir.

---

## 1. Site Haritasi

| Dosya Adi              | Sayfa Adi                      | URL                         | Aciklama                                                |
|------------------------|--------------------------------|-----------------------------|---------------------------------------------------------|
| `index.html`           | Ana Sayfa                      | `/`                         | 3 hizmeti tanitan hub sayfa (hero, istatistikler, kartlar) |
| `gunes-enerjisi.html`  | Gunes Enerjisi Sistemleri      | `/gunes-enerjisi.html`      | 6 alt hizmet karti ile gunes enerjisi detay sayfasi     |
| `guvenlik-sistemleri.html` | Kamera Kurulumu                | `/guvenlik-sistemleri.html`     | 4 kart + ozellikler ile kamera kurulumu detay sayfasi   |
| `muhendislik.html`     | Muhendislik Destekleri         | `/muhendislik.html`         | 3 kart + ozellikler ile muhendislik detay sayfasi       |
| `contact.html`         | Iletisim                       | `/contact.html`             | Iletisim formu + kaynak sayfa tespiti (?source= param)  |
| `admin.html`           | Yonetici Paneli                | `/admin.html`               | Mesajlar, projeler, site ayarlari, bildirimler (bkz. degisiklik-rehberi §12) |
| `about.html`           | Hakkimizda                     | `/about.html`               | Sirket hikayesi, ekip, sertifikalar                     |

### Sayfa Akisi

```
index.html (Hub)
  |-- "Gunes Enerjisi" --> gunes-enerjisi.html --> contact.html?source=gunes-enerjisi
  |-- "Kamera Kurulumu" --> guvenlik-sistemleri.html --> contact.html?source=kamera
  |-- "Muhendislik"     --> muhendislik.html     --> contact.html?source=muhendislik
  |-- "Iletisim"        --> contact.html
  |-- Footer: "Hakkimizda" --> about.html

contact.html --> form gonderimi --> localStorage --> admin.html (mesajlari goruntuleme)
```

---

## 2. Dosya Yapisi

```
solar1-main/
|-- index.html                  # Ana Sayfa -- 3 hizmeti tanitan hub
|-- gunes-enerjisi.html         # Gunes Enerjisi Sistemleri detay sayfasi
|-- guvenlik-sistemleri.html        # Kamera Kurulumu detay sayfasi
|-- muhendislik.html            # Muhendislik Destekleri detay sayfasi
|-- contact.html                # Iletisim formu (kaynak sayfa tespiti)
|-- admin.html                  # Yonetici Paneli (localStorage tabanli)
|-- about.html                  # Hakkimizda sayfasi
|
|-- css/
|   |-- variables.css           # Tasarim token'lari + hizmet renkleri (gold, mavi, mor)
|   |-- reset.css               # Modern CSS reset (margin, padding, box-sizing)
|   |-- base.css                # Butonlar, basliklar, utility siniflar
|   |-- layout.css              # Container, grid, section bosluk sistemi
|   |-- navigation.css          # Header, hamburger menu, mobile drawer
|   |-- footer.css              # 4 kolonlu footer grid
|   |-- components.css          # Card, image-card, form, floating buton bileenleri
|   |-- animations.css          # Scroll animasyonlari (keyframe'ler)
|   |-- dark-mode.css           # Karanlik tema override'lari [data-theme="dark"]
|   |-- responsive.css          # Mobile-first breakpoints (576/768/992/1200px)
|   +-- pages/
|       |-- home.css            # Ana sayfa (hero, stats, testimonials)
|       |-- about.css           # Hakkimizda sayfasi stilleri
|       |-- contact.css         # Iletisim sayfasi stilleri
|       |-- solar.css           # Gunes enerjisi sayfasi stilleri
|       |-- camera.css          # Kamera kurulumu sayfasi stilleri
|       |-- engineering.css     # Muhendislik sayfasi stilleri
|       +-- admin.css           # Admin paneli stilleri
|
|-- js/
|   |-- main.js                 # Sticky header, aktif nav linki, modulleri baslatir
|   |-- theme-toggle.js         # Dark/light mod gecisi, localStorage tercihi
|   |-- mobile-menu.js          # Hamburger menu, drawer, overlay yonetimi
|   |-- scroll-animations.js    # IntersectionObserver ile gorunurluk animasyonlari
|   |-- counters.js             # Animasyonlu sayaclar (requestAnimationFrame)
|   |-- smooth-scroll.js        # Yumusak kaydirma (anchor linkler)
|   |-- form-validation.js      # Form dogrulama + Formspree gonderim + localStorage kayit
|   |-- contact-source.js       # ?source= parametre okuma ve form on-doldurma
|   +-- admin.js                # Admin panel: giris, mesaj yonetimi, CRUD islemleri
|
|-- img/
|   |-- logo.svg                # SVG logo (gunes + panel ikonu)
|   +-- projeler/               # Proje galerisi fotograflari (bos, hazir)
|
+-- docs/
    |-- structure.md            # Bu dosya -- proje yapi belgelendirmesi
    |-- degisiklik-rehberi.md   # Site degisiklik rehberi (kullanici icin)
    |-- hosting-rehberi.md      # Hosting ve yayinlama rehberi
    +-- performans-raporu.md    # Performans ve Lighthouse raporu
```

---

## 3. Navigasyon

### Ust Menu (Header)

Masaustu ve mobilde gosterilen ana navigasyon linkeleri:

```
Ana Sayfa | Gunes Enerjisi | Kamera Kurulumu | Muhendislik | Iletisim
```

- **Ana Sayfa**: `index.html`
- **Gunes Enerjisi**: `gunes-enerjisi.html`
- **Kamera Kurulumu**: `guvenlik-sistemleri.html`
- **Muhendislik**: `muhendislik.html`
- **Iletisim**: `contact.html`

### Footer Linkleri

- Hakkimizda linki **sadece footer'da** yer alir (`about.html`)
- Hizmet linkleri footer'da da tekrarlanir
- Sosyal medya ikonlari footer'in marka bolumunde yer alir

### Mobil Navigasyon

- 768px altinda hamburger menu ikonu gorunur
- Sagdan acilan drawer panel + overlay
- Drawer icinde ayni 5 link + "Teklif Al" CTA butonu

---

## 4. Uygulama Adimlari

Projenin sifirdan mevcut haline getirilmesi icin yapilan tum islemler:

1. **CSS token'lari guncellendi** -- `variables.css` dosyasina kamera (mavi: `#3b82f6` serisi, `--color-camera`) ve muhendislik (mor: `#8b5cf6` serisi, `--color-engineering`) renk sistemi eklendi.

2. **Yeni sayfa CSS dosyalari olusturuldu** -- `css/pages/` altina `solar.css`, `camera.css`, `engineering.css` ve `admin.css` dosyalari eklendi.

3. **components.css'e image-card bileseni eklendi** -- Gorsel kartlar icin yeni bilesenler ve stil kurallari tanimlandi.

4. **dark-mode.css yeni bilesenler icin guncellendi** -- Kamera, muhendislik ve admin paneli bilesenlerinin karanlik tema stilleri eklendi.

5. **responsive.css yeni sayfalar icin guncellendi** -- Yeni sayfalardaki grid yapilari ve bilesen boyutlari icin media query'ler eklendi.

6. **index.html 3 hizmetli hub olarak tamamen yeniden yazildi** -- Tek hizmet odakli yapidan cok hizmetli merkez sayfasina gecildi. 3 hizmet karti, istatistikler ve musteri yorumlari eklendi.

7. **gunes-enerjisi.html olusturuldu** -- 6 alt hizmet karti ile gunes enerjisi detay sayfasi yazildi (panel satisi, GES kurulumu, hibrit sistemler vb.).

8. **guvenlik-sistemleri.html olusturuldu** -- 4 kart + ozellik listesi ile kamera kurulumu detay sayfasi yazildi.

9. **muhendislik.html olusturuldu** -- 3 kart + ozellik listesi ile muhendislik destekleri detay sayfasi yazildi.

10. **contact.html guncellendi** -- Hizmet dropdown'i eklendi. `?source=` parametresi ile kaynak sayfa tespiti ve form on-doldurma ozelligi eklendi.

11. **admin.html olusturuldu** -- localStorage tabanli demo yonetim paneli yazildi. Giris ekrani, istatistik kartlari, mesaj listesi ve detay modali eklendi.

12. **about.html guncellendi** -- 3 hizmet kapsamini yansitacak sekilde icerik guncellendi.

13. **contact-source.js olusturuldu** -- `?source=` parametresini okuyan, sayfa basligini, dropdown'i ve konu alanini otomatik dolduran modul yazildi.

14. **admin.js olusturuldu** -- Giris, mesaj yonetimi (listeleme, detay, durum degistirme, silme) ve CRUD islemlerini yoneten modul yazildi.

15. **form-validation.js guncellendi** -- Form verilerinin localStorage'a kaydedilmesi ozelligi eklendi. Admin paneli bu veriyi okur.

16. **services.html ve projects.html silindi** -- Eski tek-hizmet yapisindaki sayfalar kaldirildi ve cok-hizmet sayfalaryla degistirildi.

17. **Tum sayfalarda SEO yapilandirildi** -- Her sayfaya benzersiz `<title>`, `<meta description>`, Open Graph, Twitter Card ve JSON-LD (index.html) etiketleri eklendi.

18. **hosting-rehberi.md olusturuldu** -- Siteyi yayinlama ve hosting rehberi yazildi.

19. **Tum koda Turkce yorum satirlari eklendi** -- CSS ve JS dosyalarinin tamamina Turkce aciklamalar ve "DEGISTIRMEK ICIN" etiketleri eklendi.

---

## 5. Hizmet Renk Sistemi

Projedeki 3 hizmet kolunun her biri icin ayri renk paleti tanimlanmistir (`css/variables.css`):

### Gunes Enerjisi -- Gold/Amber

| Degisken               | Deger     | Kullanim                          |
|------------------------|-----------|-----------------------------------|
| `--color-accent`       | `#f59e0b` | Ana vurgu rengi, CTA butonlari   |
| `--color-accent-light` | `#fbbf24` | Hover durumlari, acik tonlar     |
| `--color-accent-dark`  | `#d97706` | Koyu vurgu, aktif durumlar       |

### Kamera Kurulumu -- Mavi

| Degisken               | Deger                      | Kullanim                          |
|------------------------|----------------------------|-----------------------------------|
| `--color-camera`       | `#3b82f6`                  | Ana kamera rengi                 |
| `--color-camera-light` | `#60a5fa`                  | Hover, acik tonlar               |
| `--color-camera-dark`  | `#2563eb`                  | Koyu vurgu, aktif durumlar       |
| `--color-camera-bg`    | `rgba(59, 130, 246, 0.1)`  | Arka plan, kartlarin ic kismi    |

### Muhendislik Destekleri -- Mor

| Degisken                     | Deger                       | Kullanim                          |
|------------------------------|-----------------------------|-----------------------------------|
| `--color-engineering`        | `#8b5cf6`                   | Ana muhendislik rengi            |
| `--color-engineering-light`  | `#a78bfa`                   | Hover, acik tonlar               |
| `--color-engineering-dark`   | `#7c3aed`                   | Koyu vurgu, aktif durumlar       |
| `--color-engineering-bg`     | `rgba(139, 92, 246, 0.1)`   | Arka plan, kartlarin ic kismi    |

---

## 6. Silinen Dosyalar

Asagidaki dosyalar proje yapisinin yenilenmesi sirasinda kaldirilmistir:

| Silinen Dosya              | Aciklama                                      |
|----------------------------|-----------------------------------------------|
| `services.html`            | Eski tek-hizmet sayfasi (yerine 3 ayri sayfa) |
| `projects.html`            | Eski projeler sayfasi (artik gerekli degil)   |
| `css/pages/services.css`   | Eski hizmetler sayfasi stilleri               |
| `css/pages/projects.css`   | Eski projeler sayfasi stilleri                |
| `rapor.md`                 | Eski 5 sayfalik yapiya ait gecersiz rapor     |
| `nul`                      | Windows artifact dosyasi                      |

---

## 7. Teknolojiler

| Teknoloji                   | Versiyon / Detay                   | Kullanim                                        |
|-----------------------------|------------------------------------|-------------------------------------------------|
| **HTML5**                   | Semantic HTML                      | Sayfa yapisi (`<main>`, `<section>`, `<nav>`)   |
| **CSS3**                    | Custom Properties (CSS Variables)  | Tema, renk, bosluk ve tipografi yonetimi        |
| **Vanilla JavaScript**      | ES5 uyumlu, IIFE pattern          | Tum interaktif ozellikler (framework kullanilmaz)|
| **Font Awesome**            | 6.5                               | Ikon seti (butonlar, kartlar, sosyal medya)     |
| **Google Fonts**            | Inter (400-800 agirliklar)         | Yazi tipi ailesi                                |
| **Formspree**               | AJAX JSON API                      | Form backend (sunucu tarafli islem gerektirmez) |

### Tarayici Destegi

- Modern tarayicilar (Chrome, Firefox, Safari, Edge son 2 versiyon)
- CSS Custom Properties destegi gerektirir (IE11 desteklenmez)
- IntersectionObserver API destegi gerektirir

### Performans Ozellikleri

- Dis bagimliliklarin preconnect ile on-yuklemesi
- Dark mode tema flas onleme (inline script)
- IntersectionObserver ile tembel animasyon tetikleme
- Mobile-first CSS yaklasimi
- Honeypot ile spam korumasi (JavaScript tabanli)

---

## 8. Ortak Bilesenler (Her Sayfada)

### Header / Navigasyon

- Sticky header (`position: fixed`) + `backdrop-filter: blur`
- Logo + 5 nav linki + tema toggle butonu + "Teklif Al" CTA
- Scroll'da `header--scrolled` sinifi eklenir (golge efekti)
- Mobilde hamburger menu ile sagdan acilan drawer

### Footer

- 4 kolonlu grid yapisi:
  - **Kolon 1**: Marka/aciklama + sosyal medya ikonlari
  - **Kolon 2**: Hizli linkler (Ana Sayfa, Hakkimizda, Iletisim)
  - **Kolon 3**: Hizmetlerimiz (3 hizmet linki)
  - **Kolon 4**: Iletisim bilgileri (telefon, e-posta, adres)
- Copyright cubugu (yil otomatik degil, elle guncellenir)

### Floating Butonlar

- **WhatsApp** (yesil): Sag alt kose, sabit pozisyon
- **Telefon** (teal): WhatsApp'in ustunde, sabit pozisyon
- Her iki buton da `tel:` ve `https://wa.me/` linkleri kullanir

### Dark/Light Mode

- CSS: `[data-theme="dark"]` ile semantic token override'lari (`dark-mode.css`)
- JS: `theme-toggle.js` -- localStorage'da tema tercihi saklanir
- Flas onleme: Her sayfanin `<head>` icinde inline script ile sayfa yuklemeden tema uygulanir

### Scroll Animasyonlari

- `data-animate` attributeleri: `fade-up`, `fade-down`, `fade-left`, `fade-right`, `scale-up`, `fade-in`
- `data-delay` ile kademeli gecikme (100-600ms araliginda)
- IntersectionObserver ile viewport'a girince `.animated` sinifi eklenir
- `prefers-reduced-motion` medya sorgusuna saygi gosterir

### Animasyonlu Sayaclar

- `.counter` sinifi + `data-target` (hedef sayi) + `data-suffix` (ornegin "+", " MW")
- `requestAnimationFrame` ile easeOutCubic animasyon
- IntersectionObserver ile gorunur olunca tetiklenir, sadece bir kez calisir

---

## 9. SEO Ozellikleri

- Her sayfada benzersiz `<title>` ve `<meta description>`
- Open Graph etiketleri (`og:title`, `og:description`, `og:type`, `og:url`, `og:locale`, `og:image`)
- Twitter Card etiketleri (`twitter:card`, `twitter:title`, `twitter:description`)
- JSON-LD yapisal veri (`LocalBusiness` semasi -- `index.html`'de)
- `<link rel="canonical">` etiketleri
- Semantic HTML5 elemanlari (`<main>`, `<section>`, `<nav>`, `<header>`, `<footer>`)
- ARIA attributeleri (`role`, `aria-label`, `aria-expanded`)
- SVG favicon (`img/logo.svg`)

---

## 10. Yapilacaklar (TODO)

- [x] ~~Gercek gorseller eklenecek~~ → Ornek gorseller eklendi (sample1-5.jpg), gercek proje fotograflariyla degistirilmeli
- [ ] Formspree form ID guncellenecek (`YOUR_FORM_ID` yerine gercek ID)
- [ ] Canonical URL'ler gercek domain ile guncellenecek (`orneksite.com` yerine)
- [ ] Sosyal medya linkleri guncellenecek (footer'daki `#` linkleri)
- [ ] Telefon ve WhatsApp numaralari guncellenecek
- [ ] Google Maps embed kodu eklenecek (`contact.html`)
- [x] ~~Gercek gorsellerle placeholder gradient'lar degistirilecek~~ → index.html kartlari img etiketleriyle guncellendi
- [ ] Admin paneli sifresi degistirilecek (varsayilan: `admin123`)
- [ ] Lighthouse testi yapilacak (hedef: Performance 90+, Accessibility 95+, SEO 95+)
