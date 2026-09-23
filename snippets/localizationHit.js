/*
 * EGEMED SIM FRAMEWORK — snippet: lokalizasyon isabet ölçütü (sabit yarıçap + merkez mesafesi)
 * =====================================================================================
 * Kural: docs/04-etkilesim-ve-erisilebilirlik.md §10 "Lokalizasyon" (v1.6 — yeni).
 * Kaynak: src/core/geometry.ts markRadiusNorm, markHitsBox, markHitsFinding,
 * nearestFindingBoxCenter, MAX_LOCALIZATION_BOX_AREA (Opaca, V3 — v1.6).
 *
 * NEDEN
 * -----
 * Sabit yarıçaplı bir işaret dairesi, öğrencinin işaretinin BÜYÜKLÜĞÜNÜ değil yalnız
 * KONUMUNU ölçer — değişken/sürüklenerek büyütülen bir işaret alanı "ne kadar büyük
 * işaretlersem o kadar güvenli" gibi yanlış bir strateji öğretir. İsabet ölçütü yalnız
 * "kutunun içinde" değil, "kutunun içinde VE merkeze yeterince yakın" olmalıdır — aksi
 * hâlde büyük/geniş bir uzman kutusunun UZAK bir köşesine teğet geçen rastgele bir
 * tıklama da doğru sayılır (ölçme değerini yok eder). Uzman kutusunun alanı görüntünün
 * belirli bir oranından büyükse (ör. %35) lokalizasyon sorusu hiç üretilmemelidir —
 * "her yer zaten doğru cevap" durumunda soru sormanın ölçme değeri yoktur.
 *
 * OPACA'DA NEREDE
 * ----------------
 * src/core/geometry.ts: MAX_LOCALIZATION_BOX_AREA=0.35, MARK_RADIUS_SHORT_EDGE_FRACTION=0.08,
 * MARK_CENTER_DISTANCE_FRACTION=0.6, markRadiusNorm/markHitsBox/markHitsFinding/
 * nearestFindingBoxCenter. Kullanım: src/ui/FilmViewer.tsx (işaret dairesi çizimi,
 * ıskalama oku) ve scripts/lib/case-selection.mjs (soru üretiminde kutu-alanı kapısı).
 *
 * ÜRÜN-BAĞIMSIZ KULLANIM
 * ------------------------
 * `image.width`/`image.height` normalize (0–1) koordinat uzayının pikselden dönüşüm
 * oranını verir; kare olmayan görüntülerde eksen başına farklı normalize yarıçap
 * (rx/ry) hesaplanmalıdır ki ekranda GERÇEK bir daire görünsün.
 */

const MAX_LOCALIZATION_BOX_AREA = 0.35 // bu orandan büyük kutularda lokalizasyon sorusu ÜRETİLMEZ
const MARK_RADIUS_SHORT_EDGE_FRACTION = 0.08 // işaret dairesi yarıçapı: görüntü kısa kenarının %8'i
const MARK_CENTER_DISTANCE_FRACTION = 0.6 // isabet: merkez mesafesi ≤ yarı köşegenin %60'ı

// Kaynak: src/core/geometry.ts boxArea
function boxArea(b) {
  return b.w * b.h
}

// Kaynak: src/core/geometry.ts markRadiusNorm
function markRadiusNorm(image) {
  const w = image?.width || 1
  const h = image?.height || 1
  const r = MARK_RADIUS_SHORT_EDGE_FRACTION * Math.min(w, h)
  return { rx: r / w, ry: r / h }
}

// Kaynak: src/core/geometry.ts inBox
function inBox(p, b, margin = 0) {
  return p.x >= b.x - margin && p.x <= b.x + b.w + margin && p.y >= b.y - margin && p.y <= b.y + b.h + margin
}

// Kaynak: src/core/geometry.ts markHitsBox — isabet: kutu İÇİNDE VE merkeze yeterince yakın
function markHitsBox(p, b) {
  if (!inBox(p, b, 0)) return false
  const cx = b.x + b.w / 2
  const cy = b.y + b.h / 2
  const halfDiag = Math.hypot(b.w, b.h) / 2
  if (halfDiag <= 0) return true
  const dist = Math.hypot(p.x - cx, p.y - cy)
  return dist <= halfDiag * MARK_CENTER_DISTANCE_FRACTION
}

// Kaynak: src/core/geometry.ts markHitsFinding
function markHitsFinding(p, image, finding, isExpertBox) {
  if (!image) return false
  return image.annotations.some((a) => a.finding === finding && isExpertBox(a) && markHitsBox(p, a))
}

// Kaynak: src/core/geometry.ts nearestFindingBoxCenter — ıskalama geri bildirimi için en yakın kutu merkezi
function nearestFindingBoxCenter(p, image, finding, isExpertBox) {
  if (!image) return null
  const boxes = image.annotations.filter((a) => a.finding === finding && isExpertBox(a))
  if (!boxes.length) return null
  let best = null
  let bestDist = Infinity
  for (const b of boxes) {
    const c = { x: b.x + b.w / 2, y: b.y + b.h / 2 }
    const d = Math.hypot(p.x - c.x, p.y - c.y)
    if (d < bestDist) { bestDist = d; best = c }
  }
  return best
}

// Kullanım örneği (soru üretiminde kutu-alanı kapısı):
// const hasBigBox = candidateBoxes.some((b) => boxArea(b) > MAX_LOCALIZATION_BOX_AREA)
// if (hasBigBox) question.type = 'finding_identify' // lokalizasyon YERİNE bulgu tanıma sorulur

if (typeof module !== 'undefined') {
  module.exports = {
    MAX_LOCALIZATION_BOX_AREA, MARK_RADIUS_SHORT_EDGE_FRACTION, MARK_CENTER_DISTANCE_FRACTION,
    boxArea, markRadiusNorm, inBox, markHitsBox, markHitsFinding, nearestFindingBoxCenter,
  }
}
