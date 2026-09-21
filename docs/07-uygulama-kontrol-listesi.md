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
