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

---

Bu şablon deposu (**EGEMED SIM FRAMEWORK**) v1.3 durumunu tek commit olarak yakalar;
gelecekteki Pulse turları veya Ausculta/Opaca'dan geri gelen genelleştirilebilir kurallar
bu CHANGELOG'a yeni bir sürüm satırı olarak eklenmelidir.
