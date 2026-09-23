# 07 — Uygulama Kontrol Listesi (Ausculta / Opaca için)

Bu şablonu Ausculta'ya veya Opaca'ya uygularken aşağıdaki listeyi SIRAYLA izleyin. Her
madde bir önceki dokümanlardan (`docs/01`–`docs/06`) bir kurala karşılık gelir; madde
başına ☐ kutusu, hangi belgeye bakılacağı ve Pulse'taki kaynak kısa referansı verilmiştir.

Notasyon: **[Opaca: belirlenecek]** işaretli yerler Opaca'nın öğe terimi netleşmeden
doldurulamaz — bu maddeler kullanıcı kararı bekler, tahmin/uydurma YAPILMAZ.

---

## Faz 0 — Keşif ve tasarım sistemi

- [ ] Ürünün mevcut token'larını (renk, radius, tipografi) envanterle; hangilerinin
      `tokens/family-tokens.css`'e eşleneceğini (köprü token yaklaşımı, bkz. docs/01 §5)
      belirle. **Eski token adlarını SİLME** — yeni aile token'larına EŞLE.
- [ ] `grep -oE "#[0-9a-fA-F]{3,6}" <ürün-css> | sort -u | wc -l` ≤ 40 ve hepsi `:root`'ta
      olacak şekilde renkleri merkezi hâle getir (docs/01 §1).
- [ ] Sabit px `font-size`/`border-radius` kalıntısı kalmadığını doğrula
      (`grep -n "font-size:[0-9]" ...`).
- [ ] Ürünün kendi "alan rengi" (varsa) ile UI kroma renklerini AYIR (docs/01 §1.2).
      Opaca için: `--opaca-field:[Opaca: belirlenecek]`.
- [ ] Yazı ölçeği aile standardına (14px gövde) indirilsin mi? — **kullanıcı kararı**
      gerektirir (docs/01 §7); tahmin etme, sor.

## Faz 1 — Kabuk: Header, Footer, Landing, Hakkında

- [ ] `components/topbar.html`'i uyarla: marka bloğu + ürün sloganı (`.eg-brand-tag`,
      ≤1024px gizli) + `#uiNote` bildirim bölgesi ekle.
- [ ] Üst çubuk logosunu `filter:brightness(0) invert(1)` ile beyaza çevir (docs/01 §5.1);
      footer'daki AYNI logoya bu filtreyi UYGULAMA.
- [ ] `components/footer.html`'i uyarla: kademeli kısalma breakpoint'leri + `.app>.eg-footer`
      negatif margin (kenardan kenara taşma, docs/01 §6) — mobil padding değeriyle
      EŞLEŞTİĞİNDEN emin ol.
- [ ] Landing başlığının 1366px'te TEK SATIRA sarıldığını doğrula (docs/02 §1); sarıyorsa
      kısalt.
- [ ] Landing'in 1366×768'de footer dahil KAYDIRMASIZ sığdığını doğrula.
- [ ] Hakkında sayfasını sıraya göre kur: Geliştiriciler (3 sütun) → Kurum → Kaynaklar →
      Sınırlılıklar → "← Geri" (docs/02 §7).
- [ ] `reference/ausculta/screens/01-landing-1366.png` ve `07-hakkinda-1366.png` ile
      yan yana KARŞILAŞTIR — yapı (hiyerarşi/bölüm sırası) aynı olmalı, piksel-birebir
      DEĞİL.

## Faz 2 — Mod seçimi, öğretici, mod değiştirme

- [ ] `components/mode-card.html`'i uyarla: üç kart HER ZAMAN görünür ve tıklanabilir;
      kilitli kart GİZLENMEZ, DISABLED yapılmaz — görünür + yönlendirici CTA (docs/03 §1,
      docs/02 §2).
- [ ] Kilit kontrolünü mod ekranı YÖNLENDİRMESİNDEN öteye TAŞIMA — gönderim
      fonksiyonlarından (varsa) ön koşul kontrolünü KALDIR (docs/03 §1, kritik kural).
- [ ] 3 adımlı canlı öğretici + kalıcı "Tekrar gösterme" bayrağı ekle; öğretici
      görünümünün gözlem sayacına DOKUNMADIĞINI doğrula (docs/02 §3).
- [ ] Header'da mod çipi + "Mod Değiştir" düğmesi; sekme/nav kaldırıldıysa QA
      betiklerindeki eski seçicileri güncelle.

## Faz 3 — Uygulama (madde) ekranı

- [ ] İki sütun düzeni: sol sahne (kayıt + araç çubuğu + zoom grubu), sağ Olgu kartı +
      koyu soru kartı (docs/02 §4).
- [ ] `components/zoom-group.html`'i uyarla: basamaklı zoom (1×/1,25×/1,5×/2× — SABİT
      basamaklar, aile tutarlılığı) + KALİPER/ÖLÇÜM aracının AYNI zoom çarpanını kullandığını
      doğrula (docs/04 §3).
- [ ] `components/compare-key.html`'i uyarla: referans çizgi KESİK, AYNI taban çizgisinde
      (ofsetsiz) — ofset varsa Tur 2 düzeltmesindeki gibi kaldır (docs/04 §4).
- [ ] `components/feedback.html`'i uyarla: anlık geri bildirim (Uygulama), TÜM
      çeldiricileri DEĞİL yalnız seçileni açıkla (docs/03 §7).
- [ ] Arayüz ipucu sızıntısı denetimi: DOM `data-*` özniteliklerinde mod/tanı/cevap bilgisi
      YOK; klavye kısayolları yalnız ilgili görünümde (docs/03 §4).

## Faz 4 — Değerlendirme + Sonuçlar

- [ ] `components/question-card-dark.html`'in Değerlendirme varyantını uyarla: madde
      geri bildirimi YOK, kart içi "Sonraki soru →" ile ilerleme, nokta ilerlemesi
      (docs/02 §5).
- [ ] Son maddenin gönderiminde OTOMATİK değerlendirmeye geç; manuel "Değerlendir"
      düğmesi tüm maddeler gönderilmeden `disabled` (docs/03 §6).
- [ ] `components/results-summary.html`'i uyarla: özet şerit + "Toplam öğrenme süresi"
      gibi AÇIK etiketler (docs/02 §6).
- [ ] Sonuçlar varyantının (ör. quiz/case) AÇIKÇA seçildiğini doğrula — genel bir
      `showView('results')` yerine varyant-özel çağrı noktası (docs/02 §6).
- [ ] Seçenek permütasyonunu `snippets/seededPermutation.js` ile uygula; eski
      `i % sayı` gibi döngüsel/tahmin edilebilir bir doğru-şık dağılımı varsa DEĞİŞTİR
      (docs/03 §2 — kritik sınav güvenliği kuralı).
- [ ] Ritim/tanı (ayırt edici) maddelerde stem'in bulguyu ANLATMADIĞINI, nötr bir "kayıt
      aşağıda" cümlesi kullandığını doğrula; regex denetimi ekle (docs/03 §3, docs/06 §11).

## Faz 5 — Eğitici/yardım paneli, kayıt durumu, kısayollar, erişilebilirlik

- [ ] `components/dialog.html`'deki 4 dialog kalıbını (çıkış onayı, tam ekran önerisi,
      örneklem onayı, ilerleme sıfırlama) native `<dialog>` ile uygula —
      `window.confirm()`/`alert()` KULLANMA.
- [ ] `snippets/requestResample.js`'i uyarla: en az bir yanıt işaretli/gönderilmişse onay,
      dokunulmamışsa doğrudan (docs/03 §5).
- [ ] `snippets/toggleFullscreen.js` + `snippets/fullscreenPrompt.js`'i uyarla: tam ekran
      kökü `document.documentElement`, webkit fallback, açılış önerisi + "Tekrar sorma"
      (docs/04 §1).
- [ ] `F` kısayolunun düğme odağında da çalıştığını doğrula (`BUTTON` engelleme
      listesinde OLMAMALI) (docs/04 §1.4).
- [ ] `snippets/progress-percent.js` ile ilerleme çubuklarının kesir/yüzde birim
      dönüşümünü (×100) doğrula — bu sınıf hata (birim karışıklığı) her yeni ilerleme
      göstergesinde TEKRAR kontrol edilmeli (docs/06 §6).
- [ ] `prefers-reduced-motion` tüm yeni animasyonları kapsıyor mu?
- [ ] 44px dokunma hedefi + ARIA kalıpları (radio/progressbar/status) uygulandı mı?
      (docs/04 §6-7).

## Faz 6 — Kayıt/SCORM, doğrulama, belgeler

- [ ] `docs/05-kayit-ve-scorm.md` kurallarını uygula: `suspend_data` 4096 bayt bütçesi,
      şema sürümü ile İÇERİK sürümü imzasını (`cv`) AYRI tut, LMS `passed` durumunun yerel
      sıfırlamadan ETKİLENMEDİĞİNİ doğrula.
- [ ] localStorage YALNIZ konfor tercihleri için mi kullanılıyor — oturum/yanıt/puan
      verisi ORAYA sızmıyor mu? (docs/05 §4).
- [ ] `docs/06-qa-kabul.md` listesindeki 17 kabul testini ürünün kendi Playwright/e2e
      betiğine uyarla; ürün-özel seçicilerle güncelle.
- [ ] Ürünün paketleme betiği (varsa) tekrar-üretilebilirlik testinden geçiyor mu?
      (docs/06 §16).
- [ ] 390×844 / 768×1024 / 1366×768'te tüm ekranların ekran görüntülerini al; yatay
      taşma YOK.
- [ ] Ürünün kullanım/BUILD belgelerini (KULLANIM.md/BUILD.md benzeri) güncelle: yeni akış,
      terim değişiklikleri, yazı ölçeği notu.

## Faz 7 — Pulse Tur 4/5 yeni kuralları (içerik QC, landing, tıklama kararlılığı)

Bu fazın maddeleri v1.4/v1.5'te eklendi. **v1.6 güncellemesi:** Ausculta ve Opaca depoları
(21–23 Eylül 2026 çalışma kopyaları, commit'lenmemiş) `/Applications/Xcode.app/Contents/
Developer/usr/bin/git status`/`diff` ile taranıp GERÇEK durum işaretlenmiştir — aşağıdaki
☑/☐/"uygulanamaz" değerleri varsayım DEĞİL, kod taramasına dayanır (kaynak dosya/satır her
satırda belirtilir). Bir ürünün ☑ olması diğerini OTOMATİK tamamlamaz.

| Kural | Bkz. | Ausculta | Opaca |
|---|---|---|---|
| Yönetim/yaklaşım maddeleri tek şablondan değil, hemodinamik durum + klinik bağlama göre bankalanıyor | docs/03 §9.1 | uygulanamaz: Ausculta'da (oskültasyon = ses/bulgu tanıma) "hemodinamik durum/instabilite" ile bankalanan bir yönetim-yaklaşım soru tipi yok | uygulanamaz: Opaca'da (radyoloji = görüntü/bulgu tanıma) aynı gerekçe — hemodinamik durum kavramı yok |
| Vital/bağlam–anahtar tutarlılığı doğrulandı; arrest bağlamında retrospektif not (`.case-note`) uygulandı | docs/03 §9.2 | uygulanamaz: aynı gerekçe (§9.1) — vital/instabilite bağlamlı madde tipi yok | uygulanamaz: aynı gerekçe |
| Görsel–metin uyumu: her tanı/bölge için sabit derivasyon üçlüsü, madde bu üçlüden türetiliyor | docs/03 §9.3 | ☑ eşdeğer mekanizmayla: `scripts/generate-cases.mjs` `primary` bir KAYDIN kendi gerçek konumundan/bulgusundan türer (satır ~121–279, `simulationLocation`) — Pulse'un elle atanan sabit derivasyon üçlüsü YERİNE, veri-güdümlü türetme aynı garantiyi (soru ile gösterilen kayıt HER ZAMAN uyumlu) YAPISAL olarak sağlıyor | ☑ eşdeğer mekanizmayla: `scripts/generate-cases.mjs` satır 149 `primary = withBox[0] ?? expertPos[0] ?? ...` — `img.annotations`/`img.findings`'ten DOĞRUDAN türer, elle atanan bir şablon YOK |
| Medya çeşitliliği: aynı örüntünün tekrarında kayıt penceresi/başlangıcı farklılaştırıldı | docs/03 §9.4 | ☐ — kod taramasında (`generate-cases.mjs`) bu türde bir "başlangıç/pencere çeşitlendirme" mekanizması bulunamadı | ☐ — aynı, `generate-cases.mjs`'te bulunamadı (görüntüler zaten tekil dosya; "pencere" kavramı BT yığınına özgü, bkz. docs/04 §11) |
| Ölçüm standardı notu: model ölçüm noktası kılavuz eşiğinden farklıysa madde metninde belirtiliyor | docs/03 §9.5 | ☐ — bulunamadı | ☐ — bulunamadı (kaliper/oran ölçüm aracı `FilmViewer.tsx measureRatio` var ama kılavuz-eşiği-farkı notu yok) |
| Tautolojik/çift geçerli seçenek taraması yapıldı (dış QC veya iç gözden geçirme) | docs/03 §9.6 | ☐ — dedike bir betik/QC kaydı bulunamadı | ☐ — dedike bir betik/QC kaydı bulunamadı |
| Kayıt imzası (`cv`) içerik sürümüne bağlı; şema sürümünden AYRI tutuluyor, uyumsuzlukta yalnız içerik-bağımlı veri tazeleniyor | docs/03 §9.7 | ☐ — `src/core/store.tsx`'te yalnız SCORM `api.version` (1.2/2004) var; içerik/madde bankası sürüm imzası AYRI bir alan olarak bulunamadı | ☐ — aynı, `src/core/scorm.ts`'te yalnız SCORM sürümü var |
| Dış QC döngüsü kuruldu: tam-eşleşmeli yama betiği → `vm` doğrulaması → tarayıcı testleri → QC dışa aktarma paketi | docs/03 §9.8, docs/06 §18 | ☐ — bulunamadı | ☐ — bulunamadı |
| `vm` tabanlı içerik testi: madde sayısı, benzersizlik, doğru şık pozisyon dağılımı, cevap sızıntısı regex'i | docs/06 §18 | ☐ kısmi eşdeğer: `scripts/validate-audio.mjs` YAPISAL bütünlük kontrolü yapar ama `vm.createContext` yalıtımı + pozisyon dağılımı testi YOK | ☐ kısmi eşdeğer: `scripts/validate-images.mjs` + `scripts/audit-duplicates.mjs` (soru İMZASI tekrarını 1000 tohumla test eder — bkz. docs/03 §10) var ama `vm` yalıtımlı doğru-şık pozisyon dağılımı testi YOK |
| QC dışa aktarma paketi (`qa/export_items.mjs` eşdeğeri) kuruldu ve tek komutla tekrar üretilebiliyor | docs/06 §18 | ☐ — bulunamadı | ☐ — bulunamadı |
| Landing kompozisyonu: kurum satırı üstte, ürün logosu büyütüldü, kurum filigranı arkada renkli/büyük | docs/01 §5.3, docs/02 §1, components/landing.html | **v1.6'da güncellendi, bkz. Faz 8** — amblem satırı var (`StartScreen.tsx` `.hero-inst-top`), filigran yok | **v1.6'da güncellendi, bkz. Faz 8** — amblem ve filigran yok (ürüne özel karar) |
| Validasyon ifadesi politikası: "bağımsız doğrulama yok" ifadeleri kaldırıldı, standart atıf cümlesi tüm yüzeylerde (landing/Hakkında/Yardım/kullanım belgesi/sources.json) tutarlı | docs/02 §1, §7 | ☑ `src/data/sources.json` satır 17–18: "…Kardiyoloji ve Göğüs Hastalıkları Anabilim Dalları öğretim üyelerince yapılmıştır." (tam+kısa biçim) | ☑ `src/data/sources.json` satır 10–11: "…Radyoloji Anabilim Dalı öğretim üyelerince yapılmıştır." |
| Hakkında rolleri güncellendi ("Öğretim Tasarımı ve Tıbbi Danışmanlık" / "Tıbbi İçerik Validasyonu"); isim netleşmeden yer tutucu kullanılıyor, boş baş harf avatarı "…" | docs/02 §7 | ☑ `src/data/sources.json` `credits[]` satır 32/49 — her iki rol adı MEVCUT | ☑ `src/data/sources.json` `credits[]` satır 24/41 — her iki rol adı MEVCUT |
| Landing ortam sesi eklendi (varsayılan açık, `aria-pressed`, localStorage kalıcı, yalnız landing'de çalar) | docs/02 §1, components/sound-toggle.html, snippets/landingSound.js | ☑ `src/ui/chrome.tsx` satır 17 (`LANDING_SOUND_KEY='ausculta.landingSound'`), 150 (`useLandingAmbientSound(state.screen==='start')`), 242–252 (düğme, `aria-pressed`) | uygulanamaz (bilinçli ürün kararı — bkz. docs/02 §1 v1.6 notu): Opaca'da (sessiz bir eylem olan görüntü okuma için) ortam sesi karakter gereği YOK; StartScreen.tsx'te ses kodu bulunamadı |
| Tam ekran düğmesi metin etiketli ("Tam ekran"/"Tam ekrandan çık"), landing'de de | docs/04 §1.5 | ☑ `src/ui/chrome.tsx` satır 260–264 | ☑ `src/ui/chrome.tsx` satır 99–102 |
| Tıklama hedefi kararlılığı: periyodik render yolları içerik değişmeden `innerHTML` YENİLEMİYOR, tıklama tek delege dinleyiciyle yakalanıyor | docs/04 §9, snippets/stableRender.js | uygulanamaz: React tabanlı SPA — vanilla `innerHTML` yeniden kurma kalıbı hiç KULLANILMIYOR (React reconciliation farklı bir garanti veriyor); bkz. docs/04 §9 "Ausculta/Opaca'da nerede" notu | uygulanamaz: aynı gerekçe (React) |
| Tıklama kararlılığı kabul testi uygulandı (300 ms bekleme, mod kartlarında 20/20) | docs/06 §19, tests/click-stability.template.mjs | ☑ `scripts/e2e-click-stability.mjs` (123 satır, 20 tekrar × 300 ms) | ☑ `scripts/e2e-click-stability.mjs` (265 satır, 20 tekrar × 300 ms + `moveAway` probu) |

## Faz 8 — v1.6 yeni kuralları (22–23 Eylül 2026)

Bu fazın maddeleri v1.6'da eklendi; çoğu doğrudan Ausculta/Opaca'dan (Pulse'tan DEĞİL)
kaynaklanır — bu yüzden kaynak ürün genelde zaten ☑'dir, karşı ürün için AYRI uygulama
gerekir. Kaynak dosya/satır her ilgili docs/0X bölümünde verilmiştir.

| Kural | Bkz. | Ausculta | Opaca |
|---|---|---|---|
| Soru tekrarı ölçütü: görüntüye bağlı sorular `tür\|görüntüId\|doğru`, bilgi soruları `tür\|metin\|doğru`; bilgi sorusu varyantı ≤4 vaka; oturum içi tekrar yasak (1000 tohum testi); genel soru oranı ≤%10 | docs/03 §10 | ☐ — Ausculta'nın kendi soru üretiminde (`scripts/generate-cases.mjs`) bu ayrımı yapan bir `questionSignature`/tavan mekanizması bulunamadı; UYGULANMALI | ☑ kaynak — `scripts/lib/case-selection.mjs` + `scripts/audit-duplicates.mjs` |
| Güvenli çeldirici ilkesi: çeldirici yalnız "yok" kanıtlı bulgudan; ayırıcı tanı önceliği (`DIFFERENTIALS`); değerlendirme kapısı ≥3 seçenek | docs/03 §11 | ☐ — Ausculta'nın çeldirici seçiminde `DIFFERENTIALS`/`safeDistractors` eşdeğeri bulunamadı; UYGULANMALI (Ausculta'nın KENDİ ses/bulgu ayırıcı tanı haritasıyla) | ☑ kaynak — `scripts/lib/case-selection.mjs` (`safeDistractors`, `DIFFERENTIALS`, `MIN_ASSESSMENT_OPTIONS`) |
| Yanıt sızıntısı: dağıtılan pakette medya dosya adı/klasörü bulguyu ele vermez (içerik-hash'li opak adlar) | docs/03 §4(c) | ☑ kaynak — `scripts/lib/obfuscate-audio.mjs` (`obfuscateAudioInDist`, post-build) | ☑ `scripts/lib/obfuscate-images.mjs` (`obfuscateImagesInDist`, post-build) — denetimde Kermany (`bacteria`/`virus`), NLM (`_0`/`_1` = normal/TB) ve Commons adlarının bulguyu ele verdiği görüldü; paketlerde `assets/xray/r/<sha1-12>.webp`. BT kareleri yalnız öğrenmede olduğundan kapsam dışı |
| Lokalizasyon: sabit yarıçaplı daire; isabet = kutu içi VE merkez mesafesi ≤ yarı köşegenin %60'ı; kutu alanı >%35 ise lokalizasyon sorusu yok; yanıt sonrası uzman kutusu + ıskalama oku | docs/04 §10 | uygulanamaz (şimdilik): Ausculta'da görsel üzerinde nokta işaretleme (lokalizasyon) soru tipi YOK — oskültasyon dinleme/tanıma tabanlı; ürün bu soru tipini eklerse kural UYGULANIR | ☑ kaynak — `src/core/geometry.ts` + `src/ui/FilmViewer.tsx` |
| Kesit yığını görüntüleyici: önceden render pencereler, çift pencereleme yok, işaret kendi kesitinde + "işaret: kesit a–b", okuyucu puanları var ama malignite/olasılık yok, BT'den vaka/soru üretilmez | docs/04 §11 | uygulanamaz: Ausculta'da çok kesitli bir görüntüleyici (BT benzeri) YOK | ☑ kaynak — `src/ui/FilmViewer.tsx`, `src/ui/FilmInfoPanel.tsx`, `scripts/import-tcia.mjs` |
| En iyi puan: mod başına kalıcı (localStorage, SCORM şeması dışı), mod kartında ve sonuç ekranında | docs/02 §10, docs/05 | ☑ eşdeğer VAR — `src/screens/ModeSelectScreen.tsx`/`ResultsScreen.tsx` `bestScore` kullanıyor (bkz. `git diff` çalışma kopyası) — Opaca ile AYNI desenle mi uygulandığı (ayrı localStorage anahtarı, SCORM dışı) TEK TEK doğrulanmalı ama satır bazlı kanıt bu tur incelemede TOPLANMADI | ☑ kaynak — `src/core/store.tsx` (`BEST_SCORE_KEY`, `loadBestScore`, `setResults` case) |
| Üçüncü taraf içerik politikası: lisanssız açık kaynak içerik kopyalanmaz; gerekirse temiz oda + esin kaynağı bağlantısı; kullanıcı kararıyla uygulanmayabilir | docs/01 §8 | ☐ veri seti düzeyinde eşdeğer belgelenmemiş (Ausculta HLS-CMDS/CirCor lisanslarını kullanır ama Opaca'daki gibi AYRI bir `license.mjs` filtre betiği bulunamadı) — PROVENANCE.md gözden geçirilmeli | ☑ kaynak (veri seti ayağı) — `scripts/lib/license.mjs` (`LICENSE_OK`, `isAcceptableLicense`) |
| Landing (v1.6): arka plan filigranı yok; kurum amblemi ürüne bağlı; ortam sesi ürün karakterine bağlı (zorunlu değil) | docs/01 §5.3, docs/02 §1 | ☑ filigran yok; amblem + kurum satırı korunuyor (`src/screens/StartScreen.tsx` `.hero-inst-top`) | ☑ filigran ve amblem yok (ürüne özel karar); kurum `Footer()`'da metinle var |

---

## Terim tablosu (ürün öğesi)

| Ürün | Öğe terimi | Kaynak |
|---|---|---|
| Pulse | **EKG Sonucu** (eski: "örüntü" — Tur 3'te değiştirildi) | `cardai/app.js`, `KULLANIM.md` |
| Ausculta | **Ses Kaydı** (öneri — Ausculta'nın kendi terimini KULLAN, burası tahmin) | — |
| Opaca | **[Opaca: belirlenecek]** | — |

**Neden bu tablo ayrı tutulur:** "Öğe terimi", her ürünün kendi alanına özgü tek
DEĞİŞKEN metin parçasıdır — geri kalan her şey (kart yapısı, kilit mantığı, geri bildirim
akışı) SABİTTİR. Bu tabloyu tek bir yerde tutmak, terim geçişlerini (Pulse'ta "örüntü" →
"EKG Sonucu" gibi) TEK NOKTADAN yönetilebilir kılar — kod içinde onlarca yerde string
arat-değiştir yapmak yerine, bu değişkenin nerede kullanıldığını component/snippet
dosyalarındaki `{{OGE_TERIMI...}}` yer tutucularından takip edin.

**Opaca için önemli not:** Opaca'nın öğe terimi bu tur itibarıyla BİLİNMİYOR. Bu şablonu
Opaca'ya uygularken, terimi UYDURMAYIN — kullanıcıdan isteyin ve yalnız onaylandıktan
sonra ilgili component/snippet dosyalarındaki `{{OGE_TERIMI_COGUL}}`/`[Opaca: belirlenecek]`
yer tutucularını doldurun.
