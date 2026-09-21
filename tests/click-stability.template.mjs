// EGEMED SIM FRAMEWORK — kabul testi şablonu: Tıklama hedefi kararlılığı
// ==========================================================================
// Kural ve gerekçe: docs/04-etkilesim-ve-erisilebilirlik.md §9.
// Kabul kriteri: docs/06-qa-kabul.md §19.
// Kaynak: Pulse'taki tanı betiği (`scratchpad/click_stability.mjs`), bu şablonda
// ürün-bağımsızlaştırılmıştır (Pulse'a özgü görünüm adları/seçiciler
// {{...}} yer tutucularıyla değiştirildi; Playwright'a bağımlılık aynı kaldı).
//
// NE YAPAR
// --------
// Uygulamanın her önemli görünümünü sırayla açar; o görünümdeki HER görünür VE
// etkin (disabled olmayan) tıklanabilir öğe için "yavaş tıklama" simüle eder:
// bas (mousedown) → 300 ms bekle (ürünün en kısa periyodik render döngüsünden
// UZUN olmalı — bkz. {{PERIYODIK_DONGU_MS}}) → imleci dışarı taşı → geri getirip
// bırak (mouseup). Bekleme sırasında düğmenin DOM'dan sökülüp yeniden
// eklenmediğini (`isConnected`) VE `mouseup` anındaki `elementFromPoint`
// sonucunun hâlâ AYNI öğeyi hedeflediğini doğrular. Bir görünümde kaybolan
// (unstable) öğe varsa, o görünüm adı + öğe kimliği/sınıfı raporlanır.
//
// NASIL UYARLANIR
// ----------------
// 1. {{BASE_URL}} ve {{FS_PROMPT_STORAGE_KEY}} (açılış tam ekran önerisi varsa)
//    ürünün kendi değerleriyle değiştirin.
// 2. {{VIEWS}} listesini ürünün gerçek görünüm adlarıyla (showView eşdeğeri)
//    doldurun; her görünüm için varsa özel bir "hazırlık" adımı (ör. bir maddeyi
//    gönderip geri bildirim durumuna geçmek) `prepare` alanına yazın.
// 3. Periyodik render döngüsü {{PERIYODIK_DONGU_MS}}'den KISAYSA bekleme süresini
//    (şu an 300 ms) o değerin üstüne çıkarın — döngünün test sırasında en az bir
//    kez çalışması GEREKİR (kararlılık kanıtı ancak o zaman anlamlıdır).
// 4. Mod seçimi gibi periyodik güncellenen kritik ekranlarda `repeat` alanını
//    20'ye çıkarın (kabul eşiği 20/20 — bkz. docs/06 §19).

import {chromium} from 'playwright';

const BASE_URL = '{{BASE_URL}}'; // ör. 'http://127.0.0.1:8765/cardai/'
const CLICKABLE_SELECTOR = 'button, a, label.opt, .rhythm-tab, .lead-chip, input[type=checkbox]';
const SETTLE_MS = 300; // {{PERIYODIK_DONGU_MS}}'den (ör. 250 ms) UZUN tutulmalı
const REPEAT = {default: 1, modes: 20}; // periyodik güncellenen görünümler için 20 tekrar

// {{VIEWS}}: her biri {name, enter: async (page) => {...}, repeat?: number}
const VIEWS = [
  {name: 'landing', enter: async () => {}},
  {name: 'modes', enter: async (page) => page.evaluate((v) => window.{{CONTROLLER_GLOBAL}}.showView(v), 'modes'), repeat: REPEAT.modes},
  // Diğer görünümler (İnceleme/Uygulama/Değerlendirme/Sonuçlar/Hakkında/dialoglar)
  // ürünün kendi showView adlarıyla buraya eklenir.
];

async function probeView(page, {name, repeat = REPEAT.default}) {
  const results = {view: name, buttons: 0, unstable: []};
  for (let attempt = 0; attempt < repeat; attempt++) {
    const dialogOpen = await page.evaluate(() => !!document.querySelector('dialog[open]'));
    const selector = (dialogOpen ? 'dialog[open] ' : '') + CLICKABLE_SELECTOR;
    const handles = await page.$$(selector);
    for (const handle of handles) {
      const info = await handle.evaluate((el) => ({
        id: el.id || '',
        cls: String(el.className || ''),
        text: (el.textContent || '').trim().slice(0, 30),
        disabled: el.disabled,
        visible: !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length),
      }));
      if (info.disabled || !info.visible) continue;
      results.buttons++;
      await handle.evaluate((el) => {
        el.scrollIntoView({block: 'center', inline: 'center'});
        el.__probe = 1;
      });
      await page.waitForTimeout(60);
      const box = await handle.boundingBox();
      if (!box) continue;
      const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
      await page.mouse.move(cx, cy);
      await page.mouse.down();
      await page.waitForTimeout(SETTLE_MS); // döngünün en az bir kez çalışmasını bekle
      const outcome = await page.evaluate(({x, y}) => {
        const marked = [...document.querySelectorAll('*')].find((e) => e.__probe);
        const atPoint = document.elementFromPoint(x, y);
        const target = atPoint && atPoint.closest('button,a,label,.rhythm-tab,.lead-chip,input');
        return {connected: !!(marked && marked.isConnected), hit: !!(target && target.__probe)};
      }, {x: cx, y: cy});
      await page.mouse.move(2, 2);
      await page.mouse.up();
      await page.waitForTimeout(40);
      await page.evaluate(() => { for (const el of document.querySelectorAll('*')) delete el.__probe; });
      if (!outcome.connected || !outcome.hit) {
        results.unstable.push({...info, ...outcome, attempt});
      }
    }
  }
  return results;
}

async function run() {
  const browser = await chromium.launch();
  const context = await browser.newContext({viewport: {width: 1366, height: 768}});
  // Açılış tam ekran önerisi / diğer "ilk açılış" popup'larını baştan bastır
  // (bkz. docs/06-qa-kabul.md §1) — yalnız o popup'ı TEST EDEN senaryo bu adımı atlar.
  await context.addInitScript((key) => { try { localStorage.setItem(key, '1'); } catch {} }, '{{FS_PROMPT_STORAGE_KEY}}');
  const page = await context.newPage();
  await page.goto(BASE_URL);

  const allResults = [];
  for (const view of VIEWS) {
    await view.enter(page);
    await page.waitForTimeout(300);
    allResults.push(await probeView(page, view));
  }

  await browser.close();

  const unstableViews = allResults.filter((r) => r.unstable.length);
  for (const r of allResults) {
    console.log(r.view, 'buttons', r.buttons, 'unstable', r.unstable.length);
  }
  if (unstableViews.length) {
    console.log('\nFAIL — kararsız (kaybolan) tıklama hedefleri:', JSON.stringify(unstableViews, null, 1));
    process.exitCode = 1;
  } else {
    console.log('\nPASS — tüm görünümlerde tıklama hedefleri kararlı (20/20 dahil).');
  }
}

run();
