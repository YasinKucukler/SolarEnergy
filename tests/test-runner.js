// ============================================================================
// SolarEnerji Test Runner
// ============================================================================
// Kullanim:
//   node test-runner.js          → Tum testleri calistir
//   node test-runner.js setup    → Bagimliliklari kur
//   node test-runner.js headed   → Tarayici gorunur sekilde calistir
//   node test-runner.js ui       → Playwright UI modunda ac
//   node test-runner.js report   → Son test raporunu ac
//   node test-runner.js desktop  → Sadece masaustu testleri
//   node test-runner.js mobile   → Sadece mobil testleri
// ============================================================================

const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = __dirname;
const args = process.argv.slice(2);
const command = args[0] || 'run';

// Renk kodlari
const C = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(msg, color = '') {
  console.log(`${color}${msg}${C.reset}`);
}

function header() {
  log('');
  log('  ============================================', C.cyan);
  log('    SolarEnerji — Test Runner', C.cyan + C.bold);
  log('  ============================================', C.cyan);
  log('');
}

function checkDependencies() {
  const nodeModules = path.join(ROOT, 'node_modules');
  const pwInstalled = path.join(nodeModules, '@playwright', 'test');
  if (!fs.existsSync(pwInstalled)) {
    log('  Bagimliliklar bulunamadi. Kuruluyor...', C.yellow);
    run('npm install');
    log('  Playwright tarayicilari indiriliyor...', C.yellow);
    run('npx playwright install chromium');
    log('  Kurulum tamamlandi!', C.green);
    log('');
  }
}

function run(cmd, opts = {}) {
  try {
    execSync(cmd, { cwd: ROOT, stdio: 'inherit', ...opts });
  } catch (e) {
    if (!opts.ignoreError) {
      process.exit(e.status || 1);
    }
  }
}

function runTests(extraArgs = '') {
  checkDependencies();
  log(`  Testler calistiriliyor...`, C.cyan);
  log('');
  run(`npx playwright test ${extraArgs}`);
}

// ============================================================================
// Komutlar
// ============================================================================

header();

switch (command) {
  case 'setup':
    log('  Bagimliliklar kuruluyor...', C.yellow);
    run('npm install');
    log('  Playwright tarayicilari kuruluyor...', C.yellow);
    run('npx playwright install chromium');
    log('');
    log('  Kurulum tamamlandi!', C.green + C.bold);
    log('  Testleri calistirmak icin: node test-runner.js', C.cyan);
    log('');
    break;

  case 'run':
    runTests('');
    break;

  case 'headed':
    runTests('--headed');
    break;

  case 'ui':
    checkDependencies();
    log('  Playwright UI aciliyor...', C.cyan);
    run('npx playwright test --ui');
    break;

  case 'report':
    log('  Son test raporu aciliyor...', C.cyan);
    run('npx playwright show-report');
    break;

  case 'desktop':
    runTests('--project=desktop-chrome');
    break;

  case 'mobile':
    runTests('--project=mobile');
    break;

  default:
    log('  Bilinmeyen komut: ' + command, C.red);
    log('');
    log('  Kullanim:', C.bold);
    log('    node test-runner.js          Tum testleri calistir');
    log('    node test-runner.js setup    Bagimliliklari kur');
    log('    node test-runner.js headed   Tarayici ile calistir');
    log('    node test-runner.js ui       UI modunda ac');
    log('    node test-runner.js report   Raporu goruntule');
    log('    node test-runner.js desktop  Sadece masaustu');
    log('    node test-runner.js mobile   Sadece mobil');
    log('');
    break;
}
