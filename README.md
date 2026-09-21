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
2026'da üç turda eklenen pedagoji/görsel iyileştirmeleri **ürün-bağımsız kurallar** olarak
ekler. Ausculta ve Opaca bu şablona göre hizalanır.

## Ürünler

| Ürün | Alan | Durum |
|---|---|---|
| **Pulse** | EKG / dolaşım eğitimi | Şablonun kaynağı; turların tamamı uygulandı |
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
CHANGELOG.md                    — sürüm tarihçesi (v1.0 Ausculta tabanı → v1.1/1.2/1.3 Pulse turları)
docs/
  01-tasarim-sistemi.md         — token'lar, tipografi, renkler, radius/gölge, ikon, marka bloğu, footer
  02-ekranlar.md                — landing, mod seçimi, öğretici, uygulama, değerlendirme, sonuçlar, hakkında, dialoglar
  03-mod-akisi-ve-pedagoji.md   — kilit≠öneri, gönderim kuralları, örneklem/onay, otomatik değerlendirme,
                                   seçenek permütasyonu, stem/ipucu sızıntısı, geri bildirim yapısı, başarı tanımı
  04-etkilesim-ve-erisilebilirlik.md — tam ekran, kısayol kapsamı, zoom, karşılaştırma çizimi,
                                   odak yönetimi, ARIA kalıpları, 44px hedef, 390px davranışı
  05-kayit-ve-scorm.md          — SCORM 1.2 tek SCO, suspend_data 4096, şema sürümü + içerik imzası (cv),
                                   localStorage kapsamı, LMS passed korunması
  06-qa-kabul.md                — Playwright kabul listesi, build tekrarlanabilirliği, ekran boyutları
  07-uygulama-kontrol-listesi.md — Ausculta/Opaca'ya uygularken faz faz kontrol listesi + terim tablosu
tokens/
  family-tokens.css             — tek kaynak aile token'ları (renk/tipografi/radius/gölge)
components/
  topbar.html, footer.html, mode-card.html, question-card-dark.html, feedback.html,
  results-summary.html, dialog.html, zoom-group.html, compare-key.html
snippets/
  seededPermutation.js, requestResample.js, toggleFullscreen.js, fullscreenPrompt.js,
  progress-percent.js
reference/
  ausculta/                     — Pulse'un temel aldığı Ausculta referansı (tsx/css/screens/brand kopyası)
  pulse/                        — orijinal YONERGE_*.md belgeleri + mode-flow kabul testi ekran görüntüleri
```

## Sürüm

Bkz. `CHANGELOG.md`. Güncel: **v1.3** (Pulse Tur 3 — 21 Eylül 2026 durumu tamamen işlendi).

## Kaynak ve doğrulama

Bu şablondaki her kural, `/Users/ozankaraca/Documents/Codex/EGEMED_PULSE` deposundaki
gerçek değişikliklerden doğrulanmıştır:

- `git diff -- cardai` (18-21 Eylül 2026 arası, üç turun tamamı — depo commit'lenmemiş
  çalışma kopyası hâlinde tutulmuştur).
- `qa/mode_flow_audit.mjs` (18/18 PASS kabul testi — bkz. `reference/pulse/mode-flow-screens/report.json`).
- `BUILD.md` "Son teslim kaydı" / "Önceki kayıt" zinciri (tur tarihleri: 18, 19, 21 Eylül 2026).
- `cardai/KULLANIM.md` (kullanıcıya dönük davranış tarifi).

EGEMED_PULSE deposu bu şablon deposundan **yalnız okunur**; hiçbir dosyası değiştirilmemiştir.
