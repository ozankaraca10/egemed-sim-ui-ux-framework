# 05 — Kayıt ve SCORM

SCORM 1.2 tek SCO paketleme, `suspend_data` 4096 bayt bütçesi, şema sürümü + içerik
sürümü imzası (`cv`), localStorage'ın sınırlı kullanımı, LMS `passed` durumunun korunması.

---

## 1. SCORM 1.2, tek SCO

**Kural:** Paket tek bir SCO (Sharable Content Object) olarak paketlenir; `imsmanifest.xml`
kökte, `adlcp:scormtype="sco"`, bağıl `index.html` giriş noktası, `adlcp:masteryscore`
geçme eşiğini taşır.

**Neden:** Tek SCO, LMS entegrasyonunu basitleştirir (tek "launch" noktası, tek ilerleme/puan
kaydı) ve tek HTML + tek ZIP paketleme mimarisiyle uyumludur — birden çok SCO, her biri için
ayrı `suspend_data`/durum yönetimi gerektirir ki bu, üç ürünün de aynı basit modeli
paylaşmasını zorlaştırır.

**Pulse'ta nerede:** `cardai/imsmanifest.xml` — `<resource identifier="EGEMED_SCO"
type="webcontent" adlcp:scormtype="sco" href="index.html">`,
`<adlcp:masteryscore>80</adlcp:masteryscore>`.

---

## 2. `suspend_data` 4096 bayt bütçesi

**Kural:** Kayıt (oturum kimlikleri, yanıtlar, gönderim durumları, izlenen süre, tercih
bitleri…) TEK bir kompakt JSON'a serileştirilip `cmi.suspend_data`'ya yazılır; bu string
UTF-8 kodlandığında **4096 baytı geçemez**. Bütçeyi aşan bir yazma girişimi
**engellenir** (önceki geçerli kayıt EZİLMEZ) ve hata bildirilir.

**Neden:** SCORM 1.2 standardının `cmi.suspend_data` alanı 4096 karakterle sınırlıdır
(çoğu LMS bu sınırı sert biçimde uygular). Sınırı aşan bir yazma denemesi bazı LMS'lerde
sessizce kırpılır (veri bozulur) — bu nedenle ürün kodu YAZMADAN ÖNCE boyutu ölçer ve
aşımda yazmayı reddeder; kullanıcı önceki geçerli durumunu kaybetmez.

**Pulse'ta nerede:** `cardai/scorm.js` — `if(new TextEncoder().encode(serial).length>4096){...return false;}`
(yazma tarafı) ve `if(new TextEncoder().encode(raw).length>4096)return blockResume(...)`
(okuma tarafı — 4096'dan büyük bir kayıt okunursa "önceki veri korundu" ile güvenli
başlangıç görünümüne düşülür). Alan adları TEK harfle kısaltılır (`m,t,p,f,v,c,q,j,k,u,w,d,h,o,z,e,y,g,r,cv`)
— insan-okunur JSON anahtarları yerine bayt tasarrufu için.

---

## 3. Şema sürümü + içerik sürümü imzası (`cv`)

**Kural:** Kayıt şemasının kendi SÜRÜM numarası (`version`) VE ayrıca içeriğin (madde
bankası/permütasyon algoritması) kendi SÜRÜM imzası (`cv`) AYRI AYRI taşınır. Şema sürümü
değişmeden içerik (ör. seçenek permütasyon algoritması) değiştiğinde, `cv` uyuşmazlığı
algılanır ve YALNIZ içerikle doğrudan bağlı oturumlar (örneklenen madde kimlikleri,
yanıtlar, en iyi deneme) TAZELENİR — gözlem süresi, kontrol listesi, araç kullanımı gibi
İÇERİKTEN BAĞIMSIZ ilerleme KORUNUR.

**Neden:** docs/03-mod-akisi-ve-pedagoji.md §2'deki seçenek permütasyon değişikliği (Tur 1)
tam olarak bu senaryoyu doğurdu: eski kayıtlardaki saklı yanıt İNDEKSLERİ (ör. "seçenek 2'yi
işaretledim"), yeni permütasyon algoritmasında AYNI indeksin FARKLI bir seçeneği gösterebilir
— eski kayıt sessizce yanlış yorumlanırsa, öğrencinin daha önce verdiği DOĞRU bir yanıt
şimdi YANLIŞ gibi görünebilir (veya tersi). `cv` imzası bu riski öngörür: içerik/algoritma
değiştiğinde YALNIZ etkilenen (madde indeksine bağlı) veriler atılır; gözlem süresi gibi
indeksten bağımsız ilerleme ise korunur — kullanıcı sıfırdan başlamaz.

**Pulse'ta nerede:** `cardai/state.js` `encode(s)` — `cv:7` alanı eklendi (Tur 1; sayı,
`curriculum.js`'teki `PulseCurriculum.version`'a karşılık gelir). `decode(raw)`:
```js
if (raw.cv !== 7) {
  s.caseSession = sample('case'); s.quizSession = sample('quiz');
  s.bestAttempt = null; s.bestCaseAttempt = null; s.returnContext = null;
  s.currentCase = 0; s.quizPage = 0;
  // s.viewed (gözlem süresi), s.checklist, s.features BURADA SIFIRLANMAZ — korunur.
}
```
Şema sürümü (`version:6`) İÇERİK imzasından (`cv:7`) AYRI bir alandır — biri kayıt
BİÇİMİNİN, diğeri kayıt İÇERİĞİNİN sürümüdür; ikisini karıştırmak (ör. içerik değiştiğinde
şema sürümünü artırmak) eski kayıtları GEREKSİZ YERE geçersiz kılabilir (biçim aslında
değişmemiştir).

---

## 4. localStorage — yalnız konfor tercihleri

**Kural:** `localStorage` YALNIZ tarayıcı/cihaz bazlı KONFOR tercihleri için kullanılır
(ör. "tam ekran önerisini bir daha gösterme"); asla OTURUM İLERLEMESİ, YANIT veya PUAN
için kullanılmaz — bunlar SCORM API varsa `cmi.suspend_data`'ya, yoksa (bağımsız/offline
kullanım) yine `localStorage`'a ama AYRI ve resmi bir anahtarla (kayıt şemasının kendisi)
yazılır.

**Neden:** localStorage cihaza/tarayıcıya özeldir — farklı bir cihazda veya gizli sekmede
sıfırdan başlar. Bu, "konfor" tercihleri için kabul edilebilir bir sınırlamadır (öneri bir
dahaki sefere tekrar sorulur, zararsız) ama OTURUM VERİSİ için kabul edilemez (öğrenci
ilerlemesini kaybetmiş gibi hisseder). Bu ayrım netleştirilmezse, geliştiriciler yanlışlıkla
gerçek ilerleme verisini "geçici" bir depoya yazabilir.

**Pulse'ta nerede:** Konfor tercihi örneği: `cardai/landing.js`
`FS_PROMPT_KEY='pulse.fsPromptDone'` (bkz. `snippets/fullscreenPrompt.js`) — bu SCORM
kaydına YAZILMAZ. Oturum verisi: `cardai/scorm.js` `KEY`/`LEGACY_KEYS` (bağımsız kullanım
localStorage fallback'i) — SCORM API'siyle AYNI serileştirilmiş JSON'u taşır, konfor
tercihinden TAMAMEN farklı bir anahtar altında.

---

## 5. LMS `passed` durumunun korunması

**Kural:** LMS'nin daha önce kabul ettiği `passed` (geçti) durumu, kullanıcı YEREL
ilerlemesini tamamen sıfırlasa BİLE korunur. Uygulama, LMS'nin kendi başarı kaydını
sıfırlama YETKİSİNE sahip DEĞİLDİR — yalnız yerel (tarayıcı) veriyi temizleyebilir.

**Neden:** Bir öğrenci bir kez geçme eşiğini karşılayıp LMS'ye `passed` yazdırdıktan sonra,
"yerel verilerimi temizle" gibi bir konfor eylemi (ör. cihaz değişimi, tarayıcı önbelleği
sorunu) bu BAŞARIYI GERİ ALMAMALIDIR — LMS tarafı kayıt, tek doğruluk kaynağıdır ve yerel
istemci tarafından geri alınabilir OLMAMALIDIR (aksi hâlde bir öğrenci yanlışlıkla kendi
transkriptini bozabilir).

**Pulse'ta nerede:** `cardai/scorm.js` `save()`:
```js
const status = state.passed || previousStatus === 'passed' ? 'passed'
  : state.assessed ? 'failed' : 'incomplete';
```
`previousStatus`, `load()` sırasında LMS'den (`cmi.core.lesson_status`) OKUNUR ve yerel
`resetAll()` çağrılsa bile bu değişken (oturum belleğinde) `passed` ise durum yine `passed`
yazılır. `cardai/KULLANIM.md`: "LMS'nin daha önce kabul ettiği `passed` durumu, tam yerel
sıfırlamadan sonra da korunur; uygulama LMS başarı kaydını sıfırlamaz."
