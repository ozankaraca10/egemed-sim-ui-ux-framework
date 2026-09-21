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
