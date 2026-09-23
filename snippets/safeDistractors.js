/*
 * EGEMED SIM FRAMEWORK — snippet: güvenli çeldirici seçimi + ayırıcı tanı önceliği
 * =====================================================================================
 * Kural: docs/03-mod-akisi-ve-pedagoji.md §11 "Güvenli çeldirici ilkesi".
 * Kaynak: scripts/lib/case-selection.mjs safeDistractors, DIFFERENTIALS,
 * orderDistractorsByDifferential, hasEnoughOptions (Opaca, BRIEF_OPACA_DISTRACTORS — v1.6).
 *
 * NEDEN
 * -----
 * Bir çoktan seçmeli maddenin çeldiricisi, "akla gelen makul yanlış" değil, o vakada
 * YOKLUĞU KANITLANMIŞ bir bulgudan seçilmelidir — aksi hâlde öğrenci, filmde/kayıtta
 * aslında VAR OLABİLECEK bir bulguyu "yok" seçeneği olarak görebilir (madde güvenliği
 * zafiyeti). Güvenli adaylar arasında da rastgele seçim yerine ayırıcı tanı önceliği
 * uygulanır: birincil bulgunun klinik ayırıcı tanısındaki bulgular ÖNCE gelir — "hiç
 * alakasız" bir çeldirici yerine "klinik olarak makul ama yanlış" bir çeldirici, asıl
 * ölçülmek istenen beceriyi (yakın ayırıcı tanılar arasında seçim) test eder. Son bir
 * kapı: değerlendirme (sumatif) bağlamda şans başarısını sınırlamak için her seçmeli
 * sorunun EN AZ 3 seçeneği olmalıdır — 2 seçenekli bir soru (1/2 şans) formatif bağlamda
 * tolere edilebilir ama sumatif ölçmede KABUL EDİLEMEZ.
 *
 * OPACA'DA NEREDE
 * ----------------
 * scripts/lib/case-selection.mjs:
 *  - safeDistractors(img, primary, teachingFindings) — beş güvenlik kontrolü: (1) uzman
 *    kaynaklı açık negatif, (2) film uzman kaynaklı "normal" ise diğer her şey güvenli,
 *    (3) film en az bir anormal bulguya sahipse "normal" güvenli, (4) NIH rapor (NLP)
 *    etiketleri bulguyu içermiyorsa, (5) NLM okuma metni bulgunun anahtar sözcüğünü hiç
 *    içermiyorsa.
 *  - DIFFERENTIALS — birincil bulgu → öncelikli çeldirici adayları haritası (klinik
 *    ayırıcı tanı sırasıyla).
 *  - orderDistractorsByDifferential(candidates, primary, rnd) — DIFFERENTIALS'taki
 *    bulgular önce (öncelik sırasıyla), kalan güvenli adaylar tohumlu rastgele sırada.
 *  - MIN_ASSESSMENT_OPTIONS=3, hasEnoughOptions(q)/caseSelectableOk(questions) —
 *    değerlendirme kapısı; generate-cases.mjs (üretim) VE validate-images.mjs (ikinci
 *    savunma hattı) AYNI fonksiyonu çağırır.
 *
 * ÜRÜN-BAĞIMSIZ KULLANIM
 * ------------------------
 * `img`/`primary`/`teachingFindings` parametrelerini kendi veri modelinize uyarlayın:
 * `img.findings`/`img.negatives` uzman/NLP kaynaklı pozitif/negatif etiket haritalarıdır;
 * `EXPERT` (ayrı tutulan bir Set) hangi kaynakların "uzman" sayıldığını belirler.
 * `DIFFERENTIALS` haritasını kendi alanınızın (ör. oskültasyon bulguları) klinik ayırıcı
 * tanı ilişkilerine göre doldurun; liste dışı bulgular için öncelik uygulanmaz (eşit
 * ağırlıklı, tohumlu rastgele sıra).
 */

// Kaynak: scripts/lib/case-selection.mjs safeDistractors
function safeDistractors(img, primary, teachingFindings, { EXPERT, isMontgomeryLike, readingKeywords }) {
  const hasNlpReport = img.sourceDataset === 'nih-cxr14' && Object.values(img.findings).some((s) => s === 'report_nlp')
  const expertNormal = !!img.findings.normal && EXPERT.has(img.findings.normal)
  const expertAbnormal = Object.entries(img.findings).some(([f, s]) => f !== 'normal' && EXPERT.has(s))
  const isReadingSource = isMontgomeryLike ? isMontgomeryLike(img) : false
  const readingFindings = isReadingSource ? new Set(readingKeywords(img.readingText)) : null
  const out = []
  for (const f of teachingFindings) {
    if (f === primary || img.findings[f]) continue
    if (img.negatives[f] && EXPERT.has(img.negatives[f])) out.push(f)
    else if (expertNormal && f !== 'normal') out.push(f)
    else if (f === 'normal' && expertAbnormal) out.push(f)
    else if (hasNlpReport && f !== 'normal' && !img.findings.no_finding_report) out.push(f)
    else if (isReadingSource && readingFindings.has(f) === false && f in (readingKeywords.KEYS ?? {})) out.push(f)
  }
  return out
}

// Kaynak: scripts/lib/case-selection.mjs orderDistractorsByDifferential
function orderDistractorsByDifferential(candidates, primary, DIFFERENTIALS, seededShuffle, rnd) {
  const priority = DIFFERENTIALS[primary] ?? []
  const rank = new Map(priority.map((f, i) => [f, i]))
  const prioritized = candidates.filter((f) => rank.has(f)).sort((a, b) => rank.get(a) - rank.get(b))
  const rest = seededShuffle(candidates.filter((f) => !rank.has(f)), rnd)
  return [...prioritized, ...rest]
}

// Kaynak: scripts/lib/case-selection.mjs hasEnoughOptions / caseSelectableOk
const MIN_ASSESSMENT_OPTIONS = 3
function hasEnoughOptions(q) {
  return !q.options || q.options.length === 0 || q.options.length >= MIN_ASSESSMENT_OPTIONS
}
function caseSelectableOk(questions) {
  return questions.every(hasEnoughOptions)
}

// Kullanım örneği (Opaca generate-cases.mjs'ten sadeleştirilmiş):
// const candidates = safeDistractors(img, primary, teachingFindings, { EXPERT, ... })
// const ordered = orderDistractorsByDifferential(candidates, primary, DIFFERENTIALS, seededShuffle, seededRng(img.id))
// const distractors = ordered.slice(0, 4)
// if (!caseSelectableOk(caseDef.questions)) caseDef.assessmentEligible = false // yalnız öğrenme/uygulamada kalır

if (typeof module !== 'undefined') {
  module.exports = { safeDistractors, orderDistractorsByDifferential, hasEnoughOptions, caseSelectableOk, MIN_ASSESSMENT_OPTIONS }
}
