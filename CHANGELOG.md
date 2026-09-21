# Changelog — EGEMED SIM FRAMEWORK

Sürümler, şablonun temel aldığı Pulse deposundaki paketleme kayıtlarına (`BUILD.md` "Son
teslim kaydı" / "Önceki kayıt" zinciri) ve `YONERGE_*.md` yönergelerine karşılık gelir.

## v1.0 — Ausculta tabanı (temel)

Kaynak: `reference/pulse/YONERGE_URUN_AILESI_UIUX_PLANI.md`,
`YONERGE_MOD_SECIM_EKRANI.md`, `YONERGE_FOOTER_HAKKINDA.md` — Ausculta'dan Pulse'a
taşınan ilk hizalama planı (commit `a68bf71`, 17 Eylül 2026 civarı).

- Aile token kümesi (`--navy-*`, `--blue-*`, `--ink-*`, mod kimliği renkleri: yeşil/mavi/mor).
- Header/footer/landing/Hakkında kabuğu; mod seçim ekranı (3 kart, kilit görünürlüğü);
  öğretici; uygulama (madde) ekranı iki sütun düzeni; değerlendirme + sonuçlar ekranı.
- `.tm` üst simge, marka bloğu kalıbı, footer kademeli kısalma.

## v1.1 — Pulse Tur 1: mod akışı ve pedagoji (18 Eylül 2026)

Kaynak: `git -C EGEMED_PULSE diff -- cardai` (Tur 1 bölümü), `BUILD.md` "Uygulama/
değerlendirme modu düzeltmeleri — kilit kaldırma, seçenek karışımı, stem sızıntısı
düzeltmesi" kaydı, `YONERGE_REVIZYON_2_AUSCULTA_HIZALAMA.md`.

- **Kilit ≠ öneri:** gönderim fonksiyonlarından (`caseCheck`, `submitQuizItem`, `grade`)
  ön koşul kontrolü kaldırıldı — kilitler yalnız mod ekranı YÖNLENDİRMESİNDE kalır.
- **Seçenek permütasyonu:** `correct = i % 5` (döngüsel, tahmin edilebilir) → madde
  kimliğinden hash ile tohumlanan `seededPermutation(id)` (docs/03 §2).
- **Stem sızıntısı:** ritim-tanı (`ddx_*`/`rhythmClass_*`) maddelerinde bulgu tarif eden
  cümleler → nötr "Eşzamanlı üç derivasyonlu kayıt aşağıda gösteriliyor." (docs/03 §3).
- **Arayüz ipucu sızdırmaz:** klavye kısayolları yalnız ilgili görünümde; kanvasta
  `data-mode` özniteliği kaldırıldı (docs/03 §4).
- Oturum içi "yeni örneklem / yeniden başlat" + onay dialogu (`requestResample`).
- Değerlendirmede gönderim sonrası kart içi "Sonraki soru →"; 10/10'da otomatik sonuç;
  toolbar "Yanıtları değerlendir (n/toplam)" tüm gönderimler tamamlanana kadar disabled.
- İlerleme çubuğu yüzde hesabı düzeltildi (kesir/yüzde birim hatası, ×100 eksikliği).
- Sonuç ekranından "Tekrar dene/Yeni örneklem" İLGİLİ görünüme geçer (genel değil).
- "Toplam öğrenme süresi" etiketi ("Süre" yerine, ne ölçüldüğü açık).
- Sonuçlar varyantı (quiz/case) açıkça seçilir (çağrı noktasından, genel showView değil).
- Tam ekran kökü `document.documentElement` (landing↔uygulama geçişinde korunur, webkit
  fallback eklendi); `F` kısayolu düğme odağında da çalışır; hata bildirimi `#uiNote` ile.
- Footer, `.app` padding'ini negatif margin ile taşar (kenardan kenara görünüm).
- Kayıt şemasına içerik sürümü imzası (`cv`) — uyumsuzlukta yalnız oturum/yanıt verisi
  yenilenir, gözlem süresi/kontrol listesi korunur (docs/05 §3).

## v1.2 — Pulse Tur 2: görselleştirme (19 Eylül 2026)

Kaynak: `BUILD.md` "İkinci tur EKG görselleştirme düzeltmeleri" kaydı.

- İnceleme sahnesi kanvası **1,25×** büyütüldü (oran korunur, taban çizgisi yeniden
  hizalandı: `ch*.64` → `ch*.6`).
- Normal referans çizgisi **kesik (dashed)** hâle getirildi, aynı taban çizgisinde
  (mavi `rgba(46,141,247,.85)`, dash `[6,4]`); gösterge (`.compare-key`) stili eşleştirildi.
- Vaka/soru kanvasında referans çizgi **ofsetsiz** hâle getirildi (`refBase` ofseti
  kaldırıldı — artık ana kayıtla AYNI `base` kullanılıyor).

## v1.3 — Pulse Tur 3: zoom, marka, terim, tam ekran önerisi (21 Eylül 2026)

Kaynak: `BUILD.md` "Üçüncü tur — vaka/soru EKG yakınlaştırma, beyaz üst çubuk logosu, üst
çubuk sloganı, 'EKG Sonucu' terimi, açılışta tam ekran önerisi" kaydı.

- Vaka/soru kanvasında kullanıcı kontrollü **zoom** (1×/1,25×/1,5×/2×), kaliperle tutarlı
  (`caseGeometry()` aynı zoom çarpanını kullanır).
- Üst çubuk logosu CSS filtresiyle (`brightness(0) invert(1)`) **beyaza** çevrildi.
- Logo sağında **ürün sloganı** (`.eg-brand-tag`), 1024px altında gizli.
- Arayüz terimi Pulse'ta **"EKG Sonucu"** oldu (eskiden "örüntü"); Ausculta/Opaca kendi
  terimini kullanır (bkz. docs/07 "Terim tablosu" — Opaca'nınki henüz belirlenmedi).
- Açılışta **"Tam ekran önerilir"** popup'ı: Tam ekrana geç / Böyle devam et / Tekrar
  sorma → `localStorage`, **SCORM kaydına yazılmaz**.

## v1.4 — Pulse Tur 4: içerik/pedagoji, kardiyoloji QC düzeltmeleri (21 Eylül 2026)

Kaynak: `BUILD.md` "Dördüncü tur — kardiyoloji QC düzeltmeleri" kaydı
(`EGEMED_PULSE_Kardiyoloji_QC_Raporu.docx`, 55 madde).

- **İçerik kalite kuralları** (docs/03 §9, yeni bölüm): yönetim/yaklaşım maddelerinin
  hemodinamik durum + klinik bağlama göre bankalanması (13 yeni bağlama özel banka: `arrestVf`,
  `arrestPulseCheck`, `unstableVt`, `stableAf`, `stableSvt`, `stableAt`, `sinusTachApproach`,
  `incidentalBbb`, `routineNormal`), vital/anahtar tutarlılığı, görsel–metin uyumu (sabit
  derivasyon üçlüleri: anterior V2–V3–V4, inferior II–III–aVF, LBBB I–V1–V6), medya çeşitliliği
  (PVC maddelerinde 7 farklı kayıt başlangıcı), ölçüm standardı notu (J+20 ms vs. kılavuz J
  noktası), tautolojik/çift geçerli seçenek taraması, kayıt imzasının içerik sürümüne
  bağlanması, dış QC döngüsü (tam-eşleşmeli yama betiği → `vm` doğrulaması → tarayıcı testleri
  → dışa aktarma paketi).
- 6 banka yeniden yazımı (PVC sınıflaması, VT ilk yaklaşım, AF/flutter ilk yaklaşım, iskemi
  sınırı, AF–PVC ayrımı, PVC açıklaması) ve 35 madde satırı düzeltmesi.
- Arrest/instabil olmayan bağlamda VF/VT ile ilgili 24 maddeye "Retrospektif eğitim analizi"
  notu (`retroNote()`, `.case-note` sınıfı, Olgu kartında amber kutu — docs/03 §9.2).
- Kayıt imzası: `cv = PulseCurriculum.version` (kayıt şemasının genel `version` alanından
  AYRI); içerik değişince yalnız oturum/yanıt/en-iyi-deneme verisi yenilenir, gözlem süresi ve
  kontrol listesi KORUNUR (docs/03 §9.7, docs/05).
- Hakkında sayfasında "Öğretim Tasarımı ve Tıbbi Danışmanlık" rolü yeniden adlandırıldı, yeni
  "Tıbbi İçerik Validasyonu" grubu eklendi (4 yer tutucu) — bkz. docs/02 §7.
- QA: `qa/independent_content.mjs` "T04-unique-content-and-position-distribution" (400 madde,
  5 seçenek, harf dağılımı, `vm` kontrolleri — docs/06 §18); `qa/export_items.mjs` QC dışa
  aktarma paketi (docs/06 §18).

## v1.5 — Pulse Tur 5: landing, validasyon ifadesi, ortam sesi, tıklama kararlılığı (21 Eylül 2026)

Kaynak: `BUILD.md` "Beşinci tur — landing yeniden düzenleme, validasyon ifadeleri, monitör
sesi, tam ekran etiketi" kaydı.

- **Landing kompozisyonu** (docs/01 §5.3, docs/02 §1, `components/landing.html`): üstte küçük
  bir kurum satırı (96 px amblem + "Ege Üniversitesi Tıp Fakültesi" metni), altında büyütülmüş
  yatay ürün logosu (`min(640px,86vw)`, `max-height:210px`; kırılımlar 480/380/300), arkada
  ortalı büyük RENKLİ kurum filigranı (`opacity:.14`, filtre yok — önceki silik/sola-yaslı
  filigranın yerine), kart yarı saydam beyaz zemin + blur alır (`rgba(255,255,255,.86)` +
  `backdrop-filter:blur(2px)`); ≤820px'te filigran gizlenir.
- **Validasyon ifadesi politikası** (docs/02 §1, §7): "bağımsız klinisyen doğrulaması yok"
  türü cümleler kaldırıldı; standart cümle "Simülatörün tüm tıbbi içerik ve [sinyal/ses]
  validasyonları {{KURUM_ADI}} [Anabilim Dalı] öğretim üyelerince yapılmıştır." landing kartı,
  Hakkında ("Validasyon, sınırlılıklar ve sorumluluk"), Yardım dialogu, kullanım belgesi ve
  `sources.json`'da tutarlı biçimde uygulanır; kullanım uyarısı cümlesi ("klinik tanı için
  kullanılmaz") AYRI ve KORUNUR.
- **Landing ortam sesi** (docs/02 §1, `components/sound-toggle.html`, `snippets/landingSound.js`):
  ürün karakterine uygun düşük sesli döngü (Pulse: WebAudio monitör bipi, 75/dk, look-ahead
  zamanlama), üst çubukta "Ses açık/kapalı" düğmesi (`aria-pressed`), varsayılan açık,
  `localStorage` kalıcılığı, otomatik oynatma kilidi ilk kullanıcı jestiyle açılır, yalnız
  landing görünürken çalar.
- **Tam ekran düğmesi metin etiketli** ("Tam ekran"/"Tam ekrandan çık"), uygulama header'ında
  VE landing'de aynı mantıkla senkron (docs/04 §1.5).
- **Tıklama hedefi kararlılığı** (docs/04 §9, docs/06 §19, `snippets/stableRender.js`,
  `tests/click-stability.template.mjs`): periyodik render döngüsüyle güncellenen hiçbir
  görünüm, içerik değişmediği sürece tıklanabilir öğeleri `innerHTML` ile yeniden KURMAZ
  (`dataset.rendered` karşılaştırması) ve tıklamalar konteynerde TEK bir delege dinleyiciyle
  yakalanır (`dataset.bound`) — mod seçim kartlarındaki 250 ms'lik ilerleme döngüsünün
  tıklamaları "yutması" bu şekilde giderildi. Kabul testi: bas → 300 ms bekle → imleci dışarı
  taşı → bırak; mod kartlarında 20 ardışık deneme, 20/20 beklenir.
- Hakkında rollerindeki yer tutucu isimler için boş baş harf avatarı artık "…" gösterir (gerçek
  bir kişi baş harfiyle karışmasın diye) — docs/02 §7.

---

Bu şablon deposu (**EGEMED SIM FRAMEWORK**) v1.5 durumunu tek commit olarak yakalar;
gelecekteki Pulse turları veya Ausculta/Opaca'dan geri gelen genelleştirilebilir kurallar
bu CHANGELOG'a yeni bir sürüm satırı olarak eklenmelidir.
