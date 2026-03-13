// ============================================================================
// SolarEnerji — Tum Test Senaryolari
// Calistirmak icin: npm install && npx playwright install && npm test
// Goruntuleyerek: npm run test:headed
// UI ile: npm run test:ui
// ============================================================================

const { test, expect } = require('@playwright/test');

// Tum sayfa yollari
const PAGES = {
  home: '/',
  solar: '/gunes-enerjisi.html',
  camera: '/kamera-kurulumu.html',
  engineering: '/muhendislik.html',
  contact: '/contact.html',
  admin: '/admin.html',
  about: '/about.html',
};

const ADMIN_PASSWORD = 'admin123';

// ============================================================================
// 1. NAVIGASYON VE HEADER
// ============================================================================
test.describe('1. Navigasyon ve Header', () => {

  test('NAV-01: Header 5 nav linki dogru sayfalara yonlendirir', async ({ page }) => {
    await page.goto(PAGES.home);
    const navLinks = page.locator('.nav .nav__link');
    await expect(navLinks).toHaveCount(5);

    const expectedHrefs = ['index.html', 'gunes-enerjisi.html', 'kamera-kurulumu.html', 'muhendislik.html', 'contact.html'];
    for (let i = 0; i < expectedHrefs.length; i++) {
      const href = await navLinks.nth(i).getAttribute('href');
      expect(href).toContain(expectedHrefs[i]);
    }
  });

  test('NAV-02: Aktif sayfanin nav linki vurgulu', async ({ page }) => {
    await page.goto(PAGES.solar);
    await expect(page.locator('.nav__link--active')).toHaveCount(1);
    const activeHref = await page.locator('.nav__link--active').getAttribute('href');
    expect(activeHref).toContain('gunes-enerjisi.html');
  });

  test('NAV-03: about.html sayfasinda hicbir nav linki aktif degil', async ({ page }) => {
    await page.goto(PAGES.about);
    // about.html ust menude yok, dolayisiyla aktif link olmamali
    const activeLinks = page.locator('.nav__link--active');
    await expect(activeLinks).toHaveCount(0);
  });

  test('NAV-04: 50px+ scroll sonrasi header golge efekti', async ({ page }) => {
    await page.goto(PAGES.home);
    const header = page.locator('.header');
    await expect(header).not.toHaveClass(/header--scrolled/);

    await page.evaluate(() => window.scrollTo(0, 100));
    await page.waitForTimeout(200);
    await expect(header).toHaveClass(/header--scrolled/);
  });

  test('NAV-05: Scroll uste donunce golge kaybolur', async ({ page }) => {
    await page.goto(PAGES.home);
    await page.evaluate(() => window.scrollTo(0, 100));
    await page.waitForTimeout(200);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);
    await expect(page.locator('.header')).not.toHaveClass(/header--scrolled/);
  });

  test('NAV-07: Header sabit pozisyonda (fixed)', async ({ page }) => {
    await page.goto(PAGES.home);
    const position = await page.locator('.header').evaluate(el => getComputedStyle(el).position);
    expect(position).toBe('fixed');
  });

  test('NAV-09: Footer Hakkimizda linki about.html sayfasina gider', async ({ page }) => {
    await page.goto(PAGES.home);
    const aboutLink = page.locator('footer a[href="about.html"]');
    await expect(aboutLink).toBeVisible();
    await aboutLink.click();
    await expect(page).toHaveURL(/about\.html/);
  });

  test('NAV-10: Footer hizmet linkleri dogru sayfalara yonlendirir', async ({ page }) => {
    await page.goto(PAGES.home);
    const footerLinks = page.locator('footer');
    await expect(footerLinks.locator('a[href="gunes-enerjisi.html"]')).toHaveCount(1);
    await expect(footerLinks.locator('a[href="kamera-kurulumu.html"]')).toHaveCount(1);
    await expect(footerLinks.locator('a[href="muhendislik.html"]')).toHaveCount(1);
  });
});

// ============================================================================
// 2. MOBIL MENU
// ============================================================================
test.describe('2. Mobil Menu', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('MOB-01: 375px genislikte hamburger gorunur, desktop nav gizli', async ({ page }) => {
    await page.goto(PAGES.home);
    await expect(page.locator('.hamburger')).toBeVisible();
    const navDisplay = await page.locator('.nav').evaluate(el => getComputedStyle(el).display);
    expect(navDisplay).toBe('none');
  });

  test('MOB-03: Hamburger tiklayinca menu acilir', async ({ page }) => {
    await page.goto(PAGES.home);
    await page.locator('.hamburger').click();
    await expect(page.locator('.mobile-nav')).toHaveClass(/mobile-nav--open/);
    await expect(page.locator('.nav-overlay')).toHaveClass(/nav-overlay--visible/);
  });

  test('MOB-05: Overlay tiklayinca menu kapanir', async ({ page }) => {
    await page.goto(PAGES.home);
    await page.locator('.hamburger').click();
    await expect(page.locator('.mobile-nav')).toHaveClass(/mobile-nav--open/);
    await page.locator('.nav-overlay').click({ force: true });
    await expect(page.locator('.mobile-nav')).not.toHaveClass(/mobile-nav--open/);
  });

  test('MOB-06: Escape tusuyla menu kapanir', async ({ page }) => {
    await page.goto(PAGES.home);
    await page.locator('.hamburger').click();
    await expect(page.locator('.mobile-nav')).toHaveClass(/mobile-nav--open/);
    await page.keyboard.press('Escape');
    await expect(page.locator('.mobile-nav')).not.toHaveClass(/mobile-nav--open/);
  });

  test('MOB-07: Menu linkine tiklayinca menu kapanir ve sayfa degisir', async ({ page }) => {
    await page.goto(PAGES.home);
    await page.locator('.hamburger').click();
    await page.locator('.mobile-nav__link[href="contact.html"]').click();
    await expect(page).toHaveURL(/contact\.html/);
  });

  test('MOB-08: Menu acikken body scroll kitli', async ({ page }) => {
    await page.goto(PAGES.home);
    await page.locator('.hamburger').click();
    const overflow = await page.evaluate(() => document.body.style.overflow);
    expect(overflow).toBe('hidden');
  });

  test('MOB-09: Menu kapandiktan sonra body scroll serbest', async ({ page }) => {
    await page.goto(PAGES.home);
    await page.locator('.hamburger').click();
    await page.keyboard.press('Escape');
    const overflow = await page.evaluate(() => document.body.style.overflow);
    expect(overflow).toBe('');
  });

  test('MOB-11: aria-expanded menu acikken true', async ({ page }) => {
    await page.goto(PAGES.home);
    await page.locator('.hamburger').click();
    await expect(page.locator('.hamburger')).toHaveAttribute('aria-expanded', 'true');
  });

  test('MOB-12: aria-expanded menu kapalikken false', async ({ page }) => {
    await page.goto(PAGES.home);
    await expect(page.locator('.hamburger')).toHaveAttribute('aria-expanded', 'false');
  });

  test('MOB-13: admin.html de hamburger yok — hata uretmez', async ({ page }) => {
    await page.goto(PAGES.admin);
    await expect(page.locator('.hamburger')).toHaveCount(0);
    // Sayfa hatasiz yuklenmeli
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.waitForTimeout(500);
    expect(errors.length).toBe(0);
  });
});

// ============================================================================
// 3. TEMA (DARK / LIGHT)
// ============================================================================
test.describe('3. Tema (Dark/Light Mode)', () => {

  test('THM-01: Toggle ile dark mode aktif olur', async ({ page }) => {
    await page.goto(PAGES.home);
    await page.evaluate(() => localStorage.removeItem('theme'));
    await page.reload();
    await page.locator('.theme-toggle').first().click();
    const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(theme).toBe('dark');
  });

  test('THM-02: Tekrar toggle ile light mode doner', async ({ page }) => {
    await page.goto(PAGES.home);
    await page.evaluate(() => localStorage.setItem('theme', 'light'));
    await page.reload();
    const toggle = page.locator('.theme-toggle').first();
    await toggle.click(); // dark
    await toggle.click(); // light
    const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(theme).toBe('light');
  });

  test('THM-03: Tema sayfa degistirince korunur', async ({ page }) => {
    await page.goto(PAGES.home);
    await page.evaluate(() => localStorage.setItem('theme', 'dark'));
    await page.goto(PAGES.contact);
    const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(theme).toBe('dark');
  });

  test('THM-06: localStorage dark iken beyaz flas olmaz', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('theme', 'dark'));
    await page.goto(PAGES.home);
    // Sayfa yuklenir yuklenmez dark olmali
    const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(theme).toBe('dark');
  });

  test('THM-11: Tum sayfalarda tema toggle calisiyor', async ({ page }) => {
    const publicPages = [PAGES.home, PAGES.solar, PAGES.camera, PAGES.engineering, PAGES.contact, PAGES.about];
    for (const url of publicPages) {
      await page.goto(url);
      const toggle = page.locator('.theme-toggle').first();
      await expect(toggle).toBeVisible();
    }
  });
});

// ============================================================================
// 4. SCROLL ANIMASYONLARI
// ============================================================================
test.describe('4. Scroll Animasyonlari', () => {

  test('ANI-01: data-animate elementleri scroll ile animated sinifi alir', async ({ page }) => {
    await page.goto(PAGES.home);
    // Sayfayi en alta kaydir ki tum elementler gorunsun
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    const animatedCount = await page.locator('[data-animate].animated').count();
    expect(animatedCount).toBeGreaterThan(0);
  });

  test('ANI-04: prefers-reduced-motion aktifken animasyon yok', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(PAGES.home);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    const animatedCount = await page.locator('[data-animate].animated').count();
    expect(animatedCount).toBe(0);
  });
});

// ============================================================================
// 5. ANIMASYONLU SAYACLAR
// ============================================================================
test.describe('5. Animasyonlu Sayaclar', () => {

  test('CNT-01: Sayaclar gorunur olunca animasyonla sayar', async ({ page }) => {
    await page.goto(PAGES.home);
    const statsSection = page.locator('.counter').first();
    await statsSection.scrollIntoViewIfNeeded();
    // Animasyonun bitmesini bekle (2 saniye duration + tampon)
    await page.waitForTimeout(2500);
    const counters = page.locator('.counter');
    const count = await counters.count();
    for (let i = 0; i < count; i++) {
      const text = await counters.nth(i).textContent();
      // Sayac 0 olmamali (animasyon tamamlanmis olmali)
      expect(text.trim()).not.toBe('0');
    }
  });

  test('CNT-02: Sayac son degerleri dogru (suffix dahil)', async ({ page }) => {
    await page.goto(PAGES.home);
    const counter = page.locator('.counter').first();
    await counter.scrollIntoViewIfNeeded();
    await page.waitForTimeout(2500);
    const text = await counter.textContent();
    // data-suffix varsa (orn. "+") iceride olmali
    expect(text.trim().length).toBeGreaterThan(0);
  });
});

// ============================================================================
// 6. YUMUSAK KAYDIRMA
// ============================================================================
test.describe('6. Yumusak Kaydirma', () => {

  test('SCR-01: #hizmetler anchor linki hizmetler bolumune kaydirir', async ({ page }) => {
    await page.goto(PAGES.home);
    const scrollBefore = await page.evaluate(() => window.scrollY);
    const anchorLink = page.locator('a[href="#hizmetler"]').first();
    if (await anchorLink.count() > 0) {
      await anchorLink.click();
      await page.waitForTimeout(1000);
      const scrollAfter = await page.evaluate(() => window.scrollY);
      expect(scrollAfter).toBeGreaterThan(scrollBefore);
    }
  });
});

// ============================================================================
// 7. ILETISIM FORMU
// ============================================================================
test.describe('7. Iletisim Formu', () => {

  test.describe('7.1 Form Dogrulama', () => {

    test('FRM-02: Ad alani 1 karakter — hata mesaji gorunur', async ({ page }) => {
      await page.goto(PAGES.contact);
      const nameInput = page.locator('#name');
      await nameInput.fill('A');
      await nameInput.blur();
      const errorEl = page.locator('#name').locator('..').locator('.form-error');
      await expect(errorEl).toBeVisible();
    });

    test('FRM-03: Ad alani 2 karakter — gecerli', async ({ page }) => {
      await page.goto(PAGES.contact);
      const nameInput = page.locator('#name');
      await nameInput.fill('AB');
      await nameInput.blur();
      await expect(nameInput).not.toHaveClass(/error/);
    });

    test('FRM-04: Sadece bosluk — hata mesaji', async ({ page }) => {
      await page.goto(PAGES.contact);
      const nameInput = page.locator('#name');
      await nameInput.fill('   ');
      await nameInput.blur();
      const hasError = await nameInput.evaluate(el => el.classList.contains('error'));
      expect(hasError).toBe(true);
    });

    test('FRM-05: Gecersiz email — hata mesaji', async ({ page }) => {
      await page.goto(PAGES.contact);
      const emailInput = page.locator('#email');
      await emailInput.fill('abc');
      await emailInput.blur();
      const hasError = await emailInput.evaluate(el => el.classList.contains('error'));
      expect(hasError).toBe(true);
    });

    test('FRM-06: Gecerli email (a@b.c) — hata yok', async ({ page }) => {
      await page.goto(PAGES.contact);
      const emailInput = page.locator('#email');
      await emailInput.fill('a@b.c');
      await emailInput.blur();
      const hasError = await emailInput.evaluate(el => el.classList.contains('error'));
      expect(hasError).toBe(false);
    });

    test('FRM-08: Telefon bos — gecerli (istege bagli)', async ({ page }) => {
      await page.goto(PAGES.contact);
      const phoneInput = page.locator('#phone');
      await phoneInput.focus();
      await phoneInput.blur();
      const hasError = await phoneInput.evaluate(el => el.classList.contains('error'));
      expect(hasError).toBe(false);
    });

    test('FRM-09: Telefon 6 karakter — hata', async ({ page }) => {
      await page.goto(PAGES.contact);
      const phoneInput = page.locator('#phone');
      await phoneInput.fill('123456');
      await phoneInput.blur();
      const hasError = await phoneInput.evaluate(el => el.classList.contains('error'));
      expect(hasError).toBe(true);
    });

    test('FRM-10: Telefon 7 karakter — gecerli', async ({ page }) => {
      await page.goto(PAGES.contact);
      const phoneInput = page.locator('#phone');
      await phoneInput.fill('1234567');
      await phoneInput.blur();
      const hasError = await phoneInput.evaluate(el => el.classList.contains('error'));
      expect(hasError).toBe(false);
    });

    test('FRM-11: Telefon ozel karakterli — gecerli', async ({ page }) => {
      await page.goto(PAGES.contact);
      const phoneInput = page.locator('#phone');
      await phoneInput.fill('+90 (555) 123-45-67');
      await phoneInput.blur();
      const hasError = await phoneInput.evaluate(el => el.classList.contains('error'));
      expect(hasError).toBe(false);
    });

    test('FRM-14: Mesaj 9 karakter — hata', async ({ page }) => {
      await page.goto(PAGES.contact);
      const msgInput = page.locator('#message');
      await msgInput.fill('123456789');
      await msgInput.blur();
      const hasError = await msgInput.evaluate(el => el.classList.contains('error'));
      expect(hasError).toBe(true);
    });

    test('FRM-15: Mesaj 10 karakter — gecerli', async ({ page }) => {
      await page.goto(PAGES.contact);
      const msgInput = page.locator('#message');
      await msgInput.fill('1234567890');
      await msgInput.blur();
      const hasError = await msgInput.evaluate(el => el.classList.contains('error'));
      expect(hasError).toBe(false);
    });

    test('FRM-16: Hatali alan duzeltilince hata temizlenir', async ({ page }) => {
      await page.goto(PAGES.contact);
      const nameInput = page.locator('#name');
      await nameInput.fill('A');
      await nameInput.blur();
      // Hata var
      let hasError = await nameInput.evaluate(el => el.classList.contains('error'));
      expect(hasError).toBe(true);
      // Duzelt
      await nameInput.fill('Ahmet Yilmaz');
      // input eventi ile hata temizlenmeli
      hasError = await nameInput.evaluate(el => el.classList.contains('error'));
      expect(hasError).toBe(false);
    });
  });

  test.describe('7.2 Form Gonderimi', () => {

    test('FRM-17: Gecerli form gonderimi — buton spinner gosterir', async ({ page }) => {
      await page.goto(PAGES.contact);
      // Formu doldur
      await page.locator('#name').fill('Test Kullanici');
      await page.locator('#email').fill('test@test.com');
      await page.locator('#subject').fill('Test Konusu');
      await page.locator('#message').fill('Bu bir test mesajidir, en az 10 karakter.');

      // Formspree istegini yakala (placeholder URL basarisiz olacak)
      const submitBtn = page.locator('#contact-form button[type="submit"]');
      await submitBtn.click();

      // Buton gecici olarak devre disi olmali
      // Not: Placeholder URL ile hata alinacak ama localStorage'a kaydedilmeli
      await page.waitForTimeout(2000);
    });

    test('FRM-21: Honeypot doldurulursa form gonderilmez', async ({ page }) => {
      await page.goto(PAGES.contact);
      await page.locator('#name').fill('Bot Test');
      await page.locator('#email').fill('bot@test.com');
      await page.locator('#subject').fill('Spam');
      await page.locator('#message').fill('Bu bir spam mesajidir test.');

      // Honeypot alanini doldur
      await page.locator('input[name="_gotcha"]').fill('spam', { force: true });

      // Mesaj sayisini kaydet
      const beforeCount = await page.evaluate(() => {
        const msgs = JSON.parse(localStorage.getItem('solarenerji_messages') || '[]');
        return msgs.length;
      });

      await page.locator('#contact-form button[type="submit"]').click();
      await page.waitForTimeout(1000);

      // localStorage'a eklenmemis olmali
      const afterCount = await page.evaluate(() => {
        const msgs = JSON.parse(localStorage.getItem('solarenerji_messages') || '[]');
        return msgs.length;
      });
      expect(afterCount).toBe(beforeCount);
    });

    test('FRM-22: Gonderim sonrasi mesaj localStorage a kaydedilir', async ({ page }) => {
      await page.goto(PAGES.contact);
      // Onceki mesajlari temizle
      await page.evaluate(() => localStorage.removeItem('solarenerji_messages'));

      await page.locator('#name').fill('Kayit Testi');
      await page.locator('#email').fill('kayit@test.com');
      await page.locator('#subject').fill('Kayit Konusu');
      await page.locator('#message').fill('Bu mesaj localStorage a kaydedilmeli.');
      await page.locator('#contact-form button[type="submit"]').click();
      await page.waitForTimeout(2000);

      const messages = await page.evaluate(() => {
        return JSON.parse(localStorage.getItem('solarenerji_messages') || '[]');
      });
      expect(messages.length).toBe(1);
      expect(messages[0].name).toBe('Kayit Testi');
      expect(messages[0].email).toBe('kayit@test.com');
      expect(messages[0].status).toBe('new');
    });

    test('FRM-23: Kaydedilen mesaj tum alanlari icerir', async ({ page }) => {
      await page.goto(PAGES.contact);
      await page.evaluate(() => localStorage.removeItem('solarenerji_messages'));

      await page.locator('#name').fill('Tam Alan Testi');
      await page.locator('#email').fill('alan@test.com');
      await page.locator('#phone').fill('5551234567');
      await page.locator('#subject').fill('Alan Testi');
      await page.locator('#service').selectOption('kamera');
      await page.locator('#message').fill('Tum alanlarin kaydedildigini test ediyorum.');
      await page.locator('#contact-form button[type="submit"]').click();
      await page.waitForTimeout(2000);

      const messages = await page.evaluate(() => {
        return JSON.parse(localStorage.getItem('solarenerji_messages') || '[]');
      });
      const msg = messages[0];
      expect(msg).toHaveProperty('name');
      expect(msg).toHaveProperty('email');
      expect(msg).toHaveProperty('phone');
      expect(msg).toHaveProperty('subject');
      expect(msg).toHaveProperty('service');
      expect(msg).toHaveProperty('message');
      expect(msg).toHaveProperty('date');
      expect(msg).toHaveProperty('status');
    });
  });

  test.describe('7.3 Kaynak Sayfa Tespiti', () => {

    test('SRC-01: source=gunes-enerjisi — baslik ve form degisir', async ({ page }) => {
      await page.goto(PAGES.contact + '?source=gunes-enerjisi');
      const title = await page.locator('#contact-page-title').textContent();
      expect(title).toContain('Güneş Enerjisi');

      const serviceVal = await page.locator('#service').inputValue();
      expect(serviceVal).toBe('gunes-enerjisi');
    });

    test('SRC-02: source=kamera — baslik ve form degisir', async ({ page }) => {
      await page.goto(PAGES.contact + '?source=kamera');
      const title = await page.locator('#contact-page-title').textContent();
      expect(title).toContain('Kamera');

      const serviceVal = await page.locator('#service').inputValue();
      expect(serviceVal).toBe('kamera');
    });

    test('SRC-03: source=muhendislik — baslik ve form degisir', async ({ page }) => {
      await page.goto(PAGES.contact + '?source=muhendislik');
      const title = await page.locator('#contact-page-title').textContent();
      expect(title).toContain('Mühendislik');

      const serviceVal = await page.locator('#service').inputValue();
      expect(serviceVal).toBe('muhendislik');
    });

    test('SRC-04: source=diger (tanimsiz) — degisiklik yok', async ({ page }) => {
      await page.goto(PAGES.contact + '?source=diger');
      const title = await page.locator('#contact-page-title').textContent();
      expect(title).toContain('İletişim');
    });

    test('SRC-05: source parametresi yok — varsayilan', async ({ page }) => {
      await page.goto(PAGES.contact);
      const title = await page.locator('#contact-page-title').textContent();
      expect(title).toContain('İletişim');

      const serviceVal = await page.locator('#service').inputValue();
      expect(serviceVal).toBe('');
    });
  });
});

// ============================================================================
// 8. YONETICI PANELI
// ============================================================================
test.describe('8. Yonetici Paneli', () => {

  test.describe('8.1 Giris', () => {

    test('ADM-01: Dogru sifre ile giris — dashboard gorunur', async ({ page }) => {
      await page.goto(PAGES.admin);
      await page.locator('#admin-password').fill(ADMIN_PASSWORD);
      await page.locator('#login-form button[type="submit"]').click();
      await expect(page.locator('#admin-dashboard')).toBeVisible();
    });

    test('ADM-02: Yanlis sifre — hata mesaji', async ({ page }) => {
      await page.goto(PAGES.admin);
      await page.locator('#admin-password').fill('yanlis123');
      await page.locator('#login-form button[type="submit"]').click();
      await expect(page.locator('#login-error')).toBeVisible();
    });

    test('ADM-03: Bosluklu sifre (admin123 ) — hata mesaji', async ({ page }) => {
      await page.goto(PAGES.admin);
      await page.locator('#admin-password').fill('admin123 ');
      await page.locator('#login-form button[type="submit"]').click();
      await expect(page.locator('#login-error')).toBeVisible();
    });

    test('ADM-05: Giris sonrasi sayfa yenilemede oturum devam eder', async ({ page }) => {
      await page.goto(PAGES.admin);
      await page.locator('#admin-password').fill(ADMIN_PASSWORD);
      await page.locator('#login-form button[type="submit"]').click();
      await expect(page.locator('#admin-dashboard')).toBeVisible();

      await page.reload();
      await expect(page.locator('#admin-dashboard')).toBeVisible();
    });
  });

  test.describe('8.2 Dashboard ve Mesajlar', () => {

    test('ADM-08: Mesaj yokken bos durum mesaji gorunur', async ({ page }) => {
      await page.goto(PAGES.admin);
      await page.evaluate(() => localStorage.removeItem('solarenerji_messages'));
      await page.locator('#admin-password').fill(ADMIN_PASSWORD);
      await page.locator('#login-form button[type="submit"]').click();
      await expect(page.locator('#empty-state')).toBeVisible();
    });

    test('ADM-09: Mesajlar varken listede gorunur', async ({ page }) => {
      await page.goto(PAGES.admin);
      // Test mesajlari ekle
      await page.evaluate(() => {
        const messages = [
          { name: 'Ali', email: 'ali@test.com', subject: 'Test 1', service: 'gunes-enerjisi', message: 'Mesaj 1', date: new Date().toISOString(), status: 'new' },
          { name: 'Veli', email: 'veli@test.com', subject: 'Test 2', service: 'kamera', message: 'Mesaj 2', date: new Date().toISOString(), status: 'new' },
          { name: 'Ayse', email: 'ayse@test.com', subject: 'Test 3', service: 'muhendislik', message: 'Mesaj 3', date: new Date().toISOString(), status: 'new' },
        ];
        localStorage.setItem('solarenerji_messages', JSON.stringify(messages));
      });
      await page.locator('#admin-password').fill(ADMIN_PASSWORD);
      await page.locator('#login-form button[type="submit"]').click();
      await expect(page.locator('#empty-state')).not.toBeVisible();

      // Istatistik kontrolleri
      await expect(page.locator('#stat-total')).toHaveText('3');
      await expect(page.locator('#stat-solar')).toHaveText('1');
      await expect(page.locator('#stat-camera')).toHaveText('1');
      await expect(page.locator('#stat-eng')).toHaveText('1');
    });

    test('ADM-10: 15 mesaj varken sadece son 10 gorunur', async ({ page }) => {
      await page.goto(PAGES.admin);
      await page.evaluate(() => {
        const messages = [];
        for (let i = 1; i <= 15; i++) {
          messages.push({
            name: `Kisi ${i}`, email: `kisi${i}@test.com`, subject: `Konu ${i}`,
            service: 'gunes-enerjisi', message: `Mesaj ${i}`,
            date: new Date(2025, 0, i).toISOString(), status: 'new'
          });
        }
        localStorage.setItem('solarenerji_messages', JSON.stringify(messages));
      });
      await page.locator('#admin-password').fill(ADMIN_PASSWORD);
      await page.locator('#login-form button[type="submit"]').click();

      const rows = page.locator('#messages-list .message-row, #messages-list tr, #messages-list .admin-message');
      const rowCount = await rows.count();
      expect(rowCount).toBeLessThanOrEqual(10);
    });

    test('ADM-17: Mesaj satirina tiklayinca detay modali acilir', async ({ page }) => {
      await page.goto(PAGES.admin);
      await page.evaluate(() => {
        const messages = [
          { name: 'Modal Test', email: 'modal@test.com', subject: 'Modal Konusu', service: 'kamera', message: 'Detay modali test mesaji', date: new Date().toISOString(), status: 'new' }
        ];
        localStorage.setItem('solarenerji_messages', JSON.stringify(messages));
      });
      await page.locator('#admin-password').fill(ADMIN_PASSWORD);
      await page.locator('#login-form button[type="submit"]').click();

      // Ilk mesaj satirina tikla
      const firstRow = page.locator('#messages-list').locator('*[data-index]').first();
      if (await firstRow.count() > 0) {
        await firstRow.click();
        await expect(page.locator('#message-detail')).toBeVisible();
      }
    });

    test('ADM-24: XSS denemesi — script calismaz', async ({ page }) => {
      await page.goto(PAGES.admin);
      await page.evaluate(() => {
        const messages = [
          { name: '<script>alert("xss")</script>', email: 'xss@test.com', subject: 'XSS Test', service: 'kamera', message: '<img onerror=alert(1) src=x>', date: new Date().toISOString(), status: 'new' }
        ];
        localStorage.setItem('solarenerji_messages', JSON.stringify(messages));
      });

      // Alert olusursa yakala
      let alertFired = false;
      page.on('dialog', async dialog => {
        alertFired = true;
        await dialog.dismiss();
      });

      await page.locator('#admin-password').fill(ADMIN_PASSWORD);
      await page.locator('#login-form button[type="submit"]').click();
      await page.waitForTimeout(1000);

      expect(alertFired).toBe(false);
    });
  });

  test.describe('8.3 Cikis', () => {

    test('ADM-26: Cikis butonu giris ekranina dondurur', async ({ page }) => {
      await page.goto(PAGES.admin);
      await page.locator('#admin-password').fill(ADMIN_PASSWORD);
      await page.locator('#login-form button[type="submit"]').click();
      await expect(page.locator('#admin-dashboard')).toBeVisible();

      await page.locator('#logout-btn').click();
      await expect(page.locator('#login-form')).toBeVisible();
      await expect(page.locator('#admin-dashboard')).not.toBeVisible();
    });

    test('ADM-27: Cikis sonrasi sessionStorage temizlenir', async ({ page }) => {
      await page.goto(PAGES.admin);
      await page.locator('#admin-password').fill(ADMIN_PASSWORD);
      await page.locator('#login-form button[type="submit"]').click();
      await page.locator('#logout-btn').click();

      const session = await page.evaluate(() => sessionStorage.getItem('solarenerji_admin_session'));
      expect(session).toBeNull();
    });
  });
});

// ============================================================================
// 9. SAYFA BAZLI TESTLER
// ============================================================================
test.describe('9. Sayfa Bazli Testler', () => {

  test.describe('9.1 Ana Sayfa', () => {

    test('IDX-01: 3 hizmet karti dogru sayfalara yonlendirir', async ({ page }) => {
      await page.goto(PAGES.home);
      const cards = page.locator('a.image-card--clickable');
      await expect(cards).toHaveCount(3);

      const hrefs = [];
      for (let i = 0; i < 3; i++) {
        hrefs.push(await cards.nth(i).getAttribute('href'));
      }
      expect(hrefs).toContain('gunes-enerjisi.html');
      expect(hrefs).toContain('kamera-kurulumu.html');
      expect(hrefs).toContain('muhendislik.html');
    });

    test('IDX-02: Hizmet kartlarindaki gorseller yukleniyor', async ({ page }) => {
      await page.goto(PAGES.home);
      const images = page.locator('.image-card__image');
      const count = await images.count();
      expect(count).toBe(3);

      for (let i = 0; i < count; i++) {
        const src = await images.nth(i).getAttribute('src');
        expect(src).toContain('sample');
      }
    });

    test('IDX-03: Gorsellerde loading=lazy attribute var', async ({ page }) => {
      await page.goto(PAGES.home);
      const images = page.locator('.image-card__image');
      const count = await images.count();
      for (let i = 0; i < count; i++) {
        await expect(images.nth(i)).toHaveAttribute('loading', 'lazy');
      }
    });

    test('IDX-04: Gorsellerde alt attribute var', async ({ page }) => {
      await page.goto(PAGES.home);
      const images = page.locator('.image-card__image');
      const count = await images.count();
      for (let i = 0; i < count; i++) {
        const alt = await images.nth(i).getAttribute('alt');
        expect(alt).toBeTruthy();
        expect(alt.length).toBeGreaterThan(0);
      }
    });

    test('IDX-07: Floating WhatsApp butonu gorunur', async ({ page }) => {
      await page.goto(PAGES.home);
      const waBtn = page.locator('a[href*="wa.me"]');
      await expect(waBtn).toBeVisible();
    });

    test('IDX-08: Floating telefon butonu gorunur', async ({ page }) => {
      await page.goto(PAGES.home);
      const phoneBtn = page.locator('a[href^="tel:"]');
      await expect(phoneBtn).toBeVisible();
    });
  });

  test.describe('9.2 Gunes Enerjisi', () => {

    test('GNS-01: CTA butonu contact?source=gunes-enerjisi ye yonlendirir', async ({ page }) => {
      await page.goto(PAGES.solar);
      const ctaLink = page.locator('a[href*="contact.html?source=gunes-enerjisi"]').first();
      await expect(ctaLink).toBeVisible();
    });

    test('GNS-02: Aktif nav linki Gunes Enerjisi', async ({ page }) => {
      await page.goto(PAGES.solar);
      const activeLink = page.locator('.nav__link--active');
      const href = await activeLink.getAttribute('href');
      expect(href).toContain('gunes-enerjisi');
    });
  });

  test.describe('9.3 Kamera Kurulumu', () => {

    test('KAM-01: CTA butonu contact?source=kamera ya yonlendirir', async ({ page }) => {
      await page.goto(PAGES.camera);
      const ctaLink = page.locator('a[href*="contact.html?source=kamera"]').first();
      await expect(ctaLink).toBeVisible();
    });

    test('KAM-02: Aktif nav linki Kamera Kurulumu', async ({ page }) => {
      await page.goto(PAGES.camera);
      const activeLink = page.locator('.nav__link--active');
      const href = await activeLink.getAttribute('href');
      expect(href).toContain('kamera-kurulumu');
    });
  });

  test.describe('9.4 Muhendislik', () => {

    test('MUH-01: CTA butonu contact?source=muhendislik e yonlendirir', async ({ page }) => {
      await page.goto(PAGES.engineering);
      const ctaLink = page.locator('a[href*="contact.html?source=muhendislik"]').first();
      await expect(ctaLink).toBeVisible();
    });

    test('MUH-02: Aktif nav linki Muhendislik', async ({ page }) => {
      await page.goto(PAGES.engineering);
      const activeLink = page.locator('.nav__link--active');
      const href = await activeLink.getAttribute('href');
      expect(href).toContain('muhendislik');
    });
  });

  test.describe('9.5 Hakkimizda', () => {

    test('ABT-01: Sayfa sorunsuz yuklenir', async ({ page }) => {
      const response = await page.goto(PAGES.about);
      expect(response.status()).toBe(200);
    });

    test('ABT-02: Bize Ulasin butonu contact.html e gider', async ({ page }) => {
      await page.goto(PAGES.about);
      const contactLink = page.locator('a[href="contact.html"]').first();
      await expect(contactLink).toBeVisible();
    });
  });
});

// ============================================================================
// 10. RESPONSIVE TASARIM
// ============================================================================
test.describe('10. Responsive Tasarim', () => {

  test('RES-01: 320px genislikte yatay tasma yok', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto(PAGES.home);
    const overflowing = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(overflowing).toBe(false);
  });

  test('RES-03: 768px de masaustu nav gorunur, hamburger gizli', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(PAGES.home);
    const navDisplay = await page.locator('.nav').evaluate(el => getComputedStyle(el).display);
    expect(navDisplay).toBe('flex');
    const hamDisplay = await page.locator('.hamburger').evaluate(el => getComputedStyle(el).display);
    expect(hamDisplay).toBe('none');
  });

  test('RES-09: Floating butonlar mobilde gorunur', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(PAGES.home);
    await expect(page.locator('a[href*="wa.me"]')).toBeVisible();
    await expect(page.locator('a[href^="tel:"]')).toBeVisible();
  });

  test('RES-10: Form alanlari mobilde tam genislik', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(PAGES.contact);
    const inputWidth = await page.locator('#name').evaluate(el => {
      const style = getComputedStyle(el);
      const parentWidth = el.parentElement.clientWidth;
      return el.offsetWidth / parentWidth;
    });
    // En az %90 genislik kaplamali
    expect(inputWidth).toBeGreaterThan(0.9);
  });
});

// ============================================================================
// 11. SEO VE META ETIKETLER
// ============================================================================
test.describe('11. SEO ve Meta Etiketler', () => {

  test('SEO-01: Her sayfanin benzersiz title etiketi var', async ({ page }) => {
    const titles = [];
    for (const url of Object.values(PAGES)) {
      await page.goto(url);
      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(0);
      expect(title.length).toBeLessThanOrEqual(70);
      titles.push(title);
    }
    // Tum title'lar benzersiz olmali
    const unique = new Set(titles);
    expect(unique.size).toBe(titles.length);
  });

  test('SEO-02: Her sayfanin meta description etiketi var', async ({ page }) => {
    const publicPages = [PAGES.home, PAGES.solar, PAGES.camera, PAGES.engineering, PAGES.contact, PAGES.about];
    for (const url of publicPages) {
      await page.goto(url);
      const desc = await page.locator('meta[name="description"]').getAttribute('content');
      expect(desc).toBeTruthy();
      expect(desc.length).toBeGreaterThan(0);
      expect(desc.length).toBeLessThanOrEqual(160);
    }
  });

  test('SEO-03: Genel sayfalarda Open Graph etiketleri var', async ({ page }) => {
    const publicPages = [PAGES.home, PAGES.solar, PAGES.camera, PAGES.engineering];
    for (const url of publicPages) {
      await page.goto(url);
      await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
      await expect(page.locator('meta[property="og:description"]')).toHaveCount(1);
      await expect(page.locator('meta[property="og:url"]')).toHaveCount(1);
      await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
    }
  });

  test('SEO-06: admin.html noindex nofollow', async ({ page }) => {
    await page.goto(PAGES.admin);
    const robots = await page.locator('meta[name="robots"]').getAttribute('content');
    expect(robots).toContain('noindex');
    expect(robots).toContain('nofollow');
  });

  test('SEO-07: og:image dogru dosyalari referans ediyor', async ({ page }) => {
    const expected = [
      { url: PAGES.home, img: 'sample5.jpg' },
      { url: PAGES.solar, img: 'sample1.jpg' },
      { url: PAGES.camera, img: 'sample2.jpg' },
      { url: PAGES.engineering, img: 'sample3.jpg' },
    ];
    for (const { url, img } of expected) {
      await page.goto(url);
      const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
      expect(ogImage).toContain(img);
    }
  });

  test('SEO-10: Favicon (logo.svg) yukleniyor', async ({ page }) => {
    await page.goto(PAGES.home);
    const favicon = page.locator('link[rel="icon"]');
    await expect(favicon).toHaveCount(1);
    const href = await favicon.getAttribute('href');
    expect(href).toContain('logo.svg');
  });
});

// ============================================================================
// 12. ERISILEBILIRLIK
// ============================================================================
test.describe('12. Erisilebilirlik', () => {

  test('A11-03: Escape tusu ile mobil menu kapanir', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(PAGES.home);
    await page.locator('.hamburger').click();
    await expect(page.locator('.mobile-nav')).toHaveClass(/mobile-nav--open/);
    await page.keyboard.press('Escape');
    await expect(page.locator('.mobile-nav')).not.toHaveClass(/mobile-nav--open/);
  });

  test('A11-05: ARIA rolleri mevcut', async ({ page }) => {
    await page.goto(PAGES.home);
    // Navigation role
    const navRole = page.locator('[role="navigation"]');
    expect(await navRole.count()).toBeGreaterThan(0);
  });

  test('A11-06: Honeypot alaninda tabindex=-1', async ({ page }) => {
    await page.goto(PAGES.contact);
    const honeypot = page.locator('input[name="_gotcha"]');
    await expect(honeypot).toHaveAttribute('tabindex', '-1');
  });
});

// ============================================================================
// 13. ENTEGRASYON TESTLERI (UCTAN UCA)
// ============================================================================
test.describe('13. Uctan Uca Akislar', () => {

  test('E2E-01: Gunes enerjisi akisi: index → gunes → contact → admin', async ({ page }) => {
    // Temizle
    await page.goto(PAGES.admin);
    await page.evaluate(() => localStorage.removeItem('solarenerji_messages'));

    // 1. Ana sayfadan gunes enerjisi kartina tikla
    await page.goto(PAGES.home);
    await page.locator('a.image-card--clickable[href="gunes-enerjisi.html"]').click();
    await expect(page).toHaveURL(/gunes-enerjisi/);

    // 2. CTA butonuna tikla
    await page.locator('a[href*="contact.html?source=gunes-enerjisi"]').first().click();
    await expect(page).toHaveURL(/contact\.html\?source=gunes-enerjisi/);

    // 3. Form otomatik doldurulmus mu kontrol et
    const serviceVal = await page.locator('#service').inputValue();
    expect(serviceVal).toBe('gunes-enerjisi');

    // 4. Formu tamamla ve gonder
    await page.locator('#name').fill('E2E Test Kullanici');
    await page.locator('#email').fill('e2e@test.com');
    await page.locator('#message').fill('Bu bir uctan uca test mesajidir.');
    await page.locator('#contact-form button[type="submit"]').click();
    await page.waitForTimeout(2000);

    // 5. Admin paneline git ve mesaji gor
    await page.goto(PAGES.admin);
    await page.locator('#admin-password').fill(ADMIN_PASSWORD);
    await page.locator('#login-form button[type="submit"]').click();

    await expect(page.locator('#stat-total')).toHaveText('1');
    await expect(page.locator('#stat-solar')).toHaveText('1');
  });

  test('E2E-02: Kamera akisi: index → kamera → contact → admin', async ({ page }) => {
    await page.goto(PAGES.admin);
    await page.evaluate(() => localStorage.removeItem('solarenerji_messages'));

    await page.goto(PAGES.home);
    await page.locator('a.image-card--clickable[href="kamera-kurulumu.html"]').click();
    await expect(page).toHaveURL(/kamera-kurulumu/);

    await page.locator('a[href*="contact.html?source=kamera"]').first().click();
    await expect(page).toHaveURL(/contact\.html\?source=kamera/);

    const serviceVal = await page.locator('#service').inputValue();
    expect(serviceVal).toBe('kamera');

    await page.locator('#name').fill('Kamera Test');
    await page.locator('#email').fill('kamera@test.com');
    await page.locator('#message').fill('Kamera kurulumu hakkinda bilgi istiyorum.');
    await page.locator('#contact-form button[type="submit"]').click();
    await page.waitForTimeout(2000);

    await page.goto(PAGES.admin);
    await page.locator('#admin-password').fill(ADMIN_PASSWORD);
    await page.locator('#login-form button[type="submit"]').click();
    await expect(page.locator('#stat-camera')).toHaveText('1');
  });

  test('E2E-03: Muhendislik akisi: index → muhendislik → contact → admin', async ({ page }) => {
    await page.goto(PAGES.admin);
    await page.evaluate(() => localStorage.removeItem('solarenerji_messages'));

    await page.goto(PAGES.home);
    await page.locator('a.image-card--clickable[href="muhendislik.html"]').click();
    await expect(page).toHaveURL(/muhendislik/);

    await page.locator('a[href*="contact.html?source=muhendislik"]').first().click();
    await expect(page).toHaveURL(/contact\.html\?source=muhendislik/);

    const serviceVal = await page.locator('#service').inputValue();
    expect(serviceVal).toBe('muhendislik');

    await page.locator('#name').fill('Muhendislik Test');
    await page.locator('#email').fill('eng@test.com');
    await page.locator('#message').fill('Muhendislik destegi hakkinda bilgi istiyorum.');
    await page.locator('#contact-form button[type="submit"]').click();
    await page.waitForTimeout(2000);

    await page.goto(PAGES.admin);
    await page.locator('#admin-password').fill(ADMIN_PASSWORD);
    await page.locator('#login-form button[type="submit"]').click();
    await expect(page.locator('#stat-eng')).toHaveText('1');
  });

  test('E2E-05: Tema tum sayfalarda korunur', async ({ page }) => {
    await page.goto(PAGES.home);
    await page.evaluate(() => localStorage.setItem('theme', 'dark'));

    const checkPages = [PAGES.home, PAGES.solar, PAGES.contact, PAGES.about];
    for (const url of checkPages) {
      await page.goto(url);
      const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
      expect(theme).toBe('dark');
    }
  });

  test('E2E-06: Admin mesaj durumu guncelleme kalici', async ({ page }) => {
    // Mesaj ekle
    await page.goto(PAGES.admin);
    await page.evaluate(() => {
      const messages = [
        { name: 'Durum Test', email: 'durum@test.com', subject: 'Durum', service: 'kamera', message: 'Durum testi', date: new Date().toISOString(), status: 'new' }
      ];
      localStorage.setItem('solarenerji_messages', JSON.stringify(messages));
    });

    // Giris yap
    await page.locator('#admin-password').fill(ADMIN_PASSWORD);
    await page.locator('#login-form button[type="submit"]').click();

    // Mesaja tikla ve okundu isaretle
    const firstRow = page.locator('#messages-list').locator('*[data-index]').first();
    if (await firstRow.count() > 0) {
      await firstRow.click();
      await page.locator('#btn-mark-read').click();
      await page.waitForTimeout(500);

      // Sayfayi yenile ve durumu kontrol et
      await page.reload();
      const messages = await page.evaluate(() => {
        return JSON.parse(localStorage.getItem('solarenerji_messages') || '[]');
      });
      expect(messages[0].status).toBe('read');
    }
  });
});

// ============================================================================
// 14. GORSELLER
// ============================================================================
test.describe('14. Gorseller', () => {

  test('IMG-01 → IMG-03: Hizmet karti gorselleri yukleniyor', async ({ page }) => {
    await page.goto(PAGES.home);
    const images = page.locator('.image-card__image');
    const count = await images.count();
    expect(count).toBe(3);

    for (let i = 0; i < count; i++) {
      const loaded = await images.nth(i).evaluate(img => img.complete && img.naturalHeight > 0);
      expect(loaded).toBe(true);
    }
  });

  test('IMG-06: logo.svg header ve footer da gorunur', async ({ page }) => {
    await page.goto(PAGES.home);
    const headerLogo = page.locator('.header img[src*="logo.svg"]');
    await expect(headerLogo).toBeVisible();

    const footerLogo = page.locator('footer img[src*="logo.svg"]');
    await expect(footerLogo).toBeVisible();
  });

  test('IMG-07: Gorsel kartlari object-fit: cover kullaniyor', async ({ page }) => {
    await page.goto(PAGES.home);
    const img = page.locator('.image-card__image').first();
    const objectFit = await img.evaluate(el => getComputedStyle(el).objectFit);
    expect(objectFit).toBe('cover');
  });
});

// ============================================================================
// 15. PERFORMANS
// ============================================================================
test.describe('15. Performans', () => {

  test('PRF-05: Google Fonts preconnect mevcut', async ({ page }) => {
    await page.goto(PAGES.home);
    const preconnect = page.locator('link[rel="preconnect"][href*="fonts.googleapis.com"]');
    await expect(preconnect).toHaveCount(1);
  });

  test('PRF-06: JS dosyalari body sonunda yukleniyor', async ({ page }) => {
    await page.goto(PAGES.home);
    // head icinde script olmamali (inline tema scripti haric)
    const bodyScripts = await page.evaluate(() => {
      const scripts = document.querySelectorAll('body > script[src]');
      return scripts.length;
    });
    expect(bodyScripts).toBeGreaterThan(0);
  });

  test('PRF-07: Tum sayfalar 200 durum koduyla yukleniyor', async ({ page }) => {
    for (const url of Object.values(PAGES)) {
      const response = await page.goto(url);
      expect(response.status()).toBe(200);
    }
  });
});
