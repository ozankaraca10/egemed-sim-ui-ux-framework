# 03 — Mod Akışı ve Pedagoji

Bu belge ailenin en kritik davranış kurallarını taşır: kilit/öneri ayrımı, gönderim
kuralları, örneklem yönetimi, otomatik değerlendirme, seçenek permütasyonu, stem/ipucu
sızıntısı ve geri bildirim yapısı. Bunlar Pulse'ta 18 Eylül 2026'daki **Tur 1** revizyonunda
netleştirilmiş kurallardır (bkz. reference/pulse/ klasöründeki turlardan doğrulama:
`qa/mode_flow_audit.mjs` F1/F4/F5/F6/F7/F8, `BUILD.md` "Uygulama/değerlendirme modu
düzeltmeleri" kaydı, `cardai/KULLANIM.md`).

---

## 1. Kilit ≠ öneri (en önemli kural)

**Kural:** Modlar arasında bir "önerilen sıra" olabilir (İnceleme → Uygulama →
Değerlendirme), hatta mod seçim kartlarında bu sıra "kilitli" olarak GÖRSEL olarak
işaretlenebilir — ama **gönderim yolları (bir yanıtı işaretleyip göndermek) hiçbir zaman
bu kilide bağlı olamaz.**

**Neden:** Önceki tasarımda `submitQuizItem()`/`grade()`/`caseCheck` gönderim fonksiyonları
`derivePrerequisites().quizUnlocked`/`casesUnlocked` kontrolü yapıyordu — yani bir öğrenci
her nasılsa (geri/ileri gitme, doğrudan URL, yeniden yükleme sırası vb.) kilitli bir moda
ulaşırsa, orada bir yanıt işaretleyip GÖNDEREMİYORDU (buton sessizce hiçbir şey yapmıyordu).
Bu, kullanıcıyı açıklanmayan bir şekilde "kilitli" tutan gizli bir ikinci kilit katmanıydı —
kullanıcı arayüzde görünen tek kilit (mod kartındaki) ile gerçek davranış arasında bir
TUTARSIZLIK yaratıyordu. Çözüm: kilit YALNIZ mod seçim ekranındaki YÖNLENDİRMEDE kalır
(hangi modu önerdiğimiz, kilitli kartın CTA'sının nereye gittiği); TÜM gönderim
fonksiyonlarından ön koşul kontrolü kaldırılır.

**Pulse'ta nerede:** `cardai/features.js` — `$('caseCheck')` tıklama işleyicisinden
`if(!C.derivePrerequisites().casesUnlocked)return;` satırı KALDIRILDI (Tur 1).
`cardai/app.js` — `submitQuizItem()` ve `grade()` fonksiyonlarından aynı şekilde
`if(!derivePrerequisites().quizUnlocked)return;` kontrolleri KALDIRILDI.
Mod kartındaki YÖNLENDİRME (görsel kilit + "Kilidi aç → X'e git" CTA'sı) `renderModes()`
içinde AYNEN kalır — bu, kaldırılan şey değil.

---

## 2. Seçenek permütasyonu — madde kimliğinden tohumlanan, deterministik-görünmeyen sıra

**Kural:** Çok seçenekli bir maddenin doğru şıkkının konumu, maddeler arasında
**tahmin edilebilir bir örüntü** (ör. sıralı A,B,C,D,E döngüsü) izlememelidir; ama aynı
madde her açıldığında AYNI sırayı üretmelidir (tekrarlanabilirlik/tutarlılık).

**Neden:** Eski uygulamada doğru şık `correct = i % 5` ile hesaplanıyordu — havuzdaki
i'inci maddenin doğru şıkkı A,B,C,D,E,A,B,C,D,E… diye döngüsel ilerliyordu. Bu, içeriği
okumadan yalnızca madde sırasını takip ederek doğru şıkkı tahmin etmeyi mümkün kılan bir
SINAV GÜVENLİĞİ zafiyetiydi. Çözüm, madde kimliğinden (id) **hash tabanlı bir sözde-rastgele
permütasyon** türetmektir: aynı id her zaman aynı diziyi üretir (derleme/önizleme/paketleme
arasında tutarlı), ama maddeler arasında ardışık bir örüntü YOKTUR (bkz.
`snippets/seededPermutation.js` — tam algoritma ve kod).

**Pulse'ta nerede:** `cardai/curriculum.js` `seededPermutation(id)` + `makeItems()`
(Tur 1). Kabul testi (dolaylı): `qa/independent_content.mjs` doğru şık pozisyon dağılımını
kontrol eder; algoritmanın kendisi `snippets/seededPermutation.js`'te tam olarak
belgelenmiştir.

---

## 3. Ritim/tanı maddelerinde stem, bulguyu anlatmaz

**Kural:** Bir maddenin klinik senaryosu (stem), sorunun cevabını (tanı/sınıf) DOĞRUDAN
tarif eden cümleler İÇERMEZ. "Ritim hangisidir?" tipi bir soru sorulacaksa, stem'de
"düzenli, dar QRS'li bir ritim var; her kompleksten önce aynı yönlü bir P dalgası var"
gibi tanıyı ele veren tarifler YAZILMAZ — bunun yerine nötr bir cümle kullanılır: "Eşzamanlı
üç derivasyonlu kayıt aşağıda gösteriliyor." Kanıt, KAYITTA (kanvasta) gösterilir; METİNDE
tekrarlanmaz.

**Neden:** Stem'in bulguyu anlatması, öğrencinin kaydı hiç incelemeden, yalnızca metni okuyarak
soruyu cevaplamasına izin verir — bu, ölçmek istediğimiz beceriyi (kayıttan bulgu çıkarma)
tamamen atlar. Nötr stem, öğrenciyi kayda bakmaya ZORLAR.

**Pulse'ta nerede:** `cardai/curriculum.js` — `ddx_*`/`rhythmClass_*` `decisionId`'li
maddelerin stem'lerinde bulgu tarifleri "Eşzamanlı üç derivasyonlu kayıt aşağıda gösteriliyor."
nötr cümlesiyle DEĞİŞTİRİLDİ (Tur 1, 8+ madde). Kabul testi:
`qa/mode_flow_audit.mjs` "G4-answer-leak-regex" — `ddx_*`/`rhythmClass_*` maddelerinin
stem'inde `/Monitörde|izleniyor|dalga|QRS|kompleks|testere|kaotik|geniş|dar\b/i` deseni
ARANMAZ (regex eşleşirse test FAIL verir).

---

## 4. Arayüz ipucu sızdırmaz

**Kural:** (a) Klavye kısayolları YALNIZ ilgili inceleme/oynatma görünümünde çalışır — bir
Değerlendirme sorusundayken "1" tuşuna basmak İnceleme moduna GEÇMEMELİDİR (kilitli bir
moda kısayolla "kaçış" sağlanmamalı, ayrıca yanlışlıkla mod değişimi önlenir). (b) Vaka/soru
kanvasının DOM'unda (`data-*` özniteliklerinde) o maddenin hangi MOD/TANI ile ilişkili
olduğunu açık eden bir bilgi BULUNMAZ — tarayıcı geliştirici araçlarını açan bir öğrenci
`data-mode="af"` gibi bir öznitelik görüp cevabı DOM'dan okuyabilmemelidir.

**Neden:** İki farklı sızıntı yüzeyi kapatılıyor: davranışsal (kısayol → kaçış) ve yapısal
(DOM özniteliği → cevap okuma). İkisi de "kullanıcı arayüzü normal şekilde kullanmadan
bilgi edinme" sınıfına girer.

**Pulse'ta nerede:**
- (a) `cardai/features.js` global `keydown` dinleyicisi: `inSim = ['sim','tutorial'].includes(state.activeView)`
  kontrolü eklendi; `f` tuşu HER YERDE çalışır (tam ekran evrensel bir kısayoldur) ama
  `1-9`/`[`/`]`/`c`/ok tuşları yalnız `inSim` iken işlenir — `if(!inSim)return;`.
- (b) `cardai/app.js` `drawItemECG()` — satır sonunda `cv.dataset.mode=item.ecg.mode;`
  ataması **KALDIRILDI**; yalnız `cv.dataset.itemId` ve `cv.dataset.leads` kalır (madde
  kimliği ve derivasyon seçimi "ipucu" değildir, mod/tanı bilgisi ipucudur).

---

## 5. Örneklem ve onay

**Kural:** "Yeni örneklem al" / "Oturumu yeniden başlat" gibi eylemler mevcut yanıtları
SİLER. En az bir yanıt işaretlenmiş VEYA gönderilmişse, eylemden önce bir onay dialogu
gösterilir; hiç dokunulmamış "temiz" bir oturumda onaysız doğrudan çalışır.

**Neden ve tam kod:** bkz. `snippets/requestResample.js` üst yorum bloğu.

**Pulse'ta nerede:** `cardai/app.js requestResample(section, action)`,
`pendingResample`, `#resampleDialog` (Tur 1).

---

## 6. Otomatik değerlendirme (10/10'da)

**Kural:** Değerlendirme modunda son maddenin (oturum boyutu kadarının) yanıtı
gönderildiğinde, kullanıcının AYRICA bir "Değerlendir" düğmesine basmasına GEREK KALMADAN
değerlendirme otomatik tamamlanır ve sonuç ekranı açılır. Alt araç çubuğundaki manuel
"Yanıtları değerlendir (n/toplam)" düğmesi, tüm maddeler gönderilene kadar `disabled` kalır
(erken/eksik değerlendirmeyi engellemek için) ama TAMAMLANDIĞINDA zaten otomatik akış
devreye girdiği için manuel düğmeye basmak nadiren gerekir (ör. geri gidip tekrar ileri
gelindiğinde).

**Neden:** Kullanıcı 10/10 maddeyi bitirdiğinde "şimdi ne yapmalıyım" belirsizliğini
ortadan kaldırır — son gönderim = tamamlanmış oturum, ekstra bir tıklama beklenmez.

**Pulse'ta nerede:** `cardai/app.js` `submitQuizItem()`:
`if(state.quizSubmitted.every(Boolean)){grade();return;}` — son gönderimden hemen sonra
`grade()` çağrılır (Tur 1); `$('checkBtn').disabled=answered<10` (manuel düğme kilidi).

---

## 7. Geri bildirim yapısı (doğru/yanlış + çeldirici açıklaması)

**Kural:** Formatif (Uygulama) ve sumatif (Değerlendirme) geri bildirim ZAMANLAMASI
FARKLIDIR:
- **Uygulama:** her madde gönderildiğinde AYNI kartta anlık geri bildirim — büyük ✓/✗
  ikonu, "Yanıtınız: X" / "Doğru yanıt: Y" (yanlışsa), doğru şıkkın açıklaması, yanlışsa
  EK olarak "Seçtiğiniz seçenek neden değil: …" (yalnız seçilen çeldiricinin açıklaması —
  diğer 3 çeldiricinin açıklaması BURADA gösterilmez).
- **Değerlendirme:** madde gönderiminde geri bildirim YOK; TÜM maddeler bitince Sonuçlar →
  Madde raporu satırında, genişletildiğinde, aynı yapı (soru + verilen yanıt + doğru yanıt +
  açıklama) gösterilir.

**Neden:** bkz. `components/feedback.html` üst yorum bloğu (bilişsel yük azaltma) ve
docs/02-ekranlar.md §5 (sumatif ölçüm bütünlüğü).

**Pulse'ta nerede:** `cardai/features.js caseFeedbackMarkup(item,answer)` (Uygulama, anlık);
`cardai/app.js optionFeedback(item,answer)` (TÜM seçeneklerin açıklamasını listeleyen,
YALNIZ Sonuçlar ekranında kullanılan ayrı fonksiyon).

---

## 8. Başarı tanımı

**Kural:** "Başarı", tanımlı eşiklerin TAMAMININ karşılanmasıyla olur (ör. Pulse'ta: tüm
İnceleme maddelerinin gözlem süresi eşiği + Uygulama oturumunun tamamı gönderilmiş + en az
bir Değerlendirme denemesi geçme eşiğinin üzerinde). Modlar arasında GEZİNTİ serbesttir —
başarı yalnız eşiklerin durumuna bakar, ziyaret SIRASINA bakmaz. Yanıtlar istemci kodunda
görülebilir/değiştirilebilir; bu bir güvenlik sınırı OLUŞTURMAZ (eğitim amaçlı düşük
riskli bir uygulamadır — bu sınırlama kullanıcıya açıkça belirtilir).

**Pulse'ta nerede:** `cardai/state.js derive(s)` — `simComplete`, `casesComplete`,
`casesUnlocked`, `quizUnlocked` kapıları; `cardai/KULLANIM.md` "Bu eşikler öğretim akışı
kurallarıdır; klinik yeterlilik veya güvenli sınav ölçümü değildir" notu.

---

## 9. İçerik kalite kuralları (madde bankası QC döngüsü)

Bu bölüm, dış bir kalite kontrol (QC) raporundan gelen düzeltmelerin madde bankasına nasıl
işlendiğini ve bu süreçte netleşen **ürün-bağımsız** içerik kurallarını taşır (Pulse'ta
Tur 4 — 21 Eylül 2026: `EGEMED_PULSE_Kardiyoloji_QC_Raporu.docx`, 55 maddelik dış kardiyoloji
QC raporu, 13 yeni bağlama özel seçenek bankası + 6 banka yeniden yazımı + 35 madde satırı
düzeltmesi).

### 9.1 Yönetim/yaklaşım maddeleri bağlama göre bankalanır

**Kural:** "Bu hastada öncelikli yaklaşım nedir?" tipi bir maddenin doğru seçeneği ve dört
çeldiricisi, TEK bir genel "acil değerlendirme" şablonundan bütün klinik durumlara
KOPYALANMAZ. Seçenek bankası, maddenin anahtar hemodinamik durumuna (stabil / instabil /
arrest) VE klinik bağlamına (asemptomatik tarama vs. semptomlu, ilk atak vs. tekrarlayan)
göre AYRI yazılır.

**Neden:** Tek bir "hemen acil servise sevk et / hemen tedavi et" şablonunun her ritim
bozukluğuna kopyalanması, öğrenciye YANLIŞ bir genel kural öğretir ("her anormal ritim
= acil müdahale") ve asıl ölçülmek istenen beceriyi (duruma göre triyaj) atlar. Asemptomatik
tesadüfi bir dal bloğu ile nabızsız VF arresti AYNI "yaklaşım" seçenek setini paylaşamaz;
her ikisi de kendi klinik mantığını yansıtan ayrı bir bankaya ihtiyaç duyar.

**Pulse'ta nerede:** `cardai/curriculum.js` — dış QC raporunun `urgent` bankasından türetilen
13 yeni bağlama özel banka: `arrestVf`, `arrestPulseCheck`, `unstableVt`, `stableAf`,
`stableSvt`, `stableAt`, `sinusTachApproach`, `incidentalBbb`, `routineNormal` (`bank(id,
objective, [[option, explanation], ...])` çağrıları). Her banka kendi klinik mantığına özgü
doğru seçenek + 4 bağlamsal çeldirici taşır (ör. `stableAf` "Her AF acil kardiyoversiyon
gerektirir" çeldiricisini kullanırken `arrestVf` "Senkronize kardiyoversiyon uygulanır"
çeldiricisini kullanır — ikisi asla birbirinin yerine geçmez).

### 9.2 Vital/bağlam–anahtar tutarlılığı

**Kural:** Bir maddenin stem'inde verilen sabit vital profili (ör. TA 88/58 mmHg, soğuk
terli) hemodinamik instabilite gösteriyorsa, o maddenin bağlandığı seçenek bankasının
anahtarı (`decisionId`/banka kimliği) bu instabiliteyle TUTARLI olmalıdır — stabil bir
banka anahtarına instabil vitaller yazılamaz. Arrest bağlamında (nabız yok, bilinç kapalı)
fizyoloji/anatomi odaklı bir soru sorulacaksa, madde "gerçek zamanlı öncelik farklıdır" notu
ile (retrospektif eğitim analizi) etiketlenir — öğrenci maddeyi "arrest anında bu mu
sorulur?" yanılgısına düşmeden okur.

**Neden:** Vital bulgular ile seçilen doğru yaklaşım arasındaki bir tutarsızlık (ör. TA
88/58 + "rutin izlem yeterlidir" doğru şıkkı), maddeyi tıbben yanlış ve öğretici olarak
zararlı hâle getirir. Retrospektif not ise farklı bir sorunu çözer: VF/VT gibi arrest/instabil
modlarda bazı maddeler (ör. QRS morfolojisi, ileti fizyolojisi) gerçek zamanlı triyajdan BAĞIMSIZ
bilgi ölçer; bu maddelerin arrest bağlamında sorulması kafa karıştırmasın diye açık bir
uyarı eklenir.

**Pulse'ta nerede:** `cardai/curriculum.js` `retroNote(mode,bankId)` — `mode` `vf`/`vt` VE
`bankId` acil/gerçek-zamanlı bir karar bankası (`ACUTE` kümesi: `arrestVf`,
`arrestPulseCheck`, `unstableVt`, `firstStep_vt`, `firstStep_vf`, `urgent`, `vfFlow`, `noQrs`,
`vfNoP`, ... ) DEĞİLSE, "Retrospektif eğitim analizi: gerçek zamanlı öncelik ..." notu üretir;
`makeItems()` bu notu `item.note` alanına yazar. Görüntüleme: `cardai/app.js
caseCardMarkup(item,...)` — `item.note` varsa Olgu kartına `.case-note` sınıfıyla (amber sol
kenarlıklı kutu) eklenir; `cardai/styles.css .case-note`.

### 9.3 Görsel–metin uyumu

**Kural:** Bir maddede sorulan bulgu, gösterilen medyada (kayıt/görüntü) DOĞRULANABİLİR
olmalıdır — soru anterior bir bulgu soruyorsa gösterilen derivasyon grubu anteriordur, vb.
Her tanı/bölge için sabit bir derivasyon üçlüsü tanımlanır ve madde bu üçlüden türetilir;
madde yazarı derivasyonu serbestçe SEÇMEZ.

**Neden:** Soru metninin işaret ettiği bulgu ile ekranda gösterilen kayıt uyuşmuyorsa (ör.
"anterior STEMI" sorusu inferior derivasyon grubuyla gösteriliyorsa), madde kendi içinde
çelişkilidir ve kaydı okuyarak cevap vermeyi İMKANSIZ kılar — bu, docs/03 §3'teki "stem
bulguyu anlatmaz" kuralının doğal bir uzantısıdır: kayıt tek kanıt kaynağıysa, kaydın kendisi
doğru olmalıdır.

**Pulse'ta nerede:** `cardai/curriculum.js const leads={...}` — `stemi`(anterior):
`['V2','V3','V4']`, `inferior`: `['II','III','aVF']`, `lbbb`: `['I','V1','V6']` (ve diğer
her mod için sabit bir üçlü). `ecgMarkup()`/`drawItemECG()` derivasyon çip gruplarını (`groups`)
maddenin `item.ecg.leads` varsayılanından türetir — madde başına elle seçilmez.

### 9.4 Medya çeşitliliği

**Kural:** Aynı örüntü/tanı birden çok maddede kullanılıyorsa, her tekrarda kaydın
penceresi/başlangıç zamanı FARKLI olmalıdır — öğrenci "bu görsel = bu cevap" ezberine
kayamaz.

**Neden:** Bir örüntünün her göründüğü yerde AYNI piksel-birebir kayıt kullanılması, madde
havuzunu okumadan da (görsel ezberiyle) yanıtlanabilir hâle getirir — tam olarak docs/03 §2'nin
(seçenek permütasyonu) çözdüğü "tahmin edilebilirlik" sorununun görsel muadilidir.

**Pulse'ta nerede:** `cardai/curriculum.js makeItems()` — `mode==='pvc'` maddelerinde kayıt
başlangıcı (`ecg.start`) sabit değil, madde indeksine göre 7 farklı değerden seçilir:
`[.3,.6,.9,1.1,2.5,2.7,2.9][i%7]`; diğer modlarda da `.5+(i%5)*.08` ile başlangıç maddeler
arasında kaydırılır.

### 9.5 Ölçüm standardı notu

**Kural:** Bir maddede kullanılan ölçüm noktası, ilgili klinik kılavuzun standart ölçüm
noktasından FARKLIYSA (ör. model J+20 ms'de ölçüm yaparken kılavuz eşiği J noktasında
tanımlıyorsa), bu fark madde metninde AÇIKÇA belirtilir — öğrenci "neden bu değer farklı
okunuyor" belirsizliğine düşmez ve model sınırlılığı gizlenmez.

**Neden:** Sentetik bir modelin ölçüm yöntemi kılavuzdakiyle birebir aynı olmak zorunda
değildir (teknik/görsel nedenlerle farklılaşabilir) ama bu farkın SESSİZCE bırakılması,
öğrencinin kılavuz eşiğini yanlış bir ölçüm noktasıyla ilişkilendirmesine yol açar — bu da
klinik olarak yanlış bir alışkanlıktır.

**Pulse'ta nerede:** `cardai/curriculum.js` `bank("st20",...)`/`bank("st32",...)` seçenek
açıklamaları: "J+20ms bu modelin ölçüm noktasıdır; kılavuz tanı eşikleri J noktasındaki
sapmaya göre tanımlanır." — madde stem'i de aynı notu taşır ("sentetik ölçüm egzersizi;
kılavuz tanı eşikleri J noktasında değerlendirilir").

### 9.6 Tautolojik/çift geçerli seçenek yok

**Kural:** Bir maddenin doğru seçeneği, diğer seçeneklerden yalnız "daha iyi ifade edilmiş"
olmakla değil, AYIRT EDİCİ bir klinik/teknik ölçütle ayrılır; iki seçenek aynı anda "doğru
sayılabilir" durumda BIRAKILMAZ.

**Neden:** Çift geçerli (veya tautolojik — soruyu olduğu gibi tekrar eden) bir seçenek,
maddeyi ölçme aracı olarak geçersiz kılar: öğrenci hangi seçeneğin "daha doğru" sayıldığını
tahmin etmek zorunda kalır, bu da öğrenilen beceriyi değil şans faktörünü ölçer.

**Pulse'ta nerede:** Dış QC raporundaki (`EGEMED_PULSE_Kardiyoloji_QC_Raporu.docx`) 6 banka
yeniden yazımı (PVC sınıflaması, VT ilk yaklaşım, AF/flutter ilk yaklaşım, iskemi sınırı,
AF–PVC ayrımı, PVC açıklaması) bu kuralı ihlal eden seçenek çiftlerini ayırt edici bir ölçüte
göre yeniden yazdı; kontrol adımı §9.8'deki dış QC döngüsünün bir parçasıdır.

### 9.7 Kayıt imzası içerik sürümüne bağlı

**Kural:** Yerel/LMS kaydındaki içerik sürüm imzası (`cv`), madde bankasının kendi sürüm
numarasından (curriculum sürümü) OKUNUR — kayıt şemasının genel sürümünden (`version`) AYRI
tutulur. İçerik (madde bankası) her değiştiğinde bu imza artar; kayıt okunurken imza
eşleşmezse yalnız içerik-bağımlı veriler (oturumlar, en iyi denemeler, mevcut sayfa) tazelenir
— gözlem süresi, kontrol listesi ve araç kullanım sayaçları KORUNUR.

**Neden:** Madde bankası değiştiğinde (ör. QC düzeltmesiyle seçenek sırası/metni değişince)
eski bir kayıttaki seçenek indeksleri artık YANLIŞ bir seçeneği işaret edebilir — bu durumda
eski yanıtları göstermeye devam etmek güvenlik açısından yanlıştır (öğrenciye kendi vermediği
bir cevabı doğru/yanlış gösterebilir). Ama bu, öğrencinin gözlem ilerlemesini veya arayüz
tercihlerini sıfırlamayı GEREKTİRMEZ — yalnız içeriğe bağımlı veri tazelenir.

**Pulse'ta nerede:** `cardai/curriculum.js` `root.PulseCurriculum=freeze({version:8,...})`
— içerik değişince bu sayı artar (Tur 4'te 7→8). `cardai/state.js encode(s)` kayda `cv:
POOL.version` ekler; `decode(raw)` içinde `if(raw.cv!==POOL.version){s.caseSession=
sample('case');s.quizSession=sample('quiz');s.bestAttempt=null;s.bestCaseAttempt=null;
s.returnContext=null;s.currentCase=0;s.quizPage=0;}` — yalnız içerik-bağımlı alanlar
sıfırlanır, `s.viewed`/`s.checklist`/`s.features` (gözlem ve araç kullanımı) bu bloğun
DIŞINDADIR ve korunur. Bu, kayıt şemasının genel `version:6` alanından (docs/05) tamamen
AYRI bir imzadır.

### 9.8 Dış QC döngüsü (rapordan koda, doğrulanabilir adımlarla)

**Kural:** Dış bir QC raporundaki (xlsx/docx) düzeltmeler madde bankasına DOĞRUDAN elle
kopyala-yapıştır ile değil, şu doğrulanabilir zincirle uygulanır: (1) rapordaki her satır bir
"tam metin eşleşmesi" yama betiğine dönüştürülür — betik her değişiklik için kaynak dizedeki
eşleşme sayısını `assert`ler (0 veya >1 eşleşme = hata, betik durur); (2) yama uygulandıktan
sonra içerik bir Node `vm` bağlamında (tarayıcısız) yüklenip yapısal bütünlük/dağılım
kontrolleri çalıştırılır; (3) gerçek tarayıcıda uçtan uca kabul testleri (Playwright)
çalıştırılır; (4) QC ekibinin tekrar gözden geçirmesi için dışa aktarma paketi (madde
başına soru/5 seçenek/doğru harf/açıklama) YENİDEN üretilir.

**Neden:** Büyük bir madde bankasında (400 madde) elle yapılan bir metin değişikliği, aynı
alt dizeyi paylaşan başka bir satırı da SESSİZCE değiştirebilir veya hiç eşleşmeyip yama
uygulanmamış görünebilir. Tek-eşleşme `assert`i bu iki hatayı da derleme zamanında yakalar
(sessiz başarısızlık YOKTUR). `vm` doğrulaması, tarayıcıyı hiç açmadan (hızlı) yapısal
hataları (eksik alan, bozuk JSON, harf dağılım bozukluğu) yakalar; tarayıcı testleri ise
gerçek DOM/etkileşim katmanını doğrular. Dışa aktarma paketinin yenilenmesi, QC ekibinin
"düzeltme gerçekten uygulandı mı" sorusunu koda bakmadan, kendi okudukları formatta
doğrulamasını sağlar.

**Pulse'ta nerede:** Yama betiği kalıbı (`scratchpad/qc_patch.py`): `rep(old,new,count=1)` —
`src.count(old)` `count`'a eşit değilse `assert` hatası fırlatır; `row(stem_prefix,new_row)`
— tek bir yazarlık satırını regex ile bulup TEK eşleşme garantisiyle değiştirir. Yapısal
doğrulama: `qa/independent_content.mjs` "T04-unique-content-and-position-distribution" — madde
havuzunu `vm.runInContext` ile yükleyip her havuzda 200/200 benzersiz metin, 200/200 benzersiz
mod:karar kombinasyonu ve doğru şık pozisyon dağılımının 5 seçenekte eşit (40/40/40/40/40)
olduğunu doğrular. Tarayıcı testleri: `qa/mode_flow_audit.mjs`. Dışa aktarma paketi:
`qa/export_items.mjs` — `cardai/`i yalnız OKUYUP `qa/evidence/export/`e madde başına A–E seçenek
harfleri + doğru harf/metin + kayıt görüntüsü üreten, tek komutla (`node
qa/export_items.mjs`) tekrar üretilebilir bir betik.
