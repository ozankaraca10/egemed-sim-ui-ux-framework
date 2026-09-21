# 06 — QA / Kabul Testleri

Bu belge, Pulse'ta `qa/mode_flow_audit.mjs` (Playwright, Tur 1-3 kabul testleri, 21 Eylül
2026 durumu — 18/18 PASS) betiğinden **genelleştirilmiş** bir kabul listesidir. Her ürün
kendi test betiğini bu listeye göre yazar; test kimlikleri (F1, G3, H2 vb.) Pulse'taki
orijinal kodlarla referans kolaylığı için korunmuştur.

Kaynak: `reference/pulse/mode-flow-screens/report.json` (18/18 PASS kaydı) ve
`reference/pulse/mode-flow-screens/*.png` (kanıt ekran görüntüleri).

---

## 1. Genel kurulum kalıbı

```js
import {chromium} from '.../playwright/index.mjs';
const browser = await chromium.launch({headless: true});
// Açılış tam ekran önerisi testleri BOZMASIN diye bayrağı baştan kapat:
await context.addInitScript(() => localStorage.setItem('<urun>.fsPromptDone', '1'));
```

**Neden:** Açılış popup'ı (docs/04 §1.3) her testin başında modal açıp `#startSimulator`
tıklamasını engeller; testler için bu popup önceden bastırılır (yalnız popup'ın KENDİSİNİ
test eden senaryo — bkz. H5 — bu bayrağı bilerek AÇIK bırakır).

---

## 2. Kilit/gönderim testleri (F1) — "kilit ≠ öneri"

- Hiç ön koşul tamamlanmadan Uygulama moduna girip bir madde gönder → gönderim BAŞARILI,
  geri bildirim görünür (kilit gönderim yolunu ENGELLEMEZ).
- Aynı koşulda Değerlendirme modunda bir madde gönder → gönderim BAŞARILI.

**Doğrular:** docs/03-mod-akisi-ve-pedagoji.md §1.

## 3. Otomatik değerlendirme + sonuç geçişi (F6, F8)

- 10 soruyu sırayla gönder ("Sonraki soru →" ile ilerleyerek) → 10. gönderimde OTOMATİK
  `activeView==='results'` olmalı, ekstra tıklama GEREKMEMELİ.
- Sonuç ekranında "Tekrar dene" → Değerlendirme görünümüne döner, sayfa 0'a sıfırlanır.

**Doğrular:** docs/03 §6, docs/02-ekranlar.md §6.

## 4. Kısayol sızıntısı (F4)

- Değerlendirme modundayken `1` tuşuna bas → görünüm DEĞİŞMEMELİ (`activeView` hâlâ
  `quiz`).

**Doğrular:** docs/03 §4(a), docs/04 §2.

## 5. Örneklem onay dialogu (F5)

- En az bir madde gönderildikten sonra "Yeni örneklem" → onay dialogu AÇILMALI; onaylayınca
  oturum kimliği değişir, sayaç 0'a döner, tüm gönderimler `false` olur.
- Hiç dokunulmamış (taze) bir oturumda "yeniden başlat" → dialog AÇILMAMALI, doğrudan çalışır.

**Doğrular:** docs/03 §5, `snippets/requestResample.js`.

## 6. İlerleme çubuğu yüzdesi (F7)

- Oturum boyutunun (ör. 10'un) 3'ü gönderildiğinde header ilerleme çubuğu genişliği
  `~%30` OLMALI (±2 tolerans) — kesir/yüzde birim hatası (bkz. `snippets/progress-percent.js`)
  yakalanır.

**Doğrular:** `snippets/progress-percent.js`.

## 7. Tam ekran kökü (F9)

- Bir düğmeye (ör. rhythm-tab) tıklayıp ODAKLI hâldeyken `F` tuşuna bas → tam ekran
  AÇILMALI ve `document.fullscreenElement === document.documentElement` OLMALI.
  (Not: headless ortamda `requestFullscreen` bazen engellenir — bu durumda test,
  `toggleFullscreen`'in ÇAĞRILDIĞINI bir "özellik kullanıldı" sayaç artışıyla doğrular.)

**Doğrular:** docs/04 §1.1, §1.4.

## 8. Footer kenardan kenara (F10)

- 1366×768 VE 390×844'te: footer'ın `left≈0`, `right≈innerWidth`,
  `document.documentElement.scrollWidth <= innerWidth+1` (yatay taşma YOK).

**Doğrular:** `components/footer.html`.

## 9. İnceleme sahnesi zoom + karşılaştırma (G1, G2)

- İnceleme sahnesinde ölçülen piksel/saniye oranı, eski (zoomsuz) değerin **~1,25 katı**
  OLMALI (`±0.02` tolerans) — sabit sahne büyütmesi doğrulanır.
- "Normalle karşılaştır" açıkken kanvasta MAVİ piksel bulunmalı (referans çizildi) VE
  gösterge çizgisinin `border-top-style` değeri `dashed` OLMALI.

**Doğrular:** docs/04 §3, `components/compare-key.html`.

## 10. Vaka kanvasında referans aynı tabanda (G3)

- Karşılaştırma açıkken normal-dışı bir vakada: kanvasın ALT %25'lik diliminde MAVİ piksel
  **OLMAMALI** (referans çizgi kaymışsa oraya taşar) — ofsetsiz taban doğrulanır.

**Doğrular:** `components/compare-key.html`.

## 11. Cevap sızıntısı regex denetimi (G4)

- Tüm madde havuzunu (ör. 400 madde) tarayıcı dışı bir `vm` bağlamında yükle; `ddx_*`/
  `rhythmClass_*` (tanı ayırt edici) türündeki maddelerin stem'inde
  `/Monitörde|izleniyor|dalga|QRS|kompleks|testere|kaotik|geniş|dar\b/i` gibi bulgu-tarif
  eden bir desen **BULUNMAMALI** (nötr "kayıt aşağıda" cümlesi hariç).

**Doğrular:** docs/03 §3.

## 12. Vaka/soru zoom + kaliper tutarlılığı (H1)

- Başlangıç zoom etiketi `1×`. Kaliperle bir ölçüm al (`Δt1`), zoom'u 2 basamak artır
  (`1,5×`), AYNI piksel noktalarına yeniden tıkla (`Δt2`) → `Δt1/Δt2 ≈ 1,5` (±0.15
  tolerans) — kaliperin zoom çarpanını DOĞRU uyguladığı doğrulanır.
- 2×'te "+" düğmesi `disabled` OLMALI (sınırda görsel geri bildirim).
- Soru sahnesinde de aynı zoom grubu var VE çalışıyor.

**Doğrular:** `components/zoom-group.html`.

## 13. Üst çubuk logosu + slogan (H2, H3)

- `#brandHome` içindeki marka ikonunun `computed filter` değeri `invert` İÇERMELİ.
- 1366px'te `.eg-brand-tag` GÖRÜNÜR, 390px'te GİZLİ olmalı.

**Doğrular:** docs/01-tasarim-sistemi.md §5.

## 14. Terim tutarlılığı (H4)

- Header ilerleme metni ürünün GÜNCEL öğe terimini İÇERMELİ (Pulse: "EKG sonucu") ve
  eski/terk edilmiş terimi (Pulse: "örüntü") İÇERMEMELİ.

**Doğrular:** docs/07-uygulama-kontrol-listesi.md (terim geçişi kontrolü).

## 15. Açılış tam ekran önerisi (H5, 4 alt test)

- Bayrak yokken landing'de popup `open` OLMALI.
- "Böyle devam et" → dialog kapanır (bayrak YAZILMAZ, bir dahaki açılışta tekrar sorar).
- "Tekrar sorma" işaretleyip kapat → bayrak `localStorage`'a yazılır; sayfa yenilenince
  popup BİR DAHA AÇILMAMALI.
- "Tam ekrana geç" → gerçek tam ekrana geçer (`document.fullscreenElement ===
  document.documentElement`), dialog kapanır.

**Doğrular:** docs/04 §1.3, `snippets/fullscreenPrompt.js`.

---

## 16. Build tekrarlanabilirliği

Paketleme betiği (Pulse: `qa/build.py`) aynı kaynak kümesinden HER ÇALIŞTIRMADA **bayt
bazında özdeş** çıktı üretmelidir (sabit ZIP giriş tarihleri, sabit izinler, sabit
sıkıştırma seviyesi, kaynak dosyalarının ad sırasına göre işlenmesi). Kaynak SHA-256 özet
kümesi ve çıktı hash'leri `BUILD.md`'ye tarihli olarak kaydedilir (bkz. Pulse'ta "Son teslim
kaydı" / "Önceki kayıt" zinciri).

**Neden:** Tekrarlanabilir derleme, "aynı kaynaktan aynı paket" garantisi verir — denetim
ve regresyon takibi için kritik (hangi görsel/davranış değişikliğinin hangi kaynak
değişikliğinden geldiği izlenebilir kalır).

---

## 17. Ekran boyutları (görsel kabul)

Her ürün, her önemli ekranın (landing, mod seçimi, öğretici, uygulama madde/geri
bildirim/oturum sonu, değerlendirme, sonuçlar, hakkında) ekran görüntüsünü şu genişliklerde
almalıdır: **390×844** (mobil), **768×1024** (tablet), **1366×768** (masaüstü). Her
görüntüde yatay taşma YOKTUR (`document.documentElement.scrollWidth <= innerWidth`).

---

## 18. İçerik QC — 400 madde, 5 seçenek, harf dağılımı, vm kontrolleri

Madde bankası büyüklüğüne (Pulse: 200 vaka + 200 değerlendirme = 400 madde, her biri 5
seçenekli) bakılmaksızın, her ürün TARAYICI AÇMADAN çalışan bir içerik doğrulama betiği
bulundurmalıdır. Bu betik `curriculum.js` (veya eşdeğeri) dosyasını bir Node `vm` bağlamında
(`vm.createContext`/`vm.runInContext`) yükler ve şunları doğrular:

- Her havuzda (vaka/değerlendirme) madde sayısı beklenenle eşleşir VE tüm madde metinleri
  (stem+soru) birbirinden FARKLIDIR (`Set` boyutu = madde sayısı — kopya madde yok).
- Her havuzda mod:karar (`mode:decisionId`) kombinasyonu da benzersizdir (aynı klinik
  senaryonun tekrar edip etmediği kontrol edilir).
- Doğru şıkkın (5 seçenek → A–E) pozisyon dağılımı havuz genelinde YAKLAŞıK EŞİTTİR (400
  maddede 5 pozisyon × 80 = her pozisyonda ~80, veya alt havuz başına 200/5=40) — docs/03 §2'deki
  "seçenek permütasyonu" kuralının nicel kanıtı budur; tek bir pozisyonun aşırı sıklıkta
  doğru çıkması, permütasyon algoritmasında bir hata olduğunu gösterir.
- Ritim/tanı (ayırt edici) maddelerin stem'inde bulgu-tarif eden bir desen YOKTUR (bkz. §11
  G4 — bu kontrol aynı `vm` yüklemesini paylaşır).

**Neden `vm` ve neden ayrı bir katman:** Tarayıcı açıp Playwright ile 400 madde gezmek
YAVAŞTIR ve DOM/render hatalarıyla içerik hatalarını karıştırır. `vm` katmanı saniyeler
içinde çalışır, yalnız VERİ bütünlüğüne bakar; tarayıcı testleri (F/G/H serisi) ayrıca
etkileşim/görsel katmanı doğrular. İkisi birbirinin YERİNE geçmez.

**Pulse'ta nerede:** `qa/independent_content.mjs` "T04-unique-content-and-position-distribution"
— `vm.createContext(w)`, `vm.runInContext(...,'model.js')`/`'curriculum.js'`; her havuz için
`{count,exactText,distinctModeDecision,correctPositions}` hesaplayıp `count===200 &&
exactText===200 && distinctModeDecision===200 && correctPositions.every(n=>n===40)` iddiasını
kontrol eder. `qa/mode_flow_audit.mjs` "G4-answer-leak-regex" aynı `vm` yüklemesini kullanır.

### QC dışa aktarma paketi

QC ekibinin (dış kalite kontrol yapan kişiler) madde bankasını KOD OKUMADAN, kendi
formatlarında (tablo + kayıt görüntüsü) inceleyebilmesi için, `cardai/`i (veya eşdeğerini)
yalnız OKUYAN, hiçbir kaynağı DEĞİŞTİRMEYEN bir dışa aktarma betiği bulunur. Betik her madde
için: A–E seçenek metinleri, doğru harf + doğru metin, ve maddenin sentetik kaydının statik
bir görüntüsünü (ör. `<canvas>` render'ının PNG'si) üretir; tek komutla tekrar üretilebilir.

**Neden:** Bir QC raporu genelde xlsx/docx formatında teslim edilir ve düzeltmeler de aynı
formatta beklenir; QC ekibinin koda bakıp doğru şıkkı/derivasyonu teyit etmesini BEKLEMEK
gerçekçi değildir. Dışa aktarma paketi, "kod neyi üretiyor" ile "QC ekibi neyi onaylıyor"
arasındaki farkı kapatır — düzeltme sonrası paket YENİDEN üretilip QC ekibine geri gönderilir.

**Pulse'ta nerede:** `qa/export_items.mjs` — `cardai/` içeriğini OKUR, `cardai/`e YAZMAZ;
çıktı `qa/evidence/export/*` (madde tablosu: `letter(i)=String.fromCharCode(65+i)` ile A–E
etiketleme, her maddenin sentetik EKG'sinin ekran görüntüsü `qa/evidence/export/ecg/`).
Yeniden üretim: `node qa/export_items.mjs`.

---

## 19. Tıklama hedefi kararlılığı kabul testi

Bkz. docs/04-etkilesim-ve-erisilebilirlik.md §9 (kural ve gerekçe) ve
`snippets/stableRender.js` (render kalıbı). Kabul testi kalıbı: her görünümdeki (landing, mod
seçimi, öğretici, sim, uygulama madde/geri bildirim/oturum sonu, değerlendirme, sonuçlar,
hakkında, dialoglar) görünür VE etkin (disabled olmayan) her tıklanabilir öğe için:

1. Öğeyi görünür alana kaydır, üzerine `mousedown` uygula.
2. **300 ms bekle** (ürünün en kısa periyodik render döngüsünden — Pulse'ta 250 ms —
   UZUN olmalı; döngünün test sırasında en az bir kez çalışmasını garanti eder).
3. İmleci öğenin dışına taşı, sonra geri getirip `mouseup` uygula.
4. Doğrula: (a) `mousedown` anında işaretlenen DOM düğümü hâlâ `isConnected===true`
   (DOM'dan sökülüp yeniden eklenmedi), (b) `mouseup` konumundaki `elementFromPoint`
   sonucu AYNI düğümü (veya onun içindeki bir alt öğeyi) hedefliyor.

Mod seçim kartları gibi periyodik güncellenen ekranlarda bu senaryo ardışık **20 kez**
denenir; kabul eşiği **20/20**dir (tek bir kayıp bile FAIL sayılır — aralıklı/nadir bir
hata kullanıcı için hâlâ gerçek bir hatadır).

**Pulse'ta nerede:** Tanı/geliştirme betiği `scratchpad/click_stability.mjs` (Playwright,
her görünümü gezip tüm düğme/etiket/chip için bas-bekle-bırak uygular, DOM bağlantısı ve
hedef eşleşmesi kaybolan öğeleri raporlar). Ürün-bağımsız test şablonu:
`tests/click-stability.template.mjs`.
