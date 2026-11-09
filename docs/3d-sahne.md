# 3D Arazi Maketi — Rehber

Sitenin arkasında, sayfa kaydırıldıkça gezilen bir 3D arazi maketi var: kiremit çatılı ev ve çatı panelleri, güneşi takip eden panel dizisi, elektrikli çit, ahır ve güvenlik kameraları, karavan, 3D printer'lı atölye. Aşağı kaydırdıkça maket üzerinde gün ilerler: şafak → öğle → gün batımı → gece. Gece pencereler yanar ve kameraların tarama ışınları görünür.

## Canlı detaylar

### Açılış turları (sayfa açılınca otomatik; ziyaretçi kaydırırsa hemen bırakılır)

| Sayfa | Tur | Ayar |
|---|---|---|
| Güneş Enerjisi | Akım panellerden kabloyla inverter'a, oradan eve gider; evin ışıkları yanar (~7 sn) | `INTRO.solar = 'flow'` |
| Güvenlik Sistemleri | Elektrikli çit → uyarı levhası/enerjileyici → direk kamerası → kameranın canlı görüntüsünün aktığı ekran (~14 sn) | `TOURS.camera` |
| Mühendislik | Web geliştirme odası → ara kapıdan geçiş → 3D modelleme/printer odası (~10 sn) | `TOURS.engineering` |

Tur rotası `[saniye, kamera konumu, bakılan nokta]` satırlarından oluşur. Bir turu kapatmak için `INTRO` içinden o sayfayı silin.

### Diğer canlı detaylar

- **Elektrikli çit:** Tüm arazinin çevresini sarar (`FX`/`FZ` = yarı ölçüler). ~1,3 saniyede bir kısa enerji atımı yapar, teller ve izolatörler mavi yanıp söner. Ön kenarda "DİKKAT ELEKTRİKLİ ÇİT" levhası ve enerjileyici var.
- **Koyunlar:** Çitin içinde 4 koyun ağır ağır dolaşır, arada başını eğip otlar (`sheep` dizisi).
- **Kamera eğimi:** Dış çekimlerde bakış en az ~10° aşağı eğik tutulur (`MIN_PITCH`); kamera göğe bakmaz.
- **Güvenlik kameraları:** Masaüstünde farenin gösterdiği noktaya döner. Fare 4 saniye durursa ve mobilde kendi kendine tarama yapar. Gece tarama ışınları görünür.
- **İzleme ekranı (ahırın önü):** Direk kamerasının o an gördüğünü **canlı** gösterir. Gece görüşü efekti, REC ve saat yazısı var. Yakındayken iki karede bir, uzaktan görünürken saniyede ~5 kare çizilir; hiçbir zaman boş görünmez.
- **İnverter ekranı:** Anlık güneş üretimi (kW), akü doluluğu ve üretim grafiği. Gece "AKÜ → EV" akışını gösterir.
- **Karavan:** Çatısında iki güneş paneli var (taşınabilir solar sistem).
- **Kulübe (iki oda):** Sol oda *3D Modelleme & Baskı*: printer vazo basar, yanında CAD modeli döner. Sağ oda *Web Geliştirme*: duvar ekranında site blok blok tasarlanır, monitörde kod yazılır, laptopta önizleme görünür. Mühendislik sayfasında hero'nun altındaki **pencere bölümü** (`.scene-window`) web odasını gösterir.

## Dosyalar

| Dosya | Görev |
|---|---|
| `js/scene3d.js` | Sahne, kamera açıları, sayfa senaryoları |
| `css/scene3d.css` | Sadece 3D çalışırken geçerli stiller (`html.has-3d`) |
| Her sayfada `<body data-scene="...">` | Hangi senaryonun kullanılacağı: `home`, `solar`, `camera`, `engineering`, `about`, `contact` |

`admin.html` sayfasında 3D yoktur.

## Hız kuralı

- Sayfa 3D'yi beklemez. Önce normal tasarımla açılır, Three.js (sıkıştırılmış ~170 KB) **sayfa yüklendikten sonra** tarayıcı boştayken CDN'den gelir.
- Hiç 3D model veya doku dosyası indirilmez, her şey kodla çizilir.
- Telefon ve zayıf cihazlarda hafif mod çalışır: gölge yok, düşük çözünürlük, 30 fps.
- Şu durumlarda 3D **hiç yüklenmez**, site düz tasarımıyla görünür:
  - "Azaltılmış hareket" ayarı açık
  - Veri tasarrufu modu açık veya 2G bağlantı
  - Çok düşük bellekli cihaz
  - WebGL desteği yok

## Görsel kalite

| Efekt | Nerede | Not |
|---|---|---|
| Parlama (bloom) + kenar yumuşatma (MSAA) | Masaüstü | Sadece ışık saçan şeyler parlar (pencere, kıvılcım, enerji akışı, güneş, ekran). Ayar: `UnrealBloomPass(…, güç 0.42, yarıçap 0.5, eşik 0.97)` |
| Ortam yansıması | Tüm cihazlar | Panel, metal ve camda belirgin. Bir kez hesaplanır |
| Pus, bulutlar, ay | Tüm cihazlar | Renkleri günün saatine göre değişir |
| Zemin dokuları | Tüm cihazlar | Çim, toprak katmanları, kaya, patika canvas ile üretilir |

**Otomatik kalite:** Masaüstünde ilk saniyelerde kare hızı 40'ın altındaysa parlama, gölgeler ve yüksek çözünürlük kendiliğinden kapanır. Telefonda bu efektlerin eklentileri hiç indirilmez. Test için en yüksek kaliteyi zorlamak isterseniz adrese `?hq=1` ekleyin (örn. `index.html?hq=1`).

## Değiştirmek için (`js/scene3d.js`)

- **Kamera açıları:** `SHOTS` → `pos` kamera konumu, `look` bakılan nokta.
- **Hangi bölümde hangi açı ve saat:** `PAGES` → her satır `<main>` içindeki bir `<section>`'a karşılık gelir, sırası aynıdır. `null` o bölümü atlar. Saat değerleri: `0` şafak, `0.3` öğle, `0.72` gün batımı, `1` gece.
  > Bir sayfaya yeni `<section>` eklerseniz `PAGES` listesine de bir satır ekleyin.
- **Gökyüzü ve ışık renkleri:** `SKY`.

## Değiştirmek için (`css/scene3d.css`)

- **İçerik panellerinin saydamlığı:** `--glass-bg`, `--glass-bg-alt` (bölüm zemini), `--glass-card` (kartlar, buzlu cam). Açık ve koyu tema için ayrı değerler var.
- **Başlıkların okunurluk halesi:** `--glass-text-halo`
- **Hero üzerindeki koyu perde:** `--scene-shade`

## 3D'yi tamamen kapatmak

Sayfadaki `<script src="js/scene3d.js" defer></script>` satırını silin. Site eski düz tasarımına döner.
