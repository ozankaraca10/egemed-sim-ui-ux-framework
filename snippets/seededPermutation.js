/*
 * EGEMED SIM FRAMEWORK — snippet: madde kimliğinden tohumlanan seçenek permütasyonu
 * =====================================================================================
 * Kural: docs/03-mod-akisi-ve-pedagoji.md "Seçenek permütasyonu" bölümü.
 * Kaynak: cardai/curriculum.js seededPermutation, makeItems (Pulse, Tur 1 — 18 Eylül 2026).
 *
 * NEDEN
 * -----
 * Öncesinde doğru şıkkın konumu `correct = i % 5` ile üretiliyordu: havuzdaki i'inci
 * maddenin doğru şıkkı A,B,C,D,E,A,B,C,D,E… diye DÖNGÜSEL ve maddeler arasında
 * tahmin edilebilir bir sırayla ilerliyordu. Öğrenci içeriği okumadan, sadece madde
 * sırasını takip ederek doğru şıkkı tahmin edebilirdi (sınav güvenliği zafiyeti).
 * Çözüm: her maddenin KENDİ kimliğinden (id) türetilmiş bir sözde-rastgele permütasyon
 * kullanmak. Bu permütasyon iki özelliği aynı anda sağlar:
 *   1. Deterministik/tekrarlanabilir: aynı id her derlemede aynı seçenek sırasını
 *      üretir (yeniden derleme, önizleme, SCORM paketleme arasında tutarlılık —
 *      QA testleri ve suspend_data'daki kayıtlı seçenek indeksleri bozulmaz).
 *   2. Öğrenci için tahmin edilemez: maddeler arasında ardışık/döngüsel bir örüntü
 *      YOKTUR; doğru şıkkın konumunu öğrenmek için id'nin hash'ini elle hesaplamak
 *      gerekir, bu da pratikte "sıradan tahmin" saldırısını ortadan kaldırır.
 *
 * PULSE'TA NEREDE
 * ----------------
 * cardai/curriculum.js: fonksiyon `seededPermutation(id)` — id'den 32-bit bir hash
 * (xmur3 türevi) çıkarır, bu hash'i mulberry32 türü bir PRNG'ye tohum yapar ve
 * Fisher–Yates ile [0,1,2,3,4] dizisini karıştırır. `makeItems(rows, prefix)` bu
 * diziyi `order` olarak kullanır; `correct = order.indexOf(0)` (banka dizisindeki
 * 0. öğe = doğru şık, bu satırdaki 0'ın YENİ konumu doğru şık indeksidir).
 * `options`/`explanations` de aynı `order` ile yeniden sıralanır — böylece şık metni
 * ile açıklama metni birlikte kayar, tutarsızlık oluşmaz.
 *
 * ÜRÜN-BAĞIMSIZ KULLANIM
 * ------------------------
 * Herhangi bir üründe (Pulse/Ausculta/Opaca) çok seçenekli madde üreten kod bu
 * fonksiyonu id parametresiyle çağırır. Seçenek sayısı 5 değilse `arr` dizisinin
 * uzunluğunu değiştirin (Fisher–Yates algoritması sabit kalır).
 */

// Kaynak: cardai/curriculum.js seededPermutation, makeItems
function seededPermutation(id) {
  // xmur3 türevi hash: id string'inden 32-bit tohum çıkarır.
  let h = 1779033703 ^ id.length;
  for (let i = 0; i < id.length; i++) {
    h = Math.imul(h ^ id.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  h ^= h >>> 16;
  let seed = h >>> 0;

  // mulberry32 türevi PRNG: aynı tohum → aynı dizi (tekrarlanabilir).
  const rand = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  // Fisher–Yates karıştırma; seçenek sayısı 5 ise arr uzunluğu 5 kalır.
  const arr = [0, 1, 2, 3, 4];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Kullanım örneği (Pulse makeItems'tan sadeleştirilmiş):
// const id = prefix + String(i + 1).padStart(3, '0');
// const order = seededPermutation(id);       // ör. [3,0,4,1,2]
// const correct = order.indexOf(0);          // bankadaki "doğru" öğenin YENİ konumu
// const options = order.map(n => bank.options[n]);
// const explanations = order.map(n => bank.explanations[n]);

if (typeof module !== 'undefined') module.exports = { seededPermutation };
