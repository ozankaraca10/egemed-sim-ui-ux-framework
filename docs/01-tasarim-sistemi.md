# 01 — Tasarım Sistemi

EGEMED SIM FRAMEWORK'ün görsel temeli. Bu belge **ürün-bağımsızdır**: Pulse, Ausculta ve
Opaca aynı token'ları, aynı tipografi ölçeğini ve aynı marka bloğu kalıbını kullanır.
Değerler `tokens/family-tokens.css` dosyasında tek kaynak olarak tutulur; bu belge o
dosyanın **neden**lerini açıklar.

Kaynak taban: reference/pulse/YONERGE_URUN_AILESI_UIUX_PLANI.md §0 (Ausculta'dan Pulse'a
taşınan ilk token kümesi) + Pulse'ta 18-21 Eylül 2026 turlarında eklenen kurallar.

---

## 1. Token'lar

Tüm renk/tipografi/radius/gölge değerleri CSS custom property olarak `:root`'ta tanımlanır;
hiçbir yerde sabit hex kod veya sabit px `font-size`/`border-radius` KULLANILMAZ.

**Neden:** Tek noktadan değişebilen bir palet, üç ürünün de aynı anda ve tutarlı biçimde
güncellenmesini sağlar; sabit değerler dağılırsa "aile kimliği" zamanla ürünler arasında
sessizce ayrışır (tam olarak Pulse'un eski `--cyan:#087493` kimliğiyle Ausculta'nın lacivert
kimliğinin ayrıştığı durum — aile hizalaması bunu düzeltmek için yapıldı).

**Pulse'ta nerede:** `cardai/styles.css` satır 2 (`:root{...}` — tüm token'lar tek satırda).
Kabul testi (reference/pulse/YONERGE_URUN_AILESI_UIUX_PLANI.md §0.3):
`grep -oE "#[0-9a-fA-F]{3,6}" cardai/styles.css | sort -u | wc -l` ≤ 40 ve hepsi `:root`'ta.

### 1.1 Mod kimliği renkleri

| Mod | Renk | Token |
|---|---|---|
| İnceleme | Yeşil | `--green-600` |
| Uygulama | Mavi | `--blue-600` |
| Değerlendirme | Mor | `--purple-600` |

**Neden:** Kullanıcı hangi modda olduğunu (header çipi + kart kenarlığı + soru kartı üst
şeridi) renkten bağımsız bir bağlamda bile (ör. karartılmış ortam) tekrarlayan konumlarda
görür; üç yerde AYNI renk kullanmak "hangi moddayım" sorusuna anında cevap verir.

**Pulse'ta nerede:** `cardai/app.js` `MODE_LABELS`/`renderHeader(view)` (çip sınıfı
`learn|practice|assessment`); `cardai/styles.css` `.mode-card.learn/.practice/.assessment`.

### 1.2 Alan rengi vs. kroma rengi

Pulse'un eski camgöbeği kimliği (`--cyan:#087493`) **silinmedi** — yalnız kapsamı daraltıldı:
yalnız EKG sahnesi/monitör içinde "alan rengi" olarak kalabilir; header, buton, kart kenarlığı
gibi **UI kroma** öğelerinde kullanılmaz.

**Neden:** Bir simülasyon ürününün kendi "alan"ının (EKG dalga formu, ses spektrumu, görüntü
katmanı) kendine özgü bir rengi olabilir — bu, ürünün TEKNİK içeriğini ailenin ORTAK kimliğinden
ayırır. Alan rengi ile UI kroması karışırsa, kullanıcı arayüz öğesini mi yoksa veri görselleştirmesini
mi gördüğünü ayırt edemez.

**Pulse'ta nerede:** `cardai/styles.css` `--cyan:var(--blue-600)` (köprü token — eski adı
kullanan kod satırları hâlâ çalışır) + EKG kanvası çizim renkleri `#144f67`/`#b92036` (ayrı,
sabit, token'a bağlı olmayan "alan rengi" — bkz. `cardai/app.js renderECG`).

**Opaca:** `--opaca-field:[Opaca: belirlenecek]` — Opaca'nın kendi alan rengini burada tanımlayın.

---

## 2. Tipografi

Gövde metni **14px sabit** (`--fs-md`); ölçek `--fs-xs`(12) → `--fs-3xl`(34) arası 7 basamak.
Kullanıcı büyütme ihtiyacı tarayıcı yakınlaştırmasıyla karşılanır (Ausculta ile aynı yaklaşım).

**Neden:** Pulse'un önceki `--ui-font-scale:1.2` + `--label/--body` sabit-ölçek sistemi
Ausculta'nın 14px tabanından **%20 daha büyüktü** — aynı ekranda yan yana açıldığında iki
ürünün metinleri farklı "ağırlık" hissi veriyordu. Aile ölçeğine (14px) indirmek, iki ürünü
aynı ekran görüntüsünde ayırt edilemez kılar (kabul kriteri: rastgele bir metin bloğu hangi
üründen alındığı söylenmeden gösterildiğinde ayırt edilemesin).

**Pulse'ta nerede:** `cardai/styles.css` `body{font:var(--fs-md)/1.5 var(--font)}`;
KULLANIM.md'de "%120 sabit ölçek" notu bu geçişle birlikte güncellenmelidir (bkz.
docs/07-uygulama-kontrol-listesi.md).

**Kural:** `font-size:` ile sabit px YAZILMAZ, yalnız `var(--fs-*)` veya `clamp(...)`.

---

## 3. Renkler, radius, gölge

- Zemin/kart: `--card:#fff`, `--card-soft:#f4f8fe`, kenar `--border`/`--border-strong`.
- Gölge: `--shadow-card` (kart), `--shadow-pop` (dialog/popover — daha güçlü, 40px yayılım).
- Radius: `--r-xs`(4) → `--r-pill`(999) arası 6 basamak; **sabit px `border-radius` YAZILMAZ**.
- Header laciverti: `linear-gradient(90deg, var(--navy-900), var(--navy-700))`.
- Koyu soru kartı: `linear-gradient(160deg, var(--navy-900), var(--navy-800))`.

**Neden:** Gölgenin iki basamaklı olması (`--shadow-card` vs `--shadow-pop`) kullanıcıya
"bu öğe sayfa akışında mı yoksa üstte açılan geçici bir katmanda mı" bilgisini derinlik
algısıyla verir — dialog/popover her zaman daha "kalkık" görünmelidir.

**Pulse'ta nerede:** `cardai/styles.css` `--shadow-card`, `--shadow-pop` tanımları;
`.topbar{background:linear-gradient(90deg,var(--navy-900),var(--navy-700))}`;
`.q-card-dark{background:linear-gradient(160deg,var(--navy-900),var(--navy-800))}`.

---

## 4. İkonlar — yalnız inline SVG

Yeni bir ikon gerektiğinde **PNG eklenmez**; `stroke="currentColor" stroke-width="2"` ile
inline `<svg>` yazılır.

**Neden:** (1) PNG eklemek `qa/build.py`'nin gömme listesini ve bütünlük envanterini
(SHA-256 hash tablosu) güncellemeyi gerektirir — tek dosyalık SCORM paketleme mimarisinde
her yeni ikili varlık paketleme karmaşıklığını artırır; (2) inline SVG `currentColor` ile
tema rengini otomatik alır (ör. üst çubukta beyaz, kartta lacivert — aynı SVG kod, farklı
render); (3) retina/yüksek DPI ekranlarda bulanıklaşmaz.

**Pulse'ta nerede:** `cardai/index.html` içindeki tüm `<svg>` ikonlar (ör. `#fullscreenIcon`,
`#helpBtn` svg'si); `cardai/features.js` `FS_ICON_PATHS` (tam ekran aç/kapa ikon yolları,
`innerHTML` ile değiştirilir — ayrı bir `<img>` DEĞİL, aynı `<svg>` elemanının içi güncellenir).

---

## 5. Marka bloğu

`[ikon] [EGEMED / Ürün™] [ürün sloganı]` — bkz. `components/topbar.html`.

### 5.1 Üst çubuk logosu — CSS filtresiyle beyaz

```css
.topbar .eg-brand-icon{filter:brightness(0) invert(1)}
```

**Neden:** Kaynak PNG şeffaf **lacivert** bir amblem; koyu lacivert-mavi degrade zemin
üzerinde (`.topbar` arka planı) düşük kontrastla neredeyse görünmez hâle geliyordu.
`brightness(0) invert(1)` PNG'yi yeniden export etmeden (ikinci bir dosya oluşturmadan,
bütünlük envanterini bozmadan) beyaza çevirir — **footer'daki aynı PNG bu filtreyi
KULLANMAZ** çünkü footer zemini beyazdır ve orada logo zaten lacivert kalarak okunur.

**Pulse'ta nerede:** `cardai/styles.css` `.topbar .eg-brand-icon{filter:brightness(0) invert(1)}`
(Tur 3 — 21 Eylül 2026). Kabul testi: `qa/mode_flow_audit.mjs` "H2-topbar-logo-invert-filter"
(`getComputedStyle(...).filter` `invert` içermeli).

### 5.2 Logo sağında ürün sloganı

```css
.eg-brand-tag{border-left:1px solid rgba(255,255,255,.35);padding-left:10px;margin-left:4px;
  font-size:var(--fs-sm);opacity:.9;white-space:nowrap}
@media(max-width:1024px){.eg-brand-tag{display:none}}
```

**Neden:** Marka adı tek başına ürünün NE olduğunu söylemez ("Pulse" bir EKG simülatörü mü,
nabız ölçer mi?). Logo hemen yanında kısa bir slogan (Pulse: "Etkileşimli EKG Simülatörü")
bu belirsizliği giderir. **1024px altında gizlenir** çünkü dar ekranda marka adı + mod çipi +
araç düğmeleri arasında yer yarışı slogan lehine kaybedilirse header taşar/kırılır — slogan,
ekranda yer kaldığında bir "bonus açıklama"dır, kritik bilgi taşımaz (mod çipi ve sayfa başlığı
zaten bağlamı verir).

**Pulse'ta nerede:** `cardai/index.html` `<span class="eg-brand-tag">Etkileşimli EKG Simülatörü</span>`;
`cardai/styles.css` `.eg-brand-tag` + `@media(max-width:1024px)`. Kabul testi:
`qa/mode_flow_audit.mjs` "H3-eg-brand-tag-responsive" (1366px'te görünür, 390px'te gizli).

**Ürün-bağımsız değer:** Pulse="Etkileşimli EKG Simülatörü", Ausculta="Oskültasyon Simülatörü"
(veya mevcut sloganı), Opaca=`[Opaca: belirlenecek]`.

---

## 6. Footer

Bkz. `components/footer.html` — tek satır, ortalı, kademeli kısalma, `.app>.eg-footer`
negatif margin ile kenardan kenara taşma. Ayrıntılı gerekçe ve kabul testi o dosyadadır.

---

## 7. Yazı ölçeği geçiş notu (Pulse'a özgü, kullanıcı kararı gerektirdi)

Pulse'un %120 sabit ölçeğinin aile ölçeğine (14px gövde) indirilmesi
reference/pulse/YONERGE_URUN_AILESI_UIUX_PLANI.md §8 maddesinde **kullanıcı kararı
bekleyen nokta** olarak işaretlenmişti; Pulse'ta bu geçiş uygulanmıştır (bkz. §2 yukarıda).
Ausculta/Opaca'ya bu şablonu uygularken, ürünün KENDİ eski ölçek sisteminin olup
olmadığını kontrol edin ve aynı kullanıcı-onayı adımını izleyin (bkz.
docs/07-uygulama-kontrol-listesi.md).
