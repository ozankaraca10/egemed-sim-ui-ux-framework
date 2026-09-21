# 04 — Etkileşim ve Erişilebilirlik

Tam ekran, kısayol kapsamı, zoom, karşılaştırma çizimi, odak yönetimi, ARIA kalıpları,
44px dokunma hedefi ve 390px (mobil) davranışı.

---

## 1. Tam ekran

### 1.1 Kök: `document.documentElement`

**Kural:** Tam ekran isteği HER ZAMAN `document.documentElement` üzerinde yapılır; ürünün
kendi uygulama kök elemanı (`#appRoot` vb.) ÜZERİNDE DEĞİL.

**Neden:** Ürün landing ekranından uygulama ekranına (veya tersine) geçtiğinde farklı bir
DOM elemanı tam ekrana alınmışsa, tarayıcı geçişte tam ekrandan OTOMATİK ÇIKAR (kök elemanı
artık DOM'da "aktif" olmayabilir veya görünürlüğü değişir). `document.documentElement`'i
kök yapmak, bu geçişte tam ekranın KORUNMASINI sağlar — kullanıcı F'ye yeniden basmak
zorunda kalmaz. Bu değişiklik öncesinde tam ekran kökü `$('appRoot')` idi ve landing↔uygulama
geçişinde tam ekran sessizce kapanıyordu.

**Pulse'ta nerede:** `cardai/features.js toggleFullscreen()` —
`document.documentElement.requestFullscreen()`; `cardai/landing.js` — `enter()`/`showLanding()`
fonksiyonlarından `exitFullscreenIfAny()` çağrısı KALDIRILDI (artık geçişte tam ekrandan
çıkmaya gerek yok, çünkü kök zaten `documentElement`). Tam kod: `snippets/toggleFullscreen.js`.
Kabul testi: `qa/mode_flow_audit.mjs` "F9-fullscreen-root-via-f-key" —
`document.fullscreenElement === document.documentElement`.

### 1.2 Webkit fallback

Safari/iOS `requestFullscreen`/`fullscreenElement`/`exitFullscreen` yerine hâlâ
`webkitRequestFullscreen`/`webkitFullscreenElement`/`webkitExitFullscreen` kullanabilir.
Her API çifti (standart → webkit) sırayla denenir; her ikisi de yoksa kullanıcıya
`#uiNote` ile görünür bir bildirim verilir (sessizce başarısız OLUNMAZ).

**Pulse'ta nerede:** `cardai/features.js toggleFullscreen()`/`syncFullscreen()` —
`document.webkitFullscreenElement`/`webkitExitFullscreen`/`webkitRequestFullscreen`
fallback zinciri; `document.addEventListener('webkitfullscreenchange', syncFullscreen)`.

### 1.3 Açılış tam ekran önerisi

**Kural:** Landing'de, sayfa oturduktan kısa süre sonra bir kez "Tam ekran önerilir"
popup'ı gösterilir: **[Tam ekrana geç]** (gerçek tam ekrana geçirir) / **[Böyle devam et]**
(kapatır, bir dahaki açılışta tekrar sorar) / **"Tekrar sorma"** onay kutusu + kapat
(kalıcı olarak localStorage'a yazar). Bu tercih **SCORM/LMS kaydına (suspend_data)
YAZILMAZ** — yalnızca tarayıcı konforu.

**Neden:** bkz. `snippets/fullscreenPrompt.js` üst yorum bloğu. Özet: küçük pencerede
kullanım okunabilirliği düşürür; öneri zorunlu değil, tercih HER cihaz/tarayıcı için ayrı
hatırlanır (LMS kaydına karışmaz — SCORM kaydı içerik/ilerleme içindir, UI konforu değil).

**Pulse'ta nerede:** `cardai/landing.js` `FS_PROMPT_KEY`, `maybeShowFullscreenPrompt()`,
`setTimeout(maybeShowFullscreenPrompt,400)`; dialog `#fullscreenPrompt` (bkz.
`components/dialog.html`). Kabul testi: `qa/mode_flow_audit.mjs` "H5-*" (4 alt test:
görünürlük, "Böyle devam et" kapatma, "Tekrar sorma" kalıcılığı, "Tam ekrana geç" gerçek
tam ekrana geçirme).

### 1.4 F kısayolu düğme odağında da çalışır

**Kural:** `F` tuşu tam ekranı aç/kapatır; bu kısayol, odak bir `<button>` üzerindeyken
DE çalışmalıdır (yalnız form GİRİŞ alanları — `INPUT`/`SELECT`/`TEXTAREA` ve
`contentEditable` — kısayolları engeller).

**Neden:** Önceki davranışta klavye kısayol dinleyicisi `BUTTON` etiketini de
engelleme listesine alıyordu — kullanıcı bir düğmeye (ör. rhythm-tab) `Tab` ile
odaklandıktan sonra F'ye bastığında hiçbir şey olmuyordu; bu, "tam ekran her zaman F ile
açılır" beklentisini bozan tutarsız bir davranıştı. `BUTTON` engelleme listesinden
ÇIKARILDI.

**Pulse'ta nerede:** `cardai/features.js` global `keydown` dinleyicisi —
`['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName)||e.target.isContentEditable`
(eski liste `['INPUT','SELECT','TEXTAREA','BUTTON']` idi). Kabul testi:
`qa/mode_flow_audit.mjs` "F9-fullscreen-root-via-f-key" — bir `.rhythm-tab` düğmesine
tıklayıp odaklı hâldeyken `F` tuşuna basar, tam ekranın açıldığını doğrular.

---

## 2. Kısayol kapsamı

**Kural:** Sayısal (`1-9`) ve gezinme (`[`/`]`/ok tuşları/`c`) kısayolları YALNIZ ilgili
inceleme/oynatma görünümünde (`inSim`) çalışır. `F` (tam ekran) EVRENSELDİR — her görünümde
çalışır çünkü görüntüleme tercihine ait, madde/mod seçimine ait DEĞİLDİR.

**Neden:** bkz. docs/03-mod-akisi-ve-pedagoji.md §4(a) — Değerlendirme sorusundayken `1`
tuşuna basmanın İnceleme moduna geçmemesi hem kilit tutarlılığı hem de yanlışlık kaçış
önleme meselesidir.

**Pulse'ta nerede:** `cardai/features.js` keydown dinleyicisi — `inSim` kontrolü,
`if(k==='f'){toggleFullscreen();return;}if(!inSim)return;`. Kabul testi:
`qa/mode_flow_audit.mjs` "F4-keyboard-1-no-leak-in-quiz".

---

## 3. Zoom

İki AYRI zoom mekanizması karıştırılmamalıdır:

1. **İnceleme sahnesi** — sabit **1,25×** büyütme, KULLANICI KONTROLLÜ DEĞİL (oran korunur;
   taban çizgisi `ch*.6` olarak yeniden ayarlanmıştır — bkz. §4 aşağıda).
2. **Vaka/soru kanvası** — kullanıcı kontrollü basamaklı zoom: **1× / 1,25× / 1,5× / 2×**,
   kaliperle TUTARLI. Bkz. `components/zoom-group.html` (tam gerekçe + kod orada).

**Pulse'ta nerede:** `cardai/app.js` `ECG_ZOOM=1.25` (sahne), `ITEM_ZOOM_STEPS`/`itemZoom`
(madde kanvası).

---

## 4. Karşılaştırma çizimi

Bkz. `components/compare-key.html` — kesik (dashed) referans çizgi, aynı taban çizgisi
(ofsetsiz), gösterge ile çizgi stilinin eşleşmesi. Tam gerekçe ve kod o dosyada.

---

## 5. Odak yönetimi

- Her görünüm girişinde (`showView`), görünümün başlığına (`h1`, `tabindex="-1"`) odak
  taşınır — ekran okuyucu kullanıcısı yeni bağlamın başladığını anında bilir.
- Dialoglar native `showModal()` ile açılır — odak otomatik dialog içine kilitlenir,
  kapanınca tetikleyen elemana geri döner (ekstra kod GEREKMEZ, native davranış).
- Odak halkası her yerde belirgin: `:focus-visible{outline:3px solid var(--blue-500)}`.

**Pulse'ta nerede:** `cardai/app.js showView(view)` —
`heading?.setAttribute('tabindex','-1'); heading?.focus();`; `cardai/styles.css`
`button:focus-visible,a:focus-visible,...{outline:3px solid var(--blue-500)}`.

---

## 6. ARIA kalıpları

- Çoktan seçmeli madde: `<fieldset>`/`<legend>` + her seçenek `role="radio" aria-checked`
  (native `<input type=radio>` görsel olarak gizlenmiş DEĞİL — ikisi birlikte kullanılır,
  ok tuşu gezinmesi native radio-group davranışından gelir).
- İlerleme göstergeleri: `role="progressbar"` + `aria-valuemin/max/now` + `aria-label`.
- Geçici bildirimler (`#uiNote`, `#saveStatus`): `role="status"` (canlı bölge, kesintisiz
  duyurulur, odak ÇALMAZ).
- Tüm ikon-only düğmelerde `aria-label`.

**Pulse'ta nerede:** `cardai/app.js progress()` (`mark.setAttribute('role','progressbar')`
vb.); `cardai/index.html` `<span class="sr-status" id="uiNote" role="status" hidden>`.

---

## 7. 44px dokunma hedefi

Tüm tıklanabilir/dokunulabilir öğeler (seçenek etiketi, düğme, chip) EN AZ 44×44px
etkileşim alanına sahiptir — yalnız içindeki simge/metin değil, TÜM satır/etiket
tıklanabilir alan sayılır.

**Neden:** Mobil/tablet dokunma hedefi standardı (WCAG 2.5.5 AAA / Apple HIG); küçük
hedefler yanlışlıkla komşu öğeye dokunmayı artırır, özellikle uzun madde listelerinde.

**Pulse'ta nerede:** `cardai/styles.css` `.opt{min-height:44px}` (seçenek etiketleri).

---

## 8. 390px (mobil) davranışı

- Sıra: Olgu kartı (kısa) → sahne (`min(55dvh,420px)`) → yapışkan alt araç çubuğu
  (+ "Soruya git ↓") → soru kartı.
- Derivasyon/bölge chip'leri yatay kaydırılır (`overflow-x:auto`, `scroll-snap`).
- Header: `.eg-brand-tag` gizlenir (≤1024px), "Mod Değiştir"/tam ekran ikon-only
  (`hide-mobile` sınıfı ≤720px'te gizler, yerine marka bağlantısı mod değişimini üstlenir).
- Footer kademeli kısalır (bkz. `components/footer.html`) — HER genişlikte tek satır,
  yatay taşma YOK (`scrollWidth <= innerWidth`).

**Kabul testi:** `qa/mode_flow_audit.mjs` "F10-footer-edge-to-edge-390" — footer
`left===0`, `right===innerWidth`, `scrollWidth<=innerWidth+1`.
