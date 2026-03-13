# Hosting Rehberi — SolarEnerji Web Sitesi

## Bu Dosya Nedir?
Bu rehber, SolarEnerji web sitesini yayına almak için hosting seçeneklerini karşılaştırır.

---

## Mevcut Durum
Site şu an **statik** (HTML/CSS/JS) olarak çalışır. PHP veya veritabanı gerektirmez.
Formspree üzerinden form gönderimi yapılır. Admin paneli localStorage ile çalışır (demo).

---

## Ücretsiz Hosting Seçenekleri (Statik Site)

### 1. GitHub Pages
- **Fiyat:** Tamamen ücretsiz
- **Özel domain:** Destekler (CNAME)
- **SSL:** Otomatik (Let's Encrypt)
- **Limit:** 1GB depolama, 100GB/ay bant genişliği
- **Kurulum:** GitHub repo'ya push → Settings → Pages → aktifleştir
- **Avantajlar:** Kolay, hızlı, güvenilir
- **Dezavantajlar:** Sadece statik, PHP yok

### 2. Netlify
- **Fiyat:** Ücretsiz plan mevcut
- **Özel domain:** Destekler
- **SSL:** Otomatik
- **Limit:** 100GB/ay bant genişliği, 300 dk/ay build
- **Kurulum:** GitHub/GitLab bağla veya sürükle-bırak
- **Avantajlar:** Form backend dahil (aylık 100 ücretsiz), otomatik deploy
- **Dezavantajlar:** Ücretsiz planda sınırlı

### 3. Cloudflare Pages
- **Fiyat:** Ücretsiz plan mevcut
- **Özel domain:** Destekler
- **SSL:** Otomatik
- **Limit:** Sınırsız bant genişliği (!)
- **Kurulum:** GitHub bağla → otomatik deploy
- **Avantajlar:** En hızlı CDN, sınırsız trafik
- **Dezavantajlar:** Build limitleri var

### 4. Vercel
- **Fiyat:** Ücretsiz (Hobby plan)
- **Özel domain:** Destekler
- **SSL:** Otomatik
- **Limit:** 100GB/ay bant genişliği
- **Avantajlar:** Çok hızlı, kolay
- **Dezavantajlar:** Ticari kullanımda Pro plan gerekebilir

---

## Ücretli Hosting Seçenekleri (PHP Geçişi İçin)

### 1. Turhost (Türkiye)
- **Fiyat:** ~150-400₺/yıl
- **PHP:** Evet
- **MySQL:** Evet
- **SSL:** Ücretsiz Let's Encrypt
- **Avantajlar:** Türkiye lokasyonu, hızlı, Türkçe destek
- **Tavsiye:** "Başlangıç" paketi yeterli

### 2. Natro (Türkiye)
- **Fiyat:** ~200-500₺/yıl
- **PHP:** Evet
- **MySQL:** Evet
- **SSL:** Ücretsiz
- **Avantajlar:** Güvenilir, iyi destek

### 3. İHS Telekom (Türkiye)
- **Fiyat:** ~100-300₺/yıl
- **PHP:** Evet
- **SSL:** Ücretsiz
- **Avantajlar:** Ekonomik, temel ihtiyaçlar için yeterli

### 4. GoDaddy
- **Fiyat:** ~$3-5/ay (kampanyalı)
- **PHP:** Evet
- **Avantajlar:** Domain + hosting birlikte, global altyapı
- **Dezavantajlar:** Yenileme fiyatları yüksek

---

## Tavsiye Edilen Strateji

### Adım 1: Ücretsiz Başla (Şimdi)
1. **GitHub Pages** veya **Cloudflare Pages** kullanın
2. Siteyi hemen yayına alın
3. Formspree ile form gönderimi (aylık 50 ücretsiz)
4. Domain satın alın (~50-100₺/yıl, Natro veya GoDaddy'den)

### Adım 2: PHP'ye Geç (İleride)
1. Müşteri sayısı artınca Turhost veya Natro'dan shared hosting alın
2. `php/contact-handler.php` dosyası ekleyin
3. Form action URL'sini güncelleyin (tek satır değişiklik)
4. Admin panelini PHP backend ile güçlendirin (opsiyonel)

### Geçiş Ne Kadar Sürer?
- Statik → PHP geçişi: **5 dakika** (tek satır HTML + 1 PHP dosyası)
- Domain taşıma: 24-48 saat (DNS yayılma süresi)

---

## Domain Satın Alma
- **.com.tr** domain: ~50-100₺/yıl (nic.tr üzerinden)
- **.com** domain: ~$10-15/yıl
- **Tavsiye:** solarenerji.com.tr veya benzer bir Türkçe domain

---

## Hızlı Kurulum: GitHub Pages

```bash
# 1. GitHub'da yeni repo oluşturun (örn: solar1-main)
# 2. Dosyaları push edin:
git init
git add .
git commit -m "İlk yükleme"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADI/solar1-main.git
git push -u origin main

# 3. GitHub → Settings → Pages → Source: main branch
# 4. Site aktif: https://KULLANICI_ADI.github.io/solar1-main/
```

## Hızlı Kurulum: Cloudflare Pages

1. cloudflare.com'da ücretsiz hesap açın
2. Pages → Create Project → Connect GitHub
3. Repository seçin → Deploy
4. Özel domain bağlayın (DNS ayarlarından)

---

## Karşılaştırma Tablosu

| Özellik           | GitHub Pages | Cloudflare | Netlify  | Turhost (PHP) |
|-------------------|-------------|------------|----------|---------------|
| Fiyat             | Ücretsiz    | Ücretsiz   | Ücretsiz | ~200₺/yıl     |
| PHP Desteği       | Hayır       | Hayır      | Hayır    | Evet          |
| SSL               | Otomatik    | Otomatik   | Otomatik | Let's Encrypt |
| Özel Domain       | Evet        | Evet       | Evet     | Evet          |
| Form Backend      | Hayır*      | Hayır*     | 100/ay   | PHP ile       |
| Bant Genişliği    | 100GB/ay    | Sınırsız   | 100GB/ay | Pakete göre   |
| Türkiye Sunucu    | Hayır       | Evet(CDN)  | Hayır    | Evet          |
| Zorluk            | Kolay       | Kolay      | Kolay    | Orta          |

*Formspree gibi 3. parti servis ile form backend sağlanır.
