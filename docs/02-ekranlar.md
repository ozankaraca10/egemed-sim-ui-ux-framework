# 02 — Ekranlar

Aile genelindeki ekran envanteri ve her ekranın kural gerekçeleri. Ürüne özgü değerler
parantez içinde örnek olarak verilir; kural metinleri ürün-bağımsızdır.

Akış: **Landing → Mod Seçimi → [İnceleme | Uygulama | Değerlendirme] → Sonuçlar**,
her ekrandan **Hakkında**'ya ve **Yardım**'a header üzerinden erişilir.

---

## 1. Landing

- Solda silik, sola yaslı kurum amblemi (`opacity:.08`, grayscale, dosya yoksa gizlenir).
- Ortada: ürün logosu → **tek satırlık** değer önerisi başlığı → 1 cümle alt metin (canlı
  sayılar: madde havuzu büyüklüğü) → birincil CTA ("Simülatörü başlat") → ikincil bağlantılar
  ("Nasıl kullanılır?", "Hakkında ve kaynaklar").
- "Neden güvenilir?" 3 kutu: madde/derivasyon sayısı + doğrulama durumu (dürüst), oturum
  büyüklüğü, SCORM uyumu.
- Alt dürüstlük satırı: "Sinyaller/kayıtlar sentetik öğretim şemalarıdır; klinik tanı için
  kullanılmaz."
- 1366×768'de **footer dahil kaydırmasız** sığar.

**Neden başlık tek satır olmalı:** İki satıra sarılan bir başlık, altındaki "Neden güvenilir?"
kutularını aşağı iter ve 1366×768'de footer'ın görünür kalması garantisini bozar (dikey alan
bütçesi sabittir). Pulse'ta "Elektriksel etkinliği, mekanik yanıtı ve dolaşımı birlikte
keşfedin." başlığı iki satıra sarıyordu; "EKG'yi, kalbi ve dolaşımı birlikte keşfedin."
biçiminde kısaltılarak tek satıra indirildi.

**Pulse'ta nerede:** `cardai/index.html` `#landingPage`; `cardai/landing.js` (sayıların
`pool.cases.length`/`pool.questions.length`'tan CANLI okunması — sabit yazılmaz).

**Açılış tam ekran önerisi (Tur 3):** Landing render'ından kısa süre sonra bir kez
"Tam ekran önerilir" popup'ı gösterilir — bkz. docs/04-etkilesim-ve-erisilebilirlik.md ve
`snippets/fullscreenPrompt.js`.

**Landing marka kompozisyonu (v1.6 — bkz. docs/01-tasarim-sistemi.md §5.3):** Arka plandaki büyük
renkli kurum filigranı üç üründen de kaldırılmıştır. Kartın üstündeki kurum amblemi + kurum satırı
Pulse ve Ausculta'da korunur, Opaca'da ürüne özel kararla yoktur. `components/landing.html`
amblem satırını isteğe bağlı blok olarak taşır.

**Validasyon ifadesi politikası (Tur 5):** "Bağımsız klinisyen doğrulaması yok" / "bağımsız
doğrulama yok" TÜRÜ cümleler landing'de (ve aile genelinde, bkz. aşağıdaki kutu) KULLANILMAZ.
Bunun yerine, ürünün tıbbi içeriğinin/sinyallerinin kimin tarafından doğrulandığını AÇIKÇA
belirten TEK bir standart cümle kullanılır: "Simülatörün tüm tıbbi içerik ve
[sinyal/ses] validasyonları {{KURUM_ADI}} [Anabilim Dalı] öğretim üyelerince yapılmıştır."
(kısa biçimi: "… öğretim üyelerince valide edilmiştir."). Kullanım uyarısı cümlesi ("Sinyaller
sentetik öğretim şemalarıdır; klinik tanı için kullanılmaz.") bundan AYRIDIR ve KORUNUR — biri
"kim doğruladı" sorusuna, diğeri "bunu nasıl kullanmamalıyım" sorusuna cevap verir; ikisi
birbirinin yerine geçmez.

**Neden bu cümle değişti:** "Bağımsız doğrulama yok" ifadesi teknik olarak doğru olsa da,
kullanıcıya İÇERİĞİN HİÇ doğrulanmadığı izlenimini veriyordu — oysa içerik kurum-içi uzman
öğretim üyelerince gözden geçirilip düzeltilmişti (bkz. docs/03 §9 dış QC döngüsü). Politika,
"doğrulama YOK" (olumsuz, güven kırıcı) yerine "kim doğruladı" (olumlu, doğrulanabilir atıf)
söylemine geçer — hem daha dürüst (gerçek QC sürecini yansıtır) hem daha güven vericidir.
Kullanım uyarısı cümlesi bu değişiklikten ETKİLENMEZ çünkü o farklı bir soruyu (klinik kullanım
sınırı) yanıtlar.

**Pulse'ta nerede:** `cardai/landing.js` (`landingFeatures`/"Neden güvenilir?" kutusu),
`cardai/curriculum.js limitations` alanı, `cardai/index.html #infoDialog` (Yardım dialogu),
`cardai/KULLANIM.md` (satır ~3/42/67), `cardai/features.js limitationsBox()`/`institutionCard()`
başlığı ("Sınırlılıklar" → "Validasyon, sınırlılıklar ve sorumluluk"), `cardai/sources.json`
`module.description`. Standart cümle Pulse'ta: "… Ege Üniversitesi Tıp Fakültesi Kardiyoloji
Anabilim Dalı öğretim üyelerince yapılmıştır." Kanıt: `qa/evidence/mode-flow/
about-validation.png`.

**Landing ortam sesi (Tur 5; v1.6: ürün karakterine bağlı, ZORUNLU DEĞİL):** Landing'de,
ürünün karakterine uygun DÜŞÜK sesli, döngüsel bir ortam sesi çalabilir (Pulse: WebAudio ile
sentetik monitör "bip"i, 75 vuru/dk; Ausculta: kendi ürün karakterine uygun bir döngü —
`src/ui/chrome.tsx` `LANDING_SOUND_KEY='ausculta.landingSound'`,
`useLandingAmbientSound(state.screen==='start')`, aynı aç/kapa + `localStorage` kalıcılık
kalıbı). Bu bir aile ZORUNLULUĞU DEĞİLDİR — Opaca'nın landing'inde (`src/screens/
StartScreen.tsx`) hiçbir ortam sesi YOKTUR ve bu geçerli bir üründür: radyolojik görüntü
okuma sessiz bir eylemdir, "ürün karakterine uygun ses" ölçütü Opaca için BOŞ kümedir —
zorla bir ses eklemek yapay olurdu. Kural, "varsa nasıl davranmalı" (döngüsel, düşük sesli,
aç/kapa düğmesi, `localStorage` kalıcı, yalnız landing'de çalar) tarifidir; "her ürün ses
eklemeli" DEĞİLDİR. Üst çubukta
bir "Ses açık/kapalı" düğmesi bulunur (`aria-pressed`), varsayılan AÇIKTIR, tercih
`localStorage`'a kalıcı yazılır. Tarayıcı otomatik oynatma kilidini (autoplay policy)
kullanıcının İLK jestinde (tıklama/tuş) açar — sayfa yüklenir yüklenmez zorla ses ÇALINMAZ
(tarayıcılar bunu zaten engeller). Ses YALNIZ landing görünürken çalar; uygulamaya girildiğinde
veya sekme gizlendiğinde DURUR.

**Neden:** Sessiz bir landing "burada bir şey çalışıyor mu" belirsizliği bırakabilir; ürünün
alanına özgü düşük sesli bir ipucu (monitör bipi, kalp sesi vb.) markayı daha "canlı" hissettirir
— ama bu bir TERCİHTİR, dayatma değildir: varsayılan açık olsa da düğme her zaman görünür ve
kapatma kalıcıdır (aynı cihazda tekrar sorulmaz). Ses yalnız landing'de çalışıp uygulamaya
geçince durması, öğrenme ekranlarında dikkat dağıtan bir arka plan sesi BIRAKMAMAK içindir.

**Pulse'ta nerede:** `cardai/landing.js` — `SOUND_KEY='pulse.landingSound'`, `BEAT_SEC=0.8`
(75/dk), `TONE_HZ=880`, `scheduleBeat()`/`schedulerTick()` (look-ahead zamanlamalı WebAudio
osilatör), `startMonitorSound()`/`stopMonitorSound()`/`syncMonitorSound()`,
`attemptAudioUnlock()` (`pointerdown`/`keydown` ile kilidi açar), `CardAILanding.soundState()`
(tanılama). Düğme: `#landingSound` (`cardai/index.html`), bileşen: `components/sound-toggle.html`,
tam kod: `snippets/landingSound.js`. Kabul testi: `qa/mode_flow_audit.mjs` "L4-sound-toggle-off",
"L4-sound-pref-persists", "L4-sound-state-diagnostics". Kanıt:
`qa/evidence/mode-flow/landing-sound-on.png`.

---

## 2. Mod seçimi

Üç kart: **İnceleme** (yeşil) / **Uygulama** (mavi) / **Değerlendirme** (mor) — bkz.
`components/mode-card.html`. Kartlar HER ZAMAN görünür ve tıklanabilir; kilitli olan bile
gizlenmez/disabled yapılmaz — bkz. docs/03-mod-akisi-ve-pedagoji.md "Kilit ≠ öneri" için
tam gerekçe.

Üstte ince "dürüstlük şeridi" (sentetik içerik uyarısı), kartların üstünde, ayrı bir bileşen
olarak — mod kartlarının İÇİNE karışmaz (her kartın kendi durumuna odaklanmasını sağlar).

**Pulse'ta nerede:** `cardai/index.html` `#modesView`; `cardai/app.js renderModes(gates)`.

---

## 3. Öğretici / Yardım

İlk kullanımda gerçek sahne üzerinde **3 adımlı canlı öğretici** (kalıcı "Tekrar gösterme"
bayrağı ile atlanabilir); header'daki "Yardım" düğmesi AYNI adımları statik bir modalda
metin listesi olarak gösterir (öğreticiyle çakışmaz — biri canlı/etkileşimli, diğeri referans).

**Neden gözlem sayacı öğreticide işlemez:** Öğretici görünümü (`tutorial`) İnceleme
görünümünden (`sim`) AYRI bir durumdur; gözlem sayma mantığı yalnız `sim` görünümüne
bağlıdır. Böylece öğretici adımlarını izlemek, kullanıcının gerçek 16 saniyelik gözlem
bütçesinden bir şey "çalmaz" — öğretme ile ölçme birbirine karışmaz.

**Pulse'ta nerede:** `cardai/features.js` `TUTORIAL` dizisi, `shouldRunTutorial()`,
`renderTutorial()`; `cardai/app.js` `observeEligible()` (yalnız `state.activeView==='sim'`
kapısı — `tutorial` görünümünde `false` döner).

---

## 4. Uygulama (madde) ekranı

İki sütun: solda **sahne** (kayıt/görüntü + araç çubuğu + zoom grubu), sağda **Olgu kartı**
+ **koyu soru kartı**.

### 4.1 Sahne (sol sütun)
- Kayıt kanvası + derivasyon/bölge seçici chip'leri (seçili = dolgu, incelenmiş = ✓).
- Araç çubuğu: karşılaştırma aç/kapa + gösterge (`components/compare-key.html`), kaliper,
  **zoom grubu** (`components/zoom-group.html`), oynat/duraklat, "Simülatörde aç" (yalnız
  doğru gönderim sonrası).
- Sahnenin `data-*` özniteliklerinde MOD/TANI bilgisi **bulunmaz** — bkz.
  docs/03-mod-akisi-ve-pedagoji.md "Arayüz ipucu sızıntısı".

### 4.2 Sağ sütun
- **Olgu kartı**: ikon + "Olgu" başlığı + `N/Toplam` rozeti; stem metni; varsa vitaller.
- **Soru kartı** (koyu, bkz. `components/question-card-dark.html`): tek soru, 5 seçenek,
  "Yanıtla →" (seçim yapılmadan disabled).
- **Geri bildirim** (gönderim sonrası, AYNI kartta) — bkz. `components/feedback.html`.
  CTA "Devam Et" → sonraki madde; son maddede "Maddeyi tamamla".
- **Oturum sonu kartı** (10/10 gönderildiğinde): özet şerit + madde bazlı ✓/✗ şeridi +
  "Yanlışları gözden geçir" + sonraki moda geçiş CTA'sı + "Yeni örneklem"/"Yeniden başlat"
  (onay dialoglu, bkz. docs/03).

**Pulse'ta nerede:** `cardai/index.html` `#caseView`; `cardai/features.js`
`caseStageMarkup`, `questionCardMarkup`, `caseFeedbackMarkup`, `caseEndMarkup`.

---

## 5. Değerlendirme ekranı

Aynı iki sütun düzeni, **mor kimlik**. Farklar (Uygulama'ya göre):

- Üstte **kural şeridi** (`.strict-banner`): ilk soruda TAM metin, sonrakilerde KOMPAKT
  tek satır — tekrar eden bilgiyi kısaltarak dikkat dağınıklığını azaltır.
- Her madde gönderiminden sonra **madde geri bildirimi GÖSTERİLMEZ**; yalnız kart içi
  **"Sonraki soru →"** düğmesiyle ilerlenir (son maddede "Yanıtları değerlendir →").
- Soru sayacı + **nokta ilerlemesi** (`.q-dots`, her nokta done/now durumunda).
- Alt araç çubuğunda **"Yanıtları değerlendir (n/toplam)"** düğmesi TÜM maddeler
  gönderilmeden `disabled` kalır; son maddenin gönderimiyle **otomatik** değerlendirmeye
  geçilir (kullanıcı ayrıca bu düğmeye basmak ZORUNDA değildir).
- Çıkış onayı: marka/mod değiştirme tıklanınca `<dialog>` ile onay (bkz.
  `components/dialog.html` #1).

**Neden madde geri bildirimi sonuç ekranına taşınır:** Değerlendirme SUMATİF bir ölçme
anıdır; her maddeden hemen sonra doğru cevabı göstermek, sonraki maddelerin bağımsız
ölçüm değerini bozabilir (kullanıcı önceki geri bildirimden ipucu taşıyabilir) ve genel
puanın "toplam bir sonuç" olarak deneyimlenmesini zayıflatır. Tam liste yalnız TÜM
maddeler bitince Sonuçlar → Soru raporu'nda verilir.

**Pulse'ta nerede:** `cardai/app.js renderQuiz()`, `submitQuizItem()` (10/10'da otomatik
`grade()`), `$('checkBtn').disabled=answered<10`.

---

## 6. Sonuçlar ekranı

Doküman akışında, sola hizalı, sabit maksimum genişlik. Bileşenler:

1. Başlık — varyanta göre değişir ("Değerlendirme Tamamlandı" / "Vaka Raporu").
2. **Zayıf alanlar** çipleri (başlığın hemen altında, ayrı bölüm değil) — düşük performanslı
   alanlara tıklayınca İnceleme'de ilgili maddeye açılır.
3. **Özet şeridi** — bkz. `components/results-summary.html`.
4. **Alan bazlı performans** — kavramsal alan (objective) başına yüzde + çubuk.
5. **Madde raporu** tablosu — satır tıklanınca genişler: soru, verilen yanıt, doğru yanıt,
   ✓/✗, açıklama (bu, TEK geri bildirim kaynağıdır — değerlendirme sırasında gösterilmez).
6. Eylemler — "Modülden Çık" (LMS bitirme, yalnız Değerlendirme varyantında), "Tekrar dene",
   "Yeni örneklem", "İlgili modda çalış".

**Sonuçlar varyantı (quiz/case) açıkça seçilir:** Aynı şablon iki farklı veri kümesiyle
doldurulur ama HANGİ varyantın gösterildiği düğme etiketinden değil, ÇAĞRI NOKTASINDAN
bellidir — mod kartındaki "Sonuçları gör" düğmesi doğrudan `Results.show('quiz')` çağırır
(genel `showView('results')` değil). Bu, "hangi puan gösteriliyor" belirsizliğini ortadan
kaldırır; vaka oturumu puanı LMS'ye YAZILMAZ, yalnız gösterilir (bkz. docs/05).

**Pulse'ta nerede:** `cardai/index.html` `#resultsView`; `cardai/features.js renderResults()`,
`rowsFor/domainRows/reportRows`; `cardai/app.js` mod kartı CTA'sı
`btn.dataset.view==='results'?window.CardAResults.show('quiz'):showView(btn.dataset.view)`.

---

## 7. Hakkında

Sırasıyla: **Geliştiriciler** (3 lacivert sütun, kişi başına pill rozet) → **Kurum** kartı
(mühür + açıklama + bilimsel kanıt cümlesi/atıf) → **Kaynaklar** (kılavuz/veri seti kartları)
→ **Sınırlılıklar** kutusu → "← Geri".

**Neden Geliştiriciler en üstte:** Aile genelinde şeffaflık ilkesi — kimin, hangi rolde
katkı sağladığı, ürünü kullanmadan ÖNCE görülebilir olmalı. Ünisis profiline bağlantı
verilir ama açıklama cümlesi YAZILMAZ (gereksiz metin, pill rozet zaten bağlamı taşır).

**Pulse'ta nerede:** `cardai/index.html` `#aboutView`; `cardai/features.js renderAbout()`,
`institutionCard()`, `referenceCards()`, `limitationsBox()`; veri kaynağı `cardai/sources.json`.

**Geliştirici rolleri ve yer tutucular (Tur 4/5):** Geliştirici grupları üç ROLE ayrılır —
"Yazılım geliştirme, öğretim ve ölçme-değerlendirme tasarımı" / "Öğretim Tasarımı ve Tıbbi
Danışmanlık" / "Tıbbi İçerik Validasyonu". Üçüncü grup, isimleri henüz netleşmemiş kişiler için
yer tutucu isimlerle (Pulse: "Doç. Dr." × 4, bağlantısız) doldurulabilir; bu durumda kişi
baş harfi avatarı BOŞ bırakılmaz, üç nokta ("…") gösterilir (gerçek bir isim baş harfi ile
karıştırılmasın diye). **Neden:** Şeffaflık ilkesi (yukarı bakınız) isim netleşmeden UYDURULMASINI
gerektirmez — ünvan + rol bilgisini vermek ("bu rolü dolduracak N kişi var, kimlikleri
netleşiyor") uydurma bir isimden daha DÜRÜSTTÜR; "…" avatarı bunun görsel karşılığıdır (gerçek
bir kişinin baş harfi DEĞİL, "beklemede" sinyali). Bu, docs/07 "Terim tablosu" notundaki
"UYDURMAYIN, kullanıcıdan isteyin" ilkesiyle aynı mantığı izler.

**Pulse'ta nerede:** `cardai/sources.json credits[]` — üçüncü grup rolü "Kullanıcı kabul
testleri" (öğrenci placeholder'ları) yerine "Tıbbi İçerik Validasyonu" (4× `{"name":"Doç.
Dr."}`, `url` YOK) oldu; ikinci grubun rolü "Öğretim tasarımı ve tıbbi validasyon" →
"Öğretim Tasarımı ve Tıbbi Danışmanlık" olarak yeniden adlandırıldı (validasyon sorumluluğu
üçüncü gruba taşındığı için). `cardai/features.js initials(name)` — `.slice(0,2)` boş
dönerse (`url`siz/başlıksız isim) `||'…'` ile boş baş harf avatarını "…" yapar. Sınırlılıklar
başlığı "Sınırlılıklar" → "Validasyon, sınırlılıklar ve sorumluluk" (bkz. yukarıdaki
validasyon ifadesi politikası).

---

## 8. Dialoglar

Bkz. `components/dialog.html` — çıkış onayı, tam ekran önerisi, örneklem onayı, ilerleme
sıfırlama. Ortak kural: native `<dialog>`, `window.confirm()`/`alert()` KULLANILMAZ.

---

## 9. İkincil ekranlara geçiş TEK bir kapıdan yapılır (diff'te bulunan ek kural)

**Kural:** Değerlendirme (veya başka bir "yanıt kaybı riski taşıyan") moddan HERHANGİ bir
ikincil ekrana (Hakkında, Eğitici, mod seçimi…) geçiş, tek bir merkezi geçiş fonksiyonundan
(`leaveFor`/eşdeğeri) yapılır — asla doğrudan görünüm değiştirme çağrısıyla (`showView`
eşdeğeri) BYPASS EDİLMEZ. Aksi hâlde çıkış onay dialogu (bkz. §8) yalnız BAZI çıkış
yollarında tetiklenir, bazılarında (ör. "Hakkında" düğmesi) SESSİZCE atlanır — kullanıcı
için tutarsız bir davranış.

**Neden bu kural eklendi:** Bu, brifin Tur 1 listesinde AÇIKÇA yer almayan ama
`git diff -- cardai` incelemesinde bulunan bir düzeltmedir: `$('aboutBtn')` düğmesinin
tıklama işleyicisi `C.showView('about')` (çıkış onayını ATLAYAN doğrudan çağrı) yerine
`C.leaveFor('about')` (merkezi kapı — Değerlendirme modundaysa önce onay dialogu açar)
olarak değiştirildi. Genel kural: bir ürüne yeni bir "üstten erişilen ikincil ekran"
düğmesi eklerken, o düğmenin çıkış onayı gerektiren MEVCUT merkezi geçiş fonksiyonunu
çağırdığından emin olun — yeni bir kısayol/bypass YOLU açmayın.

**Pulse'ta nerede:** `cardai/features.js` — `$('aboutBtn').addEventListener('click',
()=>C.showView('about'))` → `()=>C.leaveFor('about'))` (Tur 1). Merkezi kapı:
`cardai/app.js leaveFor(target)` — `if(state.activeView==='quiz'&&target!=='quiz'){
pendingExit=target;$('quizExitDialog').showModal();return;}`.

---

## 10. En iyi puan — mod başına kalıcı (v1.6 — yeni)

**Kural:** Uygulama ve Değerlendirme modlarının HER BİRİ için, o moddaki en yüksek toplam
puan cihaz/tarayıcı bazında KALICI olarak saklanır ve iki yerde gösterilir: (1) mod seçim
kartında ("En iyi puan: N" / henüz denenmediyse "Henüz denenmedi"), (2) sonuç ekranında, o
oturumun puanının YANINDA ("Bu deneme: N · En iyi puan: N"). Bu değer **SCORM kaydının
(`suspend_data`) parçası DEĞİLDİR** — yalnız `localStorage`'da, kayıt şemasından TAMAMEN
AYRI bir anahtar altında tutulur (bkz. docs/05-kayit-ve-scorm.md §4). Yeni örneklem/oturum
sıfırlama bu değeri SİLMEZ — yalnız YENİ bir deneme önceki en iyiyi GEÇERSE güncellenir.

**Neden:** Öğrenci birden çok kez aynı modu deneyebilir (yeni örneklem, tekrar dene); "en son
puan" tek başına ilerlemeyi yansıtmaz — bir öğrenci iyi bir denemeden sonra merak edip tekrar
denerse ve bu seferki daha düşükse, yalnız SON puanı göstermek gerileme izlenimi verir. En iyi
puanı AYRICA ve KALICI göstermek, motivasyonu SON denemenin şansına bağlı bırakmaz. Bunun
SCORM kaydına DEĞİL yalnız `localStorage`'a yazılması bilinçlidir: bu bir LMS
başarı/geçme kaydı DEĞİL, tarayıcı içi bir "kişisel rekor" konforu — docs/05 §4'teki
"localStorage yalnız konfor tercihleri için" ayrımıyla AYNI mantığı izler (LMS'nin kendi
`passed` durumu docs/05 §5'teki AYRI ve dokunulmaz kuralla korunur; en iyi puan bunun YERİNE
geçmez, ona EK bir yerel konfordur).

**Opaca'da nerede:** `src/core/store.tsx` 41 (`bestScore: { practice: number; assessment:
number }` state alanı), 68 (`bestScore: { practice: 0, assessment: 0 }` başlangıç), 71
(`BEST_SCORE_KEY = 'opaca.bestScore'`), 73–80 (`loadBestScore()` — `localStorage`'dan
`try/catch` ile okuma, erişilemezse `{practice:0,assessment:0}`'a düşer), 219–226
(`case 'setResults'` — "A4: oturum bitince mod başına en iyi toplam puanı güncelle";
`prevBest`/`bestScore = agg.total>prevBest ? {...} : s.bestScore`; yalnız practice/assessment,
`learn` modu bu dispatch'i hiç yapmaz), 386 (`useReducer(reducer, initialState, (init) =>
({...init, bestScore: loadBestScore()}))`), 393–398 (`useEffect` — `state.bestScore`
değiştiğinde `localStorage.setItem(BEST_SCORE_KEY, JSON.stringify(state.bestScore))`,
`try/catch` ile sarılı). Gösterim: `src/screens/ModeSelectScreen.tsx` 54/66
(`bestScore={state.bestScore.practice}` / `.assessment`), 117–119 (`{bestScore>0 ? <>En iyi
puan: <b>{bestScore}</b></> : 'Henüz denenmedi'}`); `src/screens/ResultsScreen.tsx` 132
(`Bu deneme: {total} · En iyi puan: {state.bestScore[isAssessment?'assessment':'practice']}`).
