# EGEMED SIM FRAMEWORK

EGEMED ürün ailesi (**Pulse** — EKG simülatörü, **Ausculta** — oskültasyon simülatörü,
**Opaca** — [Opaca: belirlenecek]) için ortak **UI/UX ve pedagoji şablonu**.

Bu depo **çalıştırılabilir bir uygulama değildir**; ürünlerin birbirine hizalanması için
kullanılan bir **referans ve şablon kitaplığıdır**. Kod parçaları, uydurma örnekler değil,
EGEMED Pulse deposundaki (`EGEMED_PULSE`) **gerçek koddan** alınmıştır ve her biri hangi
dosya/fonksiyondan geldiğini belirtir.

## Amaç

Kullanıcı bir üründen diğerine geçtiğinde aynı yerleşimi, aynı renk/tipografi dilini, aynı
mod akışını (İnceleme/Uygulama/Değerlendirme), aynı soru/geri bildirim kalıbını ve aynı
sonuç raporunu görmelidir. Bu şablon, Ausculta'nın kurduğu ilk temele Pulse'ta 18–21 Eylül
2026'da BEŞ turda eklenen pedagoji/görsel/içerik iyileştirmeleri **ürün-bağımsız kurallar**
olarak ekler. Ausculta ve Opaca bu şablona göre hizalanır.

## Ürünler

| Ürün | Alan | Durum |
|---|---|---|
| **Pulse** | EKG / dolaşım eğitimi | Şablonun kaynağı; beş turun tamamı uygulandı |
| **Ausculta** | Kardiyopulmoner oskültasyon | Şablonun temeli (v1.0); üç tur henüz uygulanmadı |
| **Opaca** | [Opaca: belirlenecek] | Öğe terimi ve alan bilgisi bekleniyor |

## Nasıl uygulanır

1. `docs/07-uygulama-kontrol-listesi.md`'yi baştan sona, faz faz izleyin.
2. Her kuralı okurken ilgili `docs/0X-*.md` bölümündeki **Neden** ve **Pulse'ta nerede**
   açıklamasını okuyun — kuralı köre körüne kopyalamayın, gerekçesini anlayın.
3. `tokens/family-tokens.css`'i ürününüzün CSS'ine ekleyin; eski token adlarınızı SİLMEDEN
   yeni aile token'larına eşleyin (köprü token yaklaşımı).
4. `components/*.html` dosyalarındaki markup/CSS iskeletlerini ürününüzün teknolojisine
   (React/Vue/vanilla) uyarlayın; sınıf adlarını KORUYUN (aile CSS'iyle uyumluluk için).
5. `snippets/*.js` dosyalarındaki algoritmaları (seçenek permütasyonu, örneklem onayı, tam
   ekran, ilerleme yüzdesi) doğrudan alıp ürününüzün değişken adlarına uyarlayın.
6. `docs/06-qa-kabul.md` listesindeki testleri kendi e2e/Playwright betiğinize uyarlayın.
7. Ürüne özgü tek değişken (öğe terimi — bkz. `docs/07` "Terim tablosu") netleşmeden
   ilgili yer tutucuları (`{{OGE_TERIMI_COGUL}}`, `[Opaca: belirlenecek]`) UYDURMAYIN;
   kullanıcıdan isteyin.

## Depo yapısı

```
README.md                       — bu dosya
CHANGELOG.md                    — sürüm tarihçesi (v1.0 Ausculta tabanı → v1.1…v1.5 Pulse turları)
docs/
  01-tasarim-sistemi.md         — token'lar, tipografi, renkler, radius/gölge, ikon, marka bloğu, footer,
                                   landing marka kompozisyonu (v1.6: filigran yok, amblem ürüne bağlı),
                                   üçüncü taraf içerik politikası
  02-ekranlar.md                — landing (kompozisyon, validasyon ifadesi, ortam sesi — ürün karakterine
                                   bağlı), mod seçimi, öğretici, uygulama, değerlendirme, sonuçlar, hakkında
                                   (roller/yer tutucular), dialoglar, en iyi puan (mod başına kalıcı)
  03-mod-akisi-ve-pedagoji.md   — kilit≠öneri, gönderim kuralları, örneklem/onay, otomatik değerlendirme,
                                   seçenek permütasyonu, stem/ipucu/medya sızıntısı, geri bildirim yapısı,
                                   başarı tanımı, içerik kalite kuralları (madde bankası QC döngüsü),
                                   soru tekrarı ölçütü, güvenli çeldirici ilkesi
  04-etkilesim-ve-erisilebilirlik.md — tam ekran (+ düğme etiketi), kısayol kapsamı, zoom, karşılaştırma çizimi,
                                   odak yönetimi, ARIA kalıpları, 44px hedef, 390px davranışı,
                                   tıklama hedefi kararlılığı, lokalizasyon, kesit yığını görüntüleyici (BT)
  05-kayit-ve-scorm.md          — SCORM 1.2 tek SCO, suspend_data 4096, şema sürümü + içerik imzası (cv),
                                   localStorage kapsamı (konfor / kişisel rekor / oturum verisi), LMS passed
                                   korunması
  06-qa-kabul.md                — Playwright kabul listesi, build tekrarlanabilirliği, ekran boyutları,
                                   içerik QC (400 madde/vm kontrolleri/dışa aktarma), tıklama kararlılığı testi
  07-uygulama-kontrol-listesi.md — Ausculta/Opaca'ya uygularken faz faz kontrol listesi (Faz 0–8,
                                   Ausculta/Opaca sütunları gerçek kod taramasıyla dolu) + terim tablosu
tokens/
  family-tokens.css             — tek kaynak aile token'ları (renk/tipografi/radius/gölge)
components/
  topbar.html, footer.html, mode-card.html, question-card-dark.html, feedback.html,
  results-summary.html, dialog.html, zoom-group.html, compare-key.html, landing.html,
  sound-toggle.html
snippets/
  seededPermutation.js, requestResample.js, toggleFullscreen.js, fullscreenPrompt.js,
  progress-percent.js, stableRender.js, landingSound.js, safeDistractors.js,
  obfuscateMedia.js, localizationHit.js
tests/
  click-stability.template.mjs  — tıklama hedefi kararlılığı kabul testi şablonu (ürün-bağımsız)
reference/
  ausculta/                     — Pulse'un temel aldığı Ausculta referansı (tsx/css/screens/brand kopyası)
  pulse/                        — orijinal YONERGE_*.md belgeleri + mode-flow kabul testi ekran görüntüleri
```

## Sürüm

Bkz. `CHANGELOG.md`. Güncel: **v1.6** (22–23 Eylül 2026 — Ausculta/Opaca'dan geri gelen
genelleştirilebilir kurallar: soru tekrarı ölçütü, güvenli çeldirici ilkesi, lokalizasyon,
yanıt sızıntısı (medya), BT kesit yığını görüntüleyici, en iyi puan, üçüncü taraf içerik
politikası; landing arka plan filigranı kaldırıldı).

## Kaynak ve doğrulama

Bu şablondaki her kural, `/Users/ozankaraca/Documents/Codex/EGEMED_PULSE` deposundaki
gerçek değişikliklerden doğrulanmıştır:

- `git diff -- cardai` (18-21 Eylül 2026 arası, beş turun tamamı — depo commit'lenmemiş
  çalışma kopyası hâlinde tutulmuştur).
- `qa/mode_flow_audit.mjs` (Tur 1-5 kabul testleri, F/G/H/L serisi — bkz.
  `reference/pulse/mode-flow-screens/report.json`).
- `qa/independent_content.mjs`, `qa/export_items.mjs` (içerik QC — madde bütünlüğü, dışa aktarma).
- `BUILD.md` "Son teslim kaydı" / "Önceki kayıt" zinciri (tur tarihleri: 18, 19, 21 Eylül 2026 —
  Tur 4 ve Tur 5 aynı gün, 21 Eylül, ayrı teslim kayıtlarıdır).
- `cardai/KULLANIM.md` (kullanıcıya dönük davranış tarifi).

EGEMED_PULSE deposu bu şablon deposundan **yalnız okunur**; hiçbir dosyası değiştirilmemiştir.

**v1.6 (22–23 Eylül 2026) — Ausculta/Opaca kaynaklı kurallar:** Bu turda eklenen kurallar
(soru tekrarı ölçütü, güvenli çeldirici ilkesi, lokalizasyon, medya sızıntısı, BT kesit
yığını görüntüleyici, en iyi puan, üçüncü taraf içerik politikası) Pulse'tan DEĞİL,
`/Users/ozankaraca/Documents/EGEMED SIM/{egemed-ausculta,egemed-opaca}` depolarındaki
GERÇEK koddan doğrulanmıştır (bu depolar da commit'lenmemiş çalışma kopyası hâlindedir —
`git status`/`diff` ile taranmıştır). Kaynak dosya/satır her kuralın "…'da nerede" bölümünde
verilmiştir. Ausculta ve Opaca depoları da bu şablon deposundan **yalnız okunur**; hiçbir
dosyaları değiştirilmemiştir. v1.5'teki landing arka plan filigranı v1.6'da
kullanıcı kararıyla kaldırılmıştır; üstteki kurum amblemi ürüne bağlıdır (bkz.
docs/01-tasarim-sistemi.md §5.3, CHANGELOG.md).
