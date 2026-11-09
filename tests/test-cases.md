# Test Senaryolari — SolarEnerji Web Sitesi

Bu belge, SolarEnerji projesinin tum sayfa, bilesen ve islevlerini kapsayan manuel test senaryolarini icerir.

**Kisaltmalar:** P = Oncelik (1: Kritik, 2: Yuksek, 3: Orta, 4: Dusuk)

---

## 1. Navigasyon ve Header

| # | Senaryo | Beklenen Sonuc | P |
|---|---------|----------------|---|
| NAV-01 | Masaustunde (>768px) header'daki 5 linke tek tek tikla | Her link dogru sayfaya yonlendirir (index, gunes-enerjisi, guvenlik-sistemleri, muhendislik, contact) | 1 |
| NAV-02 | `index.html` sayfasindayken "Ana Sayfa" linkinin aktif gorundugunu dogrula | `nav__link--active` sinifi uygulanmis, altin renk + alt cizgi gorunur | 2 |
| NAV-03 | `about.html` sayfasindayken hicbir nav linkinin aktif olmadigini dogrula | About footer'dan erisilebilir, ust menude degil — hicbir link aktif olmamali | 3 |
| NAV-04 | Sayfayi 50px'ten fazla asagi kaydir | Header'a `header--scrolled` sinifi eklenir, golge efekti gorunur | 2 |
| NAV-05 | Sayfayi en uste geri kaydir (scrollY=0) | Header golge efekti kaybolur | 3 |
| NAV-06 | Sayfayi orta kisimdan yeniden yukle (orn. geri tusu ile) | Header hemen golge efektiyle yuklenmeli (onScroll ilk yukte calisir) | 3 |
| NAV-07 | Header'in sabit (fixed) konumda kaldigini dogrula — tum sayfalarda | Sayfa kaydirilirken header her zaman gorunur kalir | 1 |
| NAV-08 | `.nav-spacer` yuksekliginin header yuksekligi ile eslestigini dogrula | Icerik header'in arkasinda gizlenmez | 2 |
| NAV-09 | Footer'daki "Hakkimizda" linkine tikla | `about.html` sayfasi acilir | 2 |
| NAV-10 | Footer'daki hizmet linklerinin dogru sayfalara yonlendirdigini dogrula | 3 hizmet linki dogru sayfalara gider | 2 |
| NAV-11 | Footer sosyal medya ikonlarina tikla | Linkler `#` placeholder — sayfa basi veya bos sekme acilir | 4 |

---

## 2. Mobil Menu (Hamburger)

| # | Senaryo | Beklenen Sonuc | P |
|---|---------|----------------|---|
| MOB-01 | 768px altinda hamburger ikon gorunurlugunu kontrol et | Hamburger ikonu gorunur, masaustu nav gizli | 1 |
| MOB-02 | 768px ustunde hamburger ikon gorunurlugunu kontrol et | Hamburger ikonu gizli, masaustu nav gorunur | 1 |
| MOB-03 | Hamburger ikonuna tikla | Menu acilir: drawer sagdan kayar, overlay gorunur, body scroll kitlenir | 1 |
| MOB-04 | Acik menude hamburger ikonunun X seklinde oldugunu dogrula | 3 cizgi 45° donmus X animasyonuna donusur | 3 |
| MOB-05 | Acik menude overlay'e tikla | Menu kapanir, overlay kaybolur, body scroll serbest | 1 |
| MOB-06 | Acik menude Escape tusuna bas | Menu kapanir | 2 |
| MOB-07 | Acik menude bir nav linkine tikla | Menu kapanir VE dogru sayfaya yonlendirilir | 1 |
| MOB-08 | Menu acikken body scroll denemesi yap | Body scroll engellenmis olmali (`overflow: hidden`) | 2 |
| MOB-09 | Menu kapatildiktan sonra body scroll denemesi yap | Body scroll serbest olmali (`overflow: ''`) | 2 |
| MOB-10 | Hamburger'a hizli art arda tikla (acma/kapama) | Durum tutarsizligi olmaz, menu dogru konumda kalir | 3 |
| MOB-11 | `aria-expanded` degerini kontrol et — menu acik | `"true"` olmali | 3 |
| MOB-12 | `aria-expanded` degerini kontrol et — menu kapali | `"false"` olmali | 3 |
| MOB-13 | `admin.html`'de hamburger aranmasi | Hamburger/mobile-nav yok, script guvenle ateslanir, hata uretmez | 3 |
| MOB-14 | 320px genislikte drawer genisligi kontrol et | `max-width: 80vw` = 256px (300px'i asmaz) | 3 |

---

## 3. Tema (Dark/Light Mode)

| # | Senaryo | Beklenen Sonuc | P |
|---|---------|----------------|---|
| THM-01 | Tema toggle butonuna tikla (light → dark) | Sayfa karanlik temaya gecer, `data-theme="dark"` eklenir | 1 |
| THM-02 | Tema toggle butonuna tekrar tikla (dark → light) | Sayfa acik temaya doner, `data-theme="light"` olur | 1 |
| THM-03 | Dark mode'da baska sayfaya git | Tema korunur (localStorage'dan okunur) | 1 |
| THM-04 | localStorage'i temizle, sistem dark mode iken sayfayi yukle | Sistem tercihine gore dark mode uygulanir | 2 |
| THM-05 | localStorage'i temizle, sistem light mode iken sayfayi yukle | Acik tema uygulanir (varsayilan) | 2 |
| THM-06 | localStorage'da `theme='dark'` ayarla, sayfa yukle | Beyaz flas olmadan (flash of unstyled content) dark mode yuklenmeli | 1 |
| THM-07 | Dark mode'da form input alanlari okunabilirligini kontrol et | Koyu arka plan uzerinde acik renkli metin, kontrast yeterli | 2 |
| THM-08 | Dark mode'da kart hover efektlerini kontrol et | Yesil sinir cizgisi karanlik arka planda ayirt edilebilir | 3 |
| THM-09 | Dark mode'da tema ikonu: gunes ikonu gorunur mu | `.icon-sun` gorunur, `.icon-moon` gizli | 3 |
| THM-10 | Light mode'da tema ikonu: ay ikonu gorunur mu | `.icon-moon` gorunur, `.icon-sun` gizli | 3 |
| THM-11 | Tum 7 sayfada tema degisimini test et | Her sayfada sorunsuz gecis | 2 |

---

## 4. Scroll Animasyonlari

| # | Senaryo | Beklenen Sonuc | P |
|---|---------|----------------|---|
| ANI-01 | Sayfayi asagi kaydir, `data-animate` elementi gorunur olsun | Element `.animated` sinifini alir, animasyon tetiklenir | 2 |
| ANI-02 | Ayni elementle tekrar karsilasma (yukari-asagi kaydir) | Animasyon tekrar etmez (tek seferlik — `unobserve`) | 3 |
| ANI-03 | `data-delay="300"` olan bir elementin gecikmeli animasyonunu dogrula | Animasyon 300ms gecikmeyle baslar | 3 |
| ANI-04 | `prefers-reduced-motion: reduce` ayarini ac | Hicbir animasyon tetiklenmez, icerik statik gorunur | 2 |
| ANI-05 | Sayfa yuklendiginde viewport'ta olan elementleri kontrol et | Bu elementler de animasyon alir (IntersectionObserver ilk kesimleri tetikler) | 3 |
| ANI-06 | Cok hizli kaydir (tum elementleri gecmeye calis) | Tum elementler yine de animasyonlarini alir | 3 |
| ANI-07 | `data-animate` olmayan bir sayfada (orn. admin.html) | Script erken doner, hata uretmez | 4 |

---

## 5. Animasyonlu Sayaclar (Sadece index.html)

| # | Senaryo | Beklenen Sonuc | P |
|---|---------|----------------|---|
| CNT-01 | Istatistik bolumunu gorunur yap (asagi kaydir) | Sayaclar 0'dan hedef degere dogru animasyonla sayar | 2 |
| CNT-02 | Animasyon tamamlandiktan sonra son degerleri kontrol et | `10+`, `5+`, `3+`, `15+` degerleri gorunur | 2 |
| CNT-03 | Animasyonun easeOutCubic easing kullandigini dogrula | Sayac hizli baslar, yavasca biter (dogal yavaslama) | 4 |
| CNT-04 | Sayac animasyonu sirasinda sekmeyi arka plana al | `requestAnimationFrame` duraklar, sekme odaga donunce devam eder | 4 |
| CNT-05 | Sayac bolumune tekrar kaydir (yukari-asagi) | Animasyon tekrar etmez (tek seferlik) | 3 |
| CNT-06 | Sayac bolumu sayfa yuklendiginde gorunurse | Animasyon hemen tetiklenir | 3 |

---

## 6. Yumusak Kaydirma (Smooth Scroll)

| # | Senaryo | Beklenen Sonuc | P |
|---|---------|----------------|---|
| SCR-01 | index.html'deki "Hizmetlerimizi Kesfet" butonuna tikla (`#hizmetler`) | Sayfa yumusak sekilde hizmetler bolumune kayar | 2 |
| SCR-02 | Kaydirma sonrasi hedef bolumun header'in altinda gorunur oldugunu dogrula | Sabit navbar yuksekligi hesaba katilir, icerik gizlenmez | 2 |
| SCR-03 | `href="#"` olan bir linke tikla (footer sosyal medya) | Hicbir kayma olmaz, hata uretmez | 3 |
| SCR-04 | `href="#varolmayan"` olan bir linke tikla | Hicbir kayma olmaz, konsol hatasi yok | 3 |

---

## 7. Iletisim Formu (contact.html)

### 7.1 Form Dogrulama

| # | Senaryo | Beklenen Sonuc | P |
|---|---------|----------------|---|
| FRM-01 | Tum alanlari bos birakip gonder | `required` HTML dogrulamasi engeller, tarayici uyari gosterir | 1 |
| FRM-02 | Ad alanina 1 karakter gir, blur yap | Hata mesaji: "Lutfen adinizi girin (en az 2 karakter)." | 1 |
| FRM-03 | Ad alanina 2 karakter gir, blur yap | Hata temizlenir, gecerli | 1 |
| FRM-04 | Ad alanina sadece bosluk gir (`"  "`), blur yap | `trim()` sonrasi 0 uzunluk, hata mesaji gorunur | 2 |
| FRM-05 | Gecersiz e-posta gir (`abc`), blur yap | Hata mesaji: "Gecerli bir e-posta adresi girin." | 1 |
| FRM-06 | Gecerli e-posta gir (`a@b.c`), blur yap | Gecerli kabul edilir (regex uyumlu) | 2 |
| FRM-07 | `@b.c` formatinda e-posta gir, blur yap | Hata mesaji gorunur (@ oncesinde karakter yok) | 2 |
| FRM-08 | Telefon alanini bos birak | Gecerli (telefon istege bagli) | 2 |
| FRM-09 | Telefon alanina 6 karakter gir (`123456`) | Hata mesaji: "Gecerli bir telefon numarasi girin." (min 7) | 2 |
| FRM-10 | Telefon alanina 7 karakter gir (`1234567`) | Gecerli | 2 |
| FRM-11 | Telefon alanina ozel karakterli numara gir (`+90 (555) 123-45-67`) | Gecerli (regex rakam, bosluk, +, -, parantez kabul eder) | 2 |
| FRM-12 | Konu alanina 1 karakter gir | Hata mesaji gorunur | 1 |
| FRM-13 | Konu alanina 2 karakter gir | Gecerli | 2 |
| FRM-14 | Mesaj alanina 9 karakter gir | Hata mesaji: "Mesajiniz en az 10 karakter olmalidir." | 1 |
| FRM-15 | Mesaj alanina 10 karakter gir | Gecerli | 2 |
| FRM-16 | Hatali alana blur yap, sonra input ile duzelt | Hata mesaji aninda temizlenir (input event dinleyicisi) | 2 |

### 7.2 Form Gonderimi

| # | Senaryo | Beklenen Sonuc | P |
|---|---------|----------------|---|
| FRM-17 | Tum alanlari gecerli doldur ve gonder | Buton "Gonderiliyor..." + spinner gosterir, buton devre disi olur | 1 |
| FRM-18 | Basarili gonderim (Formspree aktif) | Basari mesaji gorunur (`.form-message--success`), form sifirlanir | 1 |
| FRM-19 | Basarisiz gonderim (Formspree placeholder — YOUR_FORM_ID) | Hata mesaji gorunur (`.form-message--error`), localStorage'a yine kaydedilir | 1 |
| FRM-20 | Gonderim sonrasi butonun eski haline donmesini dogrula | Buton tekrar "Gonder" yazisi ve aktif duruma doner (`finally` blogu) | 2 |
| FRM-21 | Honeypot alanini (`_gotcha`) doldur ve gonder | Form sessizce iptal edilir — fetch yapilmaz, localStorage'a kaydedilmez | 1 |
| FRM-22 | Gonderim sonrasi localStorage'i kontrol et | `solarenerji_messages` anahtarinda yeni mesaj JSON olarak kayitli | 1 |
| FRM-23 | Kaydedilen mesaj nesnesinin tum alanlari icerdigini dogrula | name, email, phone, subject, service, source_page, message, date (ISO), status ('new') | 2 |

### 7.3 Kaynak Sayfa Tespiti (contact-source.js)

| # | Senaryo | Beklenen Sonuc | P |
|---|---------|----------------|---|
| SRC-01 | `contact.html?source=gunes-enerjisi` adresine git | Baslik: "Gunes Enerjisi Hakkinda Iletisim", konu otomatik dolar, dropdown "gunes-enerjisi" secer | 1 |
| SRC-02 | `contact.html?source=kamera` adresine git | Baslik: "Guvenlik Sistemleri Hakkinda Iletisim", dropdown "kamera" secer | 1 |
| SRC-03 | `contact.html?source=muhendislik` adresine git | Baslik: "Muhendislik Destegi Hakkinda Iletisim", dropdown "muhendislik" secer | 1 |
| SRC-04 | `contact.html?source=diger` adresine git | Tanimsiz kaynak — hicbir degisiklik yapilmaz, varsayilan degerler kalir | 2 |
| SRC-05 | `contact.html` (source parametresi yok) adresine git | Varsayilan baslik "Iletisim", form bos | 1 |
| SRC-06 | `contact.html?source=` (bos deger) adresine git | Script erken doner, degisiklik yapilmaz | 3 |
| SRC-07 | Konu alani onceden doldurulmus iken `?source=` ile gel | Konu alani uzerine yazilmaz (`!subjectEl.value` kontrolu) | 3 |

---

## 8. Yonetici Paneli (admin.html)

### 8.1 Giris

| # | Senaryo | Beklenen Sonuc | P |
|---|---------|----------------|---|
| ADM-01 | Dogru sifre ile giris yap (`admin123`) | Dashboard gorunur, giris ekrani gizlenir | 1 |
| ADM-02 | Yanlis sifre ile giris yap (`Admin123` — buyuk harf) | Hata mesaji gorunur (buyuk/kucuk harf duyarli) | 1 |
| ADM-03 | Bosteki sifre ile giris yap (`admin123 `) | Hata mesaji gorunur (bosluk dahil eslesmez) | 2 |
| ADM-04 | Bos sifre ile giris yap | HTML `required` engeller, form gonderilmez | 2 |
| ADM-05 | Giris yaptiktan sonra sayfayi yenile (ayni sekme) | Oturum devam eder (sessionStorage aktif) | 1 |
| ADM-06 | Giris yaptiktan sonra yeni sekmede admin.html ac | Giris ekrani gorunur (sessionStorage sekmeye ozeldir) | 2 |
| ADM-07 | Giris yaptiktan sonra tarayici sekmesini kapat ve yeniden ac | Giris ekrani gorunur (sessionStorage silinmis) | 2 |

### 8.2 Dashboard ve Mesaj Listesi

| # | Senaryo | Beklenen Sonuc | P |
|---|---------|----------------|---|
| ADM-08 | localStorage'da hic mesaj yokken dashboard | Bos durum mesaji gorunur, tum istatistikler 0 | 1 |
| ADM-09 | localStorage'da 5 mesaj varken dashboard | 5 mesaj listelenir, istatistikler dogru | 1 |
| ADM-10 | localStorage'da 15 mesaj varken dashboard | Son 10 mesaj gorunur (en yeniler onde) | 2 |
| ADM-11 | Mesajlarin yeniden eskiye siralandigini dogrula | En son gonderilen mesaj listenin en ustunde | 2 |
| ADM-12 | Istatistik kartlarini dogrula — gunes-enerjisi mesajlari | "Gunes" sayaci dogru sayida | 2 |
| ADM-13 | Istatistik kartlarini dogrula — kamera mesajlari | "Kamera" sayaci dogru sayida | 2 |
| ADM-14 | Istatistik kartlarini dogrula — muhendislik mesajlari | "Muhendislik" sayaci dogru sayida | 2 |
| ADM-15 | `service: "diger"` olan mesajin istatistiklerde sayilmasini dogrula | Toplamda sayilir, ancak 3 kategoriden hicbirine girmez | 3 |
| ADM-16 | Bozuk localStorage verisi (gecersiz JSON) | Hata yakalanir, bos dizi doner, dashboard bos gorunur | 3 |

### 8.3 Mesaj Detay ve Islemler

| # | Senaryo | Beklenen Sonuc | P |
|---|---------|----------------|---|
| ADM-17 | Mesaj satirina tikla | Detay modali acilir, tum alanlar dogru gosterilir | 1 |
| ADM-18 | Detay modalinde "Okundu" butonuna tikla | Mesaj durumu `'read'` olur, modal kapanir, liste guncellenir | 1 |
| ADM-19 | Detay modalinde "Yanitlandi" butonuna tikla | Mesaj durumu `'replied'` olur, modal kapanir, liste guncellenir | 1 |
| ADM-20 | Detay modalinde "Sil" butonuna tikla ve onayla | Mesaj localStorage'dan silinir, liste guncellenir | 1 |
| ADM-21 | Detay modalinde "Sil" butonuna tikla ve iptal et | Mesaj silinmez, modal acik kalir | 2 |
| ADM-22 | Son mesaji sil | Bos durum mesaji gorunur, istatistikler 0 olur | 2 |
| ADM-23 | Detay modalinde X butonuna tikla | Modal kapanir | 2 |
| ADM-24 | XSS denemesi: mesaj iceriginde `<script>alert('xss')</script>` gonder | `escapeHtml()` ile karakter kacisi uygulanir, script calismaz | 1 |
| ADM-25 | Eksik alanli mesaj (isim yok, konu yok) | "Isimsiz" / "Konu belirtilmemis" gibi fallback degerler gorunur | 3 |

### 8.4 Cikis

| # | Senaryo | Beklenen Sonuc | P |
|---|---------|----------------|---|
| ADM-26 | "Cikis" butonuna tikla | Giris ekrani gorunur, sifre alani temizlenir, sessionStorage silinir | 1 |
| ADM-27 | Cikis sonrasi geri tusuna bas | Dashboard'a geri donulmez (sessionStorage silinmis) | 2 |

---

## 9. Sayfa Bazli Testler

### 9.1 Ana Sayfa (index.html)

| # | Senaryo | Beklenen Sonuc | P |
|---|---------|----------------|---|
| IDX-01 | 3 hizmet kartina tek tek tikla | Her kart dogru hizmet sayfasina yonlendirir | 1 |
| IDX-02 | Hizmet kartlarindaki gorsellerin yuklenmesini dogrula | `sample1.jpg`, `sample2.jpg`, `sample3.jpg` dogru goruntulenir | 1 |
| IDX-03 | Gorsellerde `loading="lazy"` attribute'unun varligini dogrula | 3 kart gorseli lazy load kullanir | 3 |
| IDX-04 | Gorsellerde `alt` attribute'unun dogru oldugunu dogrula | Her gorsel icin anlamli alt metni mevcut | 3 |
| IDX-05 | Hero bolumundeki "Hizmetlerimizi Kesfet" butonuna tikla | Yumusak kaydirma ile hizmetler bolumune gider | 2 |
| IDX-06 | Hero bolumundeki "Teklif Al" butonuna tikla | `contact.html` sayfasina yonlendirir | 2 |
| IDX-07 | Floating WhatsApp butonuna tikla | `https://wa.me/90XXXXXXXXXX` acilir (yeni sekme) | 2 |
| IDX-08 | Floating telefon butonuna tikla | `tel:+90XXXXXXXXXX` tetiklenir | 2 |
| IDX-09 | JSON-LD LocalBusiness semasini dogrula | Yapısal veri hatasız (Google Rich Results Test) | 3 |
| IDX-10 | Floating konum butonuna tikla | Google Maps linki yeni sekmede acilir, isaretli konum gosterilir | 2 |

### 9.2 Gunes Enerjisi (gunes-enerjisi.html)

| # | Senaryo | Beklenen Sonuc | P |
|---|---------|----------------|---|
| GNS-01 | "Teklif Al" CTA butonuna tikla | `contact.html?source=gunes-enerjisi` adresine yonlendirir | 1 |
| GNS-02 | Aktif nav linkinin "Gunes Enerjisi" oldugunu dogrula | Masaustu ve mobil nav'da dogru link vurgulu | 2 |
| GNS-03 | 6 alt hizmet kartinin gorunur oldugunu dogrula | Tum kartlar okunabilir ve duzgun goruntulenir | 2 |
| GNS-04 | Scroll animasyonlarinin tum bolümlerde calistigini dogrula | fade-up, fade-left, fade-right animasyonlari tetiklenir | 3 |

### 9.3 Güvenlik Sistemleri (guvenlik-sistemleri.html)

| # | Senaryo | Beklenen Sonuc | P |
|---|---------|----------------|---|
| KAM-01 | "Teklif Al" CTA butonuna tikla | `contact.html?source=kamera` adresine yonlendirir | 1 |
| KAM-02 | Aktif nav linkinin "Güvenlik Sistemleri" oldugunu dogrula | Dogru link vurgulu | 2 |
| KAM-03 | Hero bolumunun mavi tonlu gradient kullandigini dogrula | `.camera-hero` sinifi uygulanmis | 3 |
| KAM-04 | 4 kamera hizmet kartinin gorunur oldugunu dogrula | Kartlar duzgun goruntulenir | 2 |

### 9.4 Muhendislik (muhendislik.html)

| # | Senaryo | Beklenen Sonuc | P |
|---|---------|----------------|---|
| MUH-01 | "Teklif Al" CTA butonuna tikla | `contact.html?source=muhendislik` adresine yonlendirir | 1 |
| MUH-02 | Aktif nav linkinin "Muhendislik" oldugunu dogrula | Dogru link vurgulu | 2 |
| MUH-03 | Hero bolumunun mor tonlu gradient kullandigini dogrula | `.eng-hero` sinifi uygulanmis | 3 |
| MUH-04 | 3 muhendislik hizmet kartinin gorunur oldugunu dogrula | Kartlar duzgun goruntulenir | 2 |

### 9.5 Hakkimizda (about.html)

| # | Senaryo | Beklenen Sonuc | P |
|---|---------|----------------|---|
| ABT-01 | Sayfanin tarayicida sorunsuz acildigini dogrula | Sayfa dogru yuklenir, 404 hatasi yok | 1 |
| ABT-02 | "Bize Ulasin" butonuna tikla | `contact.html` sayfasina yonlendirir | 2 |
| ABT-03 | 3 ekip uyesi kartinin gorunur oldugunu dogrula | Avatar basliklari (AY, SK, MO) ve isimler gorunur | 3 |
| ABT-04 | 4 deger kartinin scroll animasyonu aldigini dogrula | Kartlar fade animasyonuyla gorunur olur | 3 |

---

## 10. Responsive Tasarim

| # | Senaryo | Beklenen Sonuc | P |
|---|---------|----------------|---|
| RES-01 | 320px genislikte tum sayfalar | Icerik tek kolona siger, yatay tasma (overflow) yok | 1 |
| RES-02 | 576px genislikte grid yapisi | `.grid--2` ve `.grid--4` 2 sutuna gecer | 2 |
| RES-03 | 768px genislikte navigasyon degisimi | Masaustu nav gorunur, hamburger gizlenir, "Teklif Al" CTA gorunur | 1 |
| RES-04 | 992px genislikte grid yapisi | `.grid--3` 3 sutuna, `.grid--4` 4 sutuna gecer | 2 |
| RES-05 | 1200px genislikte font boyutlari | h1 `--fs-6xl` boyutunda, container padding artar | 3 |
| RES-06 | Footer grid 576px altinda | Tek kolon duzeni | 2 |
| RES-07 | Footer grid 576-991px arasinda | 2 kolon duzeni | 3 |
| RES-08 | Footer grid 992px ustunde | 4 kolon duzeni (`1.5fr 1fr 1fr 1.2fr`) | 2 |
| RES-09 | Floating butonlarin tum cihaz boyutlarinda gorunur oldugunu dogrula | WhatsApp, telefon ve konum butonlari her boyutta sag altta gorunur | 2 |
| RES-10 | Form alanlari mobilde tam genislikte gorunur mu | Input ve textarea elemanlari 100% genislik kaplar | 2 |

---

## 11. SEO ve Meta Etiketler

| # | Senaryo | Beklenen Sonuc | P |
|---|---------|----------------|---|
| SEO-01 | Her sayfanin benzersiz `<title>` etiketine sahip oldugunu dogrula | 7 sayfa — 7 farkli title | 2 |
| SEO-02 | Her sayfanin `<meta description>` etiketine sahip oldugunu dogrula | Her sayfada benzersiz ve 160 karakter altinda | 2 |
| SEO-03 | Open Graph etiketlerini dogrula (og:title, og:description, og:url, og:image) | Tum genel sayfalarda mevcut | 2 |
| SEO-04 | Twitter Card etiketlerini dogrula | `summary_large_image` tipi, dogru baslik/aciklama | 3 |
| SEO-05 | Canonical URL etiketlerini dogrula | Her sayfada `<link rel="canonical">` mevcut | 3 |
| SEO-06 | `admin.html`'de `noindex, nofollow` oldugunu dogrula | `<meta name="robots" content="noindex, nofollow">` mevcut | 2 |
| SEO-07 | `og:image` etiketlerinin gercek dosyalari referans ettigini dogrula | index→sample5.jpg, gunes→sample1.jpg, kamera→sample2.jpg, muhendislik→sample3.jpg | 2 |
| SEO-08 | JSON-LD yapisal verileri hatasiz mi (Google Rich Results Test) | index: LocalBusiness, hizmet sayfalari: Service | 3 |
| SEO-09 | Tum `<img>` etiketlerinde `alt` attribute mevcut mu | Dekoratif gorsellerde bos alt (`alt=""`), icerik gorsellerinde anlamli alt | 3 |
| SEO-10 | Favicon (`img/logo.svg`) yuklendigini dogrula | Tarayici sekmesinde SVG ikon gorunur | 3 |

---

## 12. Erisilebilik (Accessibility)

| # | Senaryo | Beklenen Sonuc | P |
|---|---------|----------------|---|
| A11-01 | Tab tusu ile tum interaktif elemanlara erisim | Butonlar, linkler, form alanlari tab sirasi ile gezilebilir | 2 |
| A11-02 | Focus gorunurlugu (focus-visible) | Odaklanan elemanda 2px solid gold outline gorunur | 2 |
| A11-03 | Escape tusu ile menulerin kapanmasi | Mobil menu Escape ile kapanir | 2 |
| A11-04 | Form hata mesajlarinda `role="alert"` | Hata mesajlari ekran okuyuculara duyurulur | 3 |
| A11-05 | ARIA etiketleri: `role="navigation"`, `role="banner"`, `role="contentinfo"` | Dogru ARIA rolleri tum sayfalarda mevcut | 3 |
| A11-06 | Honeypot alaninda `tabindex="-1"` | Klavye navigasyonunda honeypot alanina ulasilamaz | 3 |
| A11-07 | Renk kontrast orani WCAG AA | Metin/arka plan kontrasti en az 4.5:1 (normal metin) | 2 |

---

## 13. Entegrasyon Testleri (Uctan Uca Akis)

| # | Senaryo | Beklenen Sonuc | P |
|---|---------|----------------|---|
| E2E-01 | index.html → "Gunes Enerjisi" karti tikla → gunes-enerjisi.html → "Teklif Al" tikla → contact.html?source=gunes-enerjisi → formu doldur ve gonder → admin.html'de giris yap → mesaji gor | Tum akis sorunsuz calisir, mesaj kaynagi "gunes-enerjisi" olarak gorunur | 1 |
| E2E-02 | Ayni akis kamera icin: index → guvenlik-sistemleri → contact?source=kamera → admin | Mesaj kaynagi "kamera" olarak gorunur | 1 |
| E2E-03 | Ayni akis muhendislik icin: index → muhendislik → contact?source=muhendislik → admin | Mesaj kaynagi "muhendislik" olarak gorunur | 1 |
| E2E-04 | Dogrudan contact.html (source yok) → formu gonder → admin'de mesaj | Mesajda source_page alani bos | 2 |
| E2E-05 | Tema degistir → 3 farkli sayfaya git → temanin korunur oldugunu dogrula | Tema tum sayfalarda tutarli | 1 |
| E2E-06 | Admin panelinde mesaji okundu isaretle → sayfayi yenile → durumun korunur oldugunu dogrula | Durum localStorage'da guncellenir, yenileme sonrasi korunur | 1 |
| E2E-07 | Admin panelinde mesaj sil → contact.html'den yeni mesaj gonder → admin'e don | Silinen mesaj yok, yeni mesaj listenin basinda | 2 |

---

## 14. Performans ve Yukleme

| # | Senaryo | Beklenen Sonuc | P |
|---|---------|----------------|---|
| PRF-01 | Chrome Lighthouse Performance skoru | Hedef: 90+ | 2 |
| PRF-02 | Chrome Lighthouse Accessibility skoru | Hedef: 90+ | 2 |
| PRF-03 | Chrome Lighthouse SEO skoru | Hedef: 90+ | 2 |
| PRF-04 | Toplam sayfa boyutunu kontrol et (harici CDN haric) | ~150-200 KB hedefi | 3 |
| PRF-05 | Google Fonts preconnect kullanildigini dogrula | `<link rel="preconnect" href="https://fonts.googleapis.com">` mevcut | 3 |
| PRF-06 | JS dosyalarinin `</body>` oncesinde yuklendigini dogrula | Render-blocking JS yok | 3 |
| PRF-07 | CSS dosya sirasi dogru mu | variables → reset → base → layout → navigation → footer → components → animations → dark-mode → sayfa-ozel → responsive | 4 |
| PRF-08 | Scroll event listener'inda `{ passive: true }` kullanildigini dogrula | main.js'de pasif dinleyici | 3 |

---

## 15. Gorseller

| # | Senaryo | Beklenen Sonuc | P |
|---|---------|----------------|---|
| IMG-01 | `img/sample1.jpg` dosyasinin var ve yuklenebilir oldugunu dogrula | Gunes paneli gorseli goruntulenir | 1 |
| IMG-02 | `img/sample2.jpg` dosyasinin var ve yuklenebilir oldugunu dogrula | Guvenlik kamerasi gorseli goruntulenir | 1 |
| IMG-03 | `img/sample3.jpg` dosyasinin var ve yuklenebilir oldugunu dogrula | Insaat/muhendislik gorseli goruntulenir | 1 |
| IMG-04 | `img/sample4.jpg` dosyasinin var oldugunu dogrula | Ekip/ofis gorseli mevcut (henuz HTML'de kullanilmiyor) | 3 |
| IMG-05 | `img/sample5.jpg` dosyasinin var oldugunu dogrula | Hero/banner gorseli mevcut (og:image olarak kullaniliyor) | 3 |
| IMG-06 | `img/logo.svg` dosyasinin yuklendigini dogrula | SVG logo header'da ve footer'da gorunur | 1 |
| IMG-07 | Gorsel kartlarinin `object-fit: cover` kullandigini dogrula | Gorseller kirpilir, orantisiz uzamaz | 2 |
| IMG-08 | `img/projeler/` klasorunun var oldugunu dogrula | Bos klasor, `README.txt` iceriyor | 4 |

---

## Ozet Istatistikler

| Kategori | Test Sayisi |
|----------|-------------|
| Navigasyon ve Header | 11 |
| Mobil Menu | 14 |
| Tema (Dark/Light) | 11 |
| Scroll Animasyonlari | 7 |
| Animasyonlu Sayaclar | 6 |
| Yumusak Kaydirma | 4 |
| Iletisim Formu | 23 |
| Kaynak Sayfa Tespiti | 7 |
| Yonetici Paneli | 20 |
| Sayfa Bazli Testler | 18 |
| Responsive Tasarim | 10 |
| SEO ve Meta Etiketler | 10 |
| Erisilebilik | 7 |
| Entegrasyon Testleri | 7 |
| Performans | 8 |
| Gorseller | 8 |
| **TOPLAM** | **171** |

---

*Bu belge SolarEnerji projesi icin olusturulmustur.*
*Tarih: 2025*
