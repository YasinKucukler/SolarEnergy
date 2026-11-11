#!/usr/bin/env node
/**
 * İçerik Yayınlama Betiği — admin panelinden indirilen site-content.json'u siteye uygular
 * ====================================================================================
 *
 * KULLANIM:
 *   npm run content -- "C:\Users\...\Downloads\site-content.json"
 *   npm run content -- dosya.json --dry     (sadece ne değişeceğini gösterir, yazmaz)
 *   npm run content                         (data/site-content.json'u yeniden uygular)
 *
 * NE YAPAR:
 * 1. Yeni proje görsellerini (panelde yüklenen, JSON içinde gömülü) img/projeler/ altına yazar
 * 2. Kök dizindeki *.html dosyalarında telefon, e-posta, Instagram, sosyal linkler,
 *    harita konumu, Formspree ID, ana sayfa sayaçları ve proje kartlarını günceller
 * 3. Yeni içeriği data/site-content.json olarak kaydeder (bir sonraki çalıştırmanın referansı)
 *
 * NEDEN BÖYLE: Site statik kalır, içerik HTML'in içinde olur — çalışma zamanında ek istek yok,
 * arama motorları her şeyi doğrudan görür.
 *
 * Telefon / e-posta / Instagram "eski değer → yeni değer" olarak değiştirilir; eski değer
 * data/site-content.json'dan okunur. HTML'i elle değiştirdiyseniz önce o dosyayı da güncelleyin.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'data', 'site-content.json');
const IMG_DIR = path.join(ROOT, 'img', 'projeler');

const CATEGORIES = {
  'gunes-enerjisi': { cls: 'solar', fallbackIcon: 'fa-solar-panel' },
  'kamera': { cls: 'camera', fallbackIcon: 'fa-video' },
  'muhendislik': { cls: 'engineering', fallbackIcon: 'fa-cube' }
};
const ALLOWED_ICONS = /^fa-[a-z0-9-]+$/;

/* ---- Argümanlar ---- */
const args = process.argv.slice(2);
const dryRun = args.includes('--dry');
const inputArg = args.find((a) => !a.startsWith('--'));

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
  } catch (e) {
    fail(`${file} okunamadı: ${e.message}`);
  }
}

function fail(msg) {
  console.error(`\n✖ ${msg}\n`);
  process.exit(1);
}

const oldContent = readJson(DATA_FILE);
const newContent = inputArg ? readJson(path.resolve(inputArg)) : JSON.parse(JSON.stringify(oldContent));

/* ---- Doğrulama ---- */
function validate(c) {
  const errs = [];
  if (!c || typeof c !== 'object') return ['JSON nesnesi değil'];
  if (!c.contact) errs.push('contact alanı yok');
  else {
    ['phone1', 'phone2'].forEach((k) => {
      if (c.contact[k] && !/^\+90\d{10}$/.test(c.contact[k])) errs.push(`contact.${k} +90XXXXXXXXXX biçiminde olmalı`);
    });
    if (c.contact.email && !/^[^\s@"<>]+@[^\s@"<>]+\.[^\s@"<>]+$/.test(c.contact.email)) errs.push('contact.email geçersiz');
    if (c.contact.instagram && !/^[A-Za-z0-9._]+$/.test(c.contact.instagram)) errs.push('contact.instagram yalnızca kullanıcı adı olmalı');
    ['mapsLat', 'mapsLng'].forEach((k) => {
      if (c.contact[k] && !/^-?\d{1,3}(\.\d+)?$/.test(String(c.contact[k]))) errs.push(`contact.${k} sayı olmalı`);
    });
  }
  if (c.formspreeId && !/^[A-Za-z0-9]+$/.test(c.formspreeId)) errs.push('formspreeId yalnızca harf/rakam olmalı');
  if (!Array.isArray(c.stats) || c.stats.length !== 4) errs.push('stats 4 elemanlı olmalı');
  if (!Array.isArray(c.projects)) errs.push('projects dizi olmalı');
  else c.projects.forEach((p, i) => {
    if (!CATEGORIES[p.category]) errs.push(`projects[${i}].category geçersiz`);
    if (!p.id || !/^[a-z0-9-]+$/i.test(p.id)) errs.push(`projects[${i}].id geçersiz`);
    if (p.icon && !ALLOWED_ICONS.test(p.icon)) errs.push(`projects[${i}].icon geçersiz`);
    if (p.image && !/^img\/projeler\/[a-z0-9-]+\.(jpg|jpeg|png|webp)$/i.test(p.image)) errs.push(`projects[${i}].image yolu geçersiz`);
  });
  return errs;
}
const errors = validate(newContent);
if (errors.length) fail('İçerik dosyasında hatalar var:\n  - ' + errors.join('\n  - '));

/* ---- Yardımcılar ---- */
const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** +905436194898 → +90 (543) 619 48 98 */
function displayPhone(e164) {
  const d = e164.replace(/\D/g, '').slice(2);
  return `+90 (${d.slice(0, 3)}) ${d.slice(3, 6)} ${d.slice(6, 8)} ${d.slice(8, 10)}`;
}

const report = [];
function note(file, what, n) {
  if (n) report.push(`  ${file.padEnd(26)} ${what} (${n})`);
}

/** Tüm eşleşmeleri değiştirir, kaç tane değiştiğini döner */
function replaceAll(html, pattern, replacement) {
  let n = 0;
  const out = html.replace(pattern, (...m) => {
    n++;
    return typeof replacement === 'function' ? replacement(...m) : replacement;
  });
  return [out, n];
}

/* ---- 1. Görseller ---- */
if (!dryRun && !fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR, { recursive: true });
newContent.projects.forEach((p) => {
  if (!p.imageData) return;
  const m = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(p.imageData);
  if (!m) fail(`"${p.title}" projesinin görsel verisi bozuk`);
  const ext = m[1] === 'jpeg' ? 'jpg' : m[1];
  const rel = `img/projeler/${p.id}.${ext}`;
  if (!dryRun) fs.writeFileSync(path.join(ROOT, rel), Buffer.from(m[2], 'base64'));
  report.push(`  ${rel.padEnd(26)} görsel yazıldı`);
  p.image = rel;
  delete p.imageData;
});

/* ---- 2. Proje kartları ---- */
function renderProjects(category) {
  const cat = CATEGORIES[category];
  const items = newContent.projects.filter((p) => p.category === category);
  const pad = '            ';
  const cards = items.map((p, i) => {
    const icon = ALLOWED_ICONS.test(p.icon || '') ? p.icon : cat.fallbackIcon;
    const visual = p.image
      ? `<img src="${esc(p.image)}" alt="${esc(p.title)}" width="800" height="533" loading="lazy" decoding="async">`
      : `<i class="fas ${icon}" aria-hidden="true"></i>`;
    const tag = p.tag ? `\n${pad}    <span class="project-card__tag"><i class="fas fa-tag"></i> ${esc(p.tag)}</span>` : '';
    const desc = p.desc ? `\n${pad}    <p class="project-card__desc">${esc(p.desc)}</p>` : '';
    return [
      `${pad}<div class="project-card" data-animate="fade-up" data-delay="${((i % 3) + 1) * 100}">`,
      `${pad}  <div class="project-card__image project-card__image--${cat.cls}">`,
      `${pad}    ${visual}`,
      `${pad}  </div>`,
      `${pad}  <div class="project-card__body">`,
      `${pad}    <h3 class="project-card__title">${esc(p.title)}</h3>${desc}${tag}`,
      `${pad}  </div>`,
      `${pad}</div>`
    ].join('\n');
  });
  return '\n\n' + cards.join('\n\n') + (cards.length ? '\n\n' : '') + pad;
}

/* ---- 3. HTML dosyalarını güncelle ---- */
const oc = oldContent.contact;
const nc = newContent.contact;
const seenProjectMarkers = new Set();

const htmlFiles = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'));
htmlFiles.forEach((file) => {
  const full = path.join(ROOT, file);
  const before = fs.readFileSync(full, 'utf8');
  let html = before;
  let n;

  /* Telefonlar — görünen biçim, tel:/JSON-LD (+90...) ve wa.me (90...) */
  ['phone1', 'phone2'].forEach((k) => {
    if (!oc[k] || !nc[k] || oc[k] === nc[k]) return;
    [html, n] = replaceAll(html, new RegExp(reEsc(displayPhone(oc[k])), 'g'), displayPhone(nc[k]));
    let total = n;
    [html, n] = replaceAll(html, new RegExp(reEsc(oc[k]), 'g'), nc[k]);
    total += n;
    [html, n] = replaceAll(html, new RegExp('wa\\.me/' + reEsc(oc[k].slice(1)), 'g'), 'wa.me/' + nc[k].slice(1));
    note(file, `telefon ${k}`, total + n);
  });

  /* E-posta */
  if (oc.email && nc.email && oc.email !== nc.email) {
    [html, n] = replaceAll(html, new RegExp(reEsc(oc.email), 'g'), nc.email);
    note(file, 'e-posta', n);
  }

  /* Instagram — URL ve @kullanıcı */
  if (oc.instagram && nc.instagram && oc.instagram !== nc.instagram) {
    [html, n] = replaceAll(html, new RegExp('instagram\\.com/' + reEsc(oc.instagram) + '/', 'g'), `instagram.com/${nc.instagram}/`);
    let total = n;
    [html, n] = replaceAll(html, new RegExp('@' + reEsc(oc.instagram) + '(?![A-Za-z0-9._])', 'g'), '@' + nc.instagram);
    note(file, 'instagram', total + n);
  }

  /* Facebook / LinkedIn / YouTube — footer ikonları (boşsa "#") */
  ['Facebook', 'LinkedIn', 'YouTube'].forEach((label) => {
    const url = (nc[label.toLowerCase()] || '').trim();
    const safe = /^https:\/\/[^\s"<>]+$/.test(url) ? url : '';
    const tag = safe
      ? `<a href="${esc(safe)}" class="footer__social-link" aria-label="${label}" target="_blank" rel="noopener">`
      : `<a href="#" class="footer__social-link" aria-label="${label}">`;
    const re = new RegExp(`<a href="[^"]*" class="footer__social-link" aria-label="${label}"[^>]*>`, 'g');
    const prev = html;
    [html] = replaceAll(html, re, tag);
    if (prev !== html) note(file, label.toLowerCase(), 1);
  });

  /* Harita konum butonu */
  {
    const href = nc.mapsLat && nc.mapsLng
      ? `https://www.google.com/maps?q=${nc.mapsLat},${nc.mapsLng}`
      : 'https://www.google.com/maps?q=ENLEM,BOYLAM';
    const prev = html;
    [html] = replaceAll(html, /<a href="[^"]*"( class="floating-btn floating-btn--location")/g, (m, cls) => `<a href="${href}"${cls}`);
    if (prev !== html) note(file, 'harita konumu', 1);
  }

  /* Formspree */
  if (newContent.formspreeId) {
    const prev = html;
    [html] = replaceAll(html, /action="https:\/\/formspree\.io\/f\/[^"]*"/g, `action="https://formspree.io/f/${newContent.formspreeId}"`);
    if (prev !== html) note(file, 'formspree ID', 1);
  }

  /* Ana sayfa sayaçları — stats bölümündeki sırayla */
  html = html.replace(/(<section class="section stats">)([\s\S]*?)(<\/section>)/, (m, open, body, close) => {
    let ci = 0;
    let li = 0;
    const prev = body;
    body = body.replace(/<span class="counter" data-target="[^"]*" data-suffix="[^"]*">/g, (s) => {
      const st = newContent.stats[ci++];
      return st ? `<span class="counter" data-target="${Number(st.value) || 0}" data-suffix="${esc(st.suffix)}">` : s;
    });
    body = body.replace(/<div class="stat__label">[^<]*<\/div>/g, (s) => {
      const st = newContent.stats[li++];
      return st ? `<div class="stat__label">${esc(st.label)}</div>` : s;
    });
    if (prev !== body) note(file, 'sayaçlar', 1);
    return open + body + close;
  });

  /* Proje kartları — <!-- cms:projects:KATEGORI:start --> ... <!-- cms:projects:KATEGORI:end --> */
  html = html.replace(
    /(<!-- cms:projects:([a-z-]+):start[^>]*-->)([\s\S]*?)(<!-- cms:projects:\2:end -->)/g,
    (m, start, cat, body, end) => {
      if (!CATEGORIES[cat]) return m;
      seenProjectMarkers.add(cat);
      const eol = before.includes('\r\n') ? '\r\n' : '\n';
      const next = renderProjects(cat).replace(/\n/g, eol);
      if (next !== body) note(file, `projeler (${cat})`, newContent.projects.filter((p) => p.category === cat).length);
      return start + next + end;
    }
  );

  if (html !== before && !dryRun) fs.writeFileSync(full, html, 'utf8');
});

/* Sitede galerisi olmayan kategorilere proje girilmişse uyar */
const orphan = Object.keys(CATEGORIES).filter(
  (c) => !seenProjectMarkers.has(c) && newContent.projects.some((p) => p.category === c)
);

/* ---- 4. Yeni içeriği referans olarak kaydet ---- */
if (!dryRun) fs.writeFileSync(DATA_FILE, JSON.stringify(newContent, null, 2) + '\n', 'utf8');

/* ---- Rapor ---- */
console.log(dryRun ? '\nDeneme çalıştırması — hiçbir dosya yazılmadı.\n' : '\nİçerik uygulandı.\n');
console.log(report.length ? report.join('\n') : '  Değişiklik yok.');
if (orphan.length) {
  console.log(`\n⚠ Şu kategorilerde proje var ama sitede galeri bölümü yok: ${orphan.join(', ')}`);
  console.log('  Bu projeler panelde saklanır, sitede görünmez.');
}
console.log('');
