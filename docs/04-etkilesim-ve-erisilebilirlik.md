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

### 1.5 Düğme metin etiketi ("Tam ekran" / "Tam ekrandan çık")

**Kural:** Tam ekran düğmesi yalnız bir ikonla DEĞİL, ikonun yanında durumla değişen bir
metin etiketiyle ("Tam ekran" / "Tam ekrandan çık") gösterilir; bu, uygulama header'ında VE
landing'deki eşdeğer düğmede AYNI şekilde uygulanır (iki ayrı kod yolu olsa bile ikisi de
`syncFullscreen()`'de senkronize edilir).

**Neden:** Yalnız ikonla gösterilen bir aç/kapa düğmesi, ikon dilini bilmeyen bir kullanıcı
için belirsizdir ("bu ikon şu an ne YAPACAK?"). Metin etiketi bu belirsizliği ortadan
kaldırır; dar ekranda (`hide-mobile`/`.lbl` gizleme kuralı, bkz. docs/02) etiket gizlenir
ama ikon + `title`/`aria-label` yine de anlamı taşır.

**Pulse'ta nerede:** `cardai/features.js syncFullscreen()` — hem `#fullscreenBtn`
(`btn.querySelector('span')`) hem `#landingFullscreen` düğmesindeki etiket span'i
`on?'Tam ekrandan çık':'Tam ekran'` ile güncellenir; `cardai/index.html` her iki düğmede de
ikonun yanına `<span class="lbl">Tam ekran</span>` eklendi (Tur 5 — 21 Eylül 2026). Kanıt:
`qa/evidence/mode-flow/topbar-fullscreen-label.png`.

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

---

## 9. Tıklama hedefi kararlılığı

**Kural:** Bir zamanlayıcıyla (periyodik `setInterval`/`requestAnimationFrame` döngüsü ile)
tekrar tekrar çalışan HİÇBİR render yolu, tıklanabilir öğeleri `innerHTML` atamasıyla /
yeniden oluşturarak DEĞİŞTİREMEZ — bu, kullanıcının tam o an bastığı düğmeyi parmağının
altından "çekip almasına" (DOM düğümünü değiştirmesine) yol açar ve `mousedown`/`mouseup`
arasında imleç DOM'da artık var olmayan (veya yerinden oynamış) bir öğenin üstünde kalabilir.
Çözüm iki parçalıdır: (1) içerik bir öncekiyle AYNIYSA render tamamen ATLANIR (üretilen HTML
dizesi önceki ile karşılaştırılır — `dataset.rendered` deseni); (2) tıklama olayları, her
render'da yeniden eklenen tek tek `addEventListener` ile DEĞİL, konteynerde KALICI tek bir
delege (`event delegation`) dinleyiciyle yakalanır — dinleyici konteynere yalnız BİR KEZ
bağlanır (`dataset.bound` bayrağı), konteynerin içeriği kaç kez yeniden çizilirse çizilsin
dinleyici kaybolmaz/çoğalmaz.

**Neden:** Mod seçim kartları 250 ms'de bir ilerleme çubuğunu güncellemek için
`renderModes()`'u çağırıyordu; bu fonksiyon HER çağrıda `box.innerHTML=...` ile tüm kart
DOM'unu SIFIRDAN yeniden kuruyordu — kart içeriği (ilerleme yüzdesi hariç) değişmese bile.
Sonuç: kullanıcı bir mod kartına TAM 250 ms'lik pencerede basarsa (`mousedown`), düğme
render tarafından DOM'dan sökülüp yeniden eklenmiş oluyordu; tarayıcı `mouseup`'ı artık DOM'da
olmayan (veya yeni bir düğüm olan) eski hedefe bağlayamıyor, tıklama SESSİZCE kayboluyordu.
Bu, kullanıcı için açıklanamayan, aralıklı ("bazen çalışıyor bazen çalışmıyor") bir arayüz
hatasıdır — özellikle yavaş/kararsız bir tıklama/dokunuşta (basılı tutup düşünme, parmağı
hafif kaydırma) sıklığı artar. Aynı sınıf hata, zamanlayıcıyla güncellenen HERHANGİ bir
ekranda (ilerleme çubuğu, canlı sayaç, oturum durumu) tekrar edebilir — kural bu yüzden
ürün-bağımsız ve genel tutulur.

**Pulse'ta nerede:** `cardai/app.js renderModes(gates)` — eskiden
`box.innerHTML=learn+practice+assessment;box.querySelectorAll('button[data-view]').forEach(
btn=>btn.addEventListener('click',()=>showView(btn.dataset.view)));` (her çağrıda yeniden
kur + yeniden bağla). Yeni hâli: `const html=learn+practice+assessment;
if(box.dataset.rendered!==html){box.innerHTML=html;box.dataset.rendered=html;}
if(!box.dataset.bound){box.dataset.bound='1';box.addEventListener('click',e=>{const
btn=e.target.closest('button[data-view]');if(!btn||!box.contains(btn))return;
btn.dataset.view==='results'?window.CardAResults.show('quiz'):showView(btn.dataset.view);});}`
— içerik aynıysa `innerHTML` hiç dokunulmaz, dinleyici konteynere yalnız bir kez bağlanır
(Tur 5 — 21 Eylül 2026; tetikleyici: `progress()`'in 250 ms'lik döngüsünün `renderModes()`'u
periyodik çağırması). Tam algoritma ve yorum bloğu: `snippets/stableRender.js`.

**Kabul testi:** Her ekranda görünür tüm tıklanabilir öğeler için: düğmeye BAS (`mousedown`),
**300 ms bekle** (zamanlayıcı döngüsünün en az bir kez çalışması için — Pulse'ta 250 ms'lik
döngüden daha uzun), imleci öğenin DIŞINA taşı, imleci geri getirip BIRAK (`mouseup`) —
düğüm kimliği/referansı test boyunca DOM'da aynı kalmalı ve `mouseup` doğru hedefe
ULAŞMALIDIR. Mod kartlarında bu senaryo 20 kez ardışık ("yavaş tıklama") denenir; 20/20
başarı beklenir. Test kalıbı: `tests/click-stability.template.mjs` (Pulse'taki tanı betiği
`scratchpad/click_stability.mjs`'in ürün-bağımsızlaştırılmış hâli — her görünümdeki tüm
görünür/etkin düğmeleri basıp 300 ms bekleyip bırakarak DOM bağlantısının ve tıklama
hedefinin korunduğunu doğrular).

**Ausculta/Opaca'da nerede (React — uygulama mekanizması FARKLI, kabul testi AYNI):** İki
ürün de vanilla-DOM `innerHTML` yeniden kurma kalıbını KULLANMAZ (React'in kendi
reconciliation'ı `key` sabit kaldığı sürece aynı DOM düğümünü genelde KORUR); bu nedenle bu
maddenin UYGULAMA kısmı (`dataset.rendered`/`dataset.bound` kalıbı) React tabanlı ürünlere
DOĞRUDAN uygulanamaz — **uygulanamaz: React reconciliation farklı bir garanti veriyor**. Ama
KABUL TESTİ aynı riski (periyodik bir zamanlayıcı/durum güncellemesi bir düğmeyi basılıyken
DOM'dan söküyor mu) React'te de SINAMALIDIR ve ikisi de bunu yapar: Ausculta
`scripts/e2e-click-stability.mjs` (123 satır — `slowClick()` satır 26–34: `mousedown` →
300 ms bekle → opsiyonel imleç kaydırma → `mouseup`; mod kartlarında 20 tekrar) ve Opaca
(aynı ad) `scripts/e2e-click-stability.mjs` (265 satır — aynı 300 ms/20 tekrar deseni,
ayrıca `moveAway` ile imleç-dışına-taşıma probu, satır 1–18 yorum bloğu).

---

## 10. Lokalizasyon — sabit yarıçaplı işaret dairesi, isabet ölçütü, kutu-alanı eşiği (v1.6 — yeni)

**Kural:** Bir "bulguyu görüntü üzerinde işaretle" (lokalizasyon) sorusunda: (1) öğrencinin
işareti SABİT yarıçaplı bir daire olarak gösterilir (görüntünün kısa kenarına ORANLI, piksel
sabiti DEĞİL — böylece yakınlaştırma/farklı çözünürlükte tutarlı kalır); (2) İSABET, işaretin
hem uzman kutusunun İÇİNDE OLMASI **VE** işaret merkeziyle kutu merkezi arasındaki uzaklığın
kutunun yarı köşegeninin **%60'ını AŞMAMASI** ile tanımlanır (yalnız "kutunun içinde" yetmez —
kutunun UZAK bir köşesine teğet geçen bir işaret de isabet SAYILMAZ); (3) uzman kutusunun
alanı görüntünün **%35'inden BÜYÜKSE**, o bulgu için lokalizasyon sorusu HİÇ ÜRETİLMEZ (yerine
bulgu tanıma sorulur) — çok büyük bir kutuda "isabet" neredeyse GARANTİDİR, ölçme değeri
YOKTUR; (4) yanıt açıldığında (geri bildirim), öğrencinin işareti hedefi KAÇIRMIŞSA, uzman
kutusu ayrıca gösterilir VE ıskalayan işaretten en yakın uzman kutusu merkezine bir ok/çizgi
çizilir — "ne kadar uzak" bilgisini VERİR ama mm/piksel gibi kesin bir ölçü İDDİA ETMEZ
(yalnız yüzde/konum).

**Neden:** Sabit yarıçaplı daire, öğrencinin işaretinin "büyüklüğünü" DEĞİL yalnız
"konumunu" ölçmeyi sağlar — değişken bir yarıçap (ör. sürüklenerek büyütülen bir alan)
öğrenciye "ne kadar büyük işaretlersem o kadar güvenli" gibi YANLIŞ bir strateji öğretir.
İsabet ölçütünün "kutu içi VE merkeze yakın" olması (yalnız "kutu içi" DEĞİL), büyük/geniş
kutularda kenardan teğet geçen rastgele bir tıklamanın DOĞRU sayılmasını ENGELLER — eski bir
sabit-piksel kenar toleransı yaklaşımı bu ayrımı yapamıyordu. %35 kutu-alanı eşiği, "her yer
zaten doğru cevap" durumunda soruyu HİÇ SORMAMAYI tercih eder — bu, docs/03 §2'deki (seçenek
permütasyonu) "tahmin edilebilirliği önle" ilkesinin GÖRSEL/UZAMSAL muadilidir. Iskalama
oku ise geri bildirimi "doğru/yanlış" ikiliğinden çıkarıp YÖNLENDİRİCİ hâle getirir — öğrenci
NE KADAR ve HANGİ YÖNDE yanıldığını görür, ama sahte bir kesinlik (mm cinsinden mesafe)
İDDİA EDİLMEZ.

**Opaca'da nerede:** `src/core/geometry.ts` — `MAX_LOCALIZATION_BOX_AREA = 0.35` (satır 20),
`MARK_RADIUS_SHORT_EDGE_FRACTION = 0.08` (satır 23), `markRadiusNorm(image)` (satır 27–32 —
görüntü kare değilse eksen başına farklı normalize yarıçap, ekranda gerçek daire için),
`MARK_CENTER_DISTANCE_FRACTION = 0.6` (satır 37), `markHitsBox(p, b)` (satır 39–47 — önce
`inBox` kontrolü, sonra `dist <= halfDiag * MARK_CENTER_DISTANCE_FRACTION`),
`markHitsFinding(p, image, finding)` (satır 50–53), `nearestFindingBoxCenter(p, image,
finding)` (satır 57–72 — en yakın uzman kutusu merkezi, ıskalama oku için). Görselleştirme:
`src/ui/FilmViewer.tsx` — `markRadius = markRadiusNorm(image)` (satır 424),
`markMissTarget` (satır 428–431 — `showAnnotations && !strict && mark && annotationFinding
&& !markHitsFinding(...)` ise `nearestFindingBoxCenter` çağrılır), ok çizimi `<line
className="mark-miss-line">` + `<marker id="mark-miss-arrow">` (satır 496–509), işaret
dairesi `<span className="film-mark-circle">` (satır 511–528, `width/height` yüzdesi
`markRadius.rx/ry * 2 * 100` ile). Klavye erişilebilirliği: ok tuşlarıyla daire taşınabilir
(`MARK_KEY_STEP=0.02`, satır 316), konum `aria-live` ile duyurulur (`markAnnounce`, satır 87,
330, 372).

---

## 11. Kesit yığını görüntüleyici (BT) (v1.6 — yeni)

**Kural:** Birden çok kesitli (BT gibi) bir görüntüleyicide: (1) kesitler İSTEMCİ TARAFINDA
serbest HU pencerelemesiyle DEĞİL, ÖNCEDEN RENDER EDİLMİŞ pencere setleriyle (ör. Akciğer,
Mediasten) sunulur — kullanıcı yalnız İKİ sabit ön ayar arasında seçer, "Kemik"/"Standart" gibi
diğer ön ayarlar BT yığınında GÖSTERİLMEZ (bu pencereler için kare RENDER EDİLMEMİŞTİR);
"Parlaklık/Kontrast" özel ayarı bu ÖNCEDEN RENDER EDİLMİŞ kareler üzerine bir CSS filtresi
olarak eklenmeye DEVAM EDER (pencere seçimiyle ÇİFT PENCERELEME yapılmaz — CSS filtresi ayrı
bir katmandır, pencere ön ayarının kendisini DEĞİŞTİRMEZ). (2) Fare tekerleği/ok tuşları, tek
kareli görüntülerdeki gibi YAKINLAŞTIRMA/kaydırma yerine KESİT GEZİNİR (yığın varsa); (3) uzman
işaretlemeleri (nodül konturu vb.) YALNIZ KENDİ KESİTİNDE görünür — bir işaretin hangi kesit
ARALIĞINDA olduğu, işaretin görünür OLMADIĞI kesitlerde bile kısa bir "işaret: kesit a–b"
ipucuyla belirtilir (öğrenci "kayboldu" hissetmez, doğru kesit aralığına yönlendirilir); (4)
radyolog OKUYUCULARIN öznel morfoloji puanları (spikülasyon, lobülasyon, kenar, doku, şekil,
kalsifikasyon — 1–5/6 ölçek) GÖSTERİLİR ama **malignite/"olasılık" hiçbir biçimde
GÖSTERİLMEZ** ve puanların yanına "patoloji doğrulaması YOKTUR; tanı ya da malignite olasılığı
olarak YORUMLANMAMALIDIR" notu EKLENİR; (5) bu seriden VAKA veya SORU ÜRETİLMEZ — yalnız
öğrenme modunda, sistematik BT okumasını TANITMAK için kullanılır.

**Neden:** Serbest HU pencereleme, gerçek bir radyoloji iş istasyonu özelliğidir ama bir
öğretim simülatöründe hem UYGULAMA MALİYETİ yüksektir (her pencere kombinasyonu için render
veya gerçek zamanlı GPU işleme gerekir) hem de ölçmek istenen beceriyle (sistematik okuma,
bulgu tanıma) DOĞRUDAN İLGİLİ DEĞİLDİR — bu yüzden bilinçli olarak İKİ sabit, öğretim açısından
ANLAMLI ön ayarla SINIRLANIR. İşaretlerin yalnız kendi kesitinde görünmesi ANATOMİK
DOĞRULUKTUR (bir nodül her kesitte AYNI YERDE değildir); "işaret: kesit a–b" ipucu ise bunun
kullanıcı deneyimi MALİYETİNİ (öğrenci işareti "kaybetti" sanıp yığını rastgele TARAR) telafi
eder. Malignite/olasılık GÖSTERİLMEMESİ kritik bir tıbbi-etik sınırdır: LIDC-IDRI okuyucu
puanları PATOLOJİK DOĞRULAMA İÇERMEZ (biyopsi/cerrahi sonucu yoktur) — bu öznel puanları
"olasılık" gibi sunmak, öğrenciye YANLIŞ bir kesinlik duygusu verir ve DOĞRULANMAMIŞ bir
tıbbi iddiayı simülatörün ağzından SÖYLETMİŞ olur. Aynı nedenle bu seriden vaka/soru ÜRETİLMEZ
— DOĞRULANMAMIŞ bir "doğru cevap" ÖLÇME aracı OLAMAZ.

**Opaca'da nerede:** `src/ui/FilmViewer.tsx` — `stackWindow` (satır 97, `preset===
'mediastinum' ? 'mediastinum' : 'lung'`), `stackFrames`/`hasMultiSliceStack` (satır 98–99),
`isCtStack`/`presetOptions` (satır 392–393 — `WINDOW_PRESETS.filter(x=>x.id==='lung'||
x.id==='mediastinum')`), kesit gezinme: fare tekerleği (satır 303–307, `hasMultiSliceStack`
ise `setSliceIndex` — YAKINLAŞTIRMA yerine), ok tuşları (satır 334–338). İşaretlerin
kesite bağlılığı: `annotations` (satır 413–415 — `a.frameIndex==null || a.frameIndex===
clampedSlice`), "işaret: kesit a–b" ipucu (satır 541–545 — `annotatedSlices.length>0 &&
annotations.length===0` iken, yani mevcut kesitte GÖRÜNMEYEN ama yığında BAŞKA kesitte var
olan bir işaret varken). Radyolog puanları + uyarı: `src/ui/FilmInfoPanel.tsx` —
`LIDC_SCALES` (satır 124–131, yalnız spikülasyon/lobülasyon/kenar/doku/şekil/kalsifikasyon;
`malignancy`/`subtlety` KASITLI OLARAK LİSTEDE YOK — satır 121–123 yorum: "patoloji
doğrulaması olmayan öznel izlenimdir, öğrenci tarafından tanı/olasılık olarak
okunabilir"), `CtInfoPanel` (satır 133–191) "Okuyucu morfoloji puanları" bloğunda satır
178–180: "LIDC-IDRI okuyucularının öznel ölçek puanlarıdır; patoloji doğrulaması yoktur. Tanı
ya da malignite olasılığı olarak yorumlanmamalıdır." Vaka/soru üretilmemesi:
`scripts/import-tcia.mjs` satır 9 ("BT kayıtları yalnız ÖĞRENME içindir:
generate-cases.mjs modality === 'CT' kayıtlardan vaka üretmez"); `FilmInfoPanel.tsx` satır
184–187 ("Kullanım" satırı: "Yalnız öğrenme modunda; bu seriden vaka veya soru üretilmez.").
