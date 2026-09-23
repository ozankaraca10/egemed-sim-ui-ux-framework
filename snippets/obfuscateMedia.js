/*
 * EGEMED SIM FRAMEWORK — snippet: build-time medya dosya adı/klasör opaklaştırma
 * =====================================================================================
 * Kural: docs/03-mod-akisi-ve-pedagoji.md §4(c) "Arayüz ipucu sızdırmaz" (v1.6 eklentisi).
 * Kaynak: scripts/lib/obfuscate-audio.mjs obfuscateAudioInDist (Ausculta, F1 güvenlik
 * düzeltmesi — v1.6).
 *
 * NEDEN
 * -----
 * Dağıtılan pakette (SCORM zip / bağımsız HTML çıktısı) medya dosyalarının adı veya
 * klasör yapısı, o kaydın hangi bulguya/tanıya ait olduğunu DOĞRUDAN OKUNABİLİR biçimde
 * taşıyorsa (ör. `heart/f_esm_lusb.wav` — "esm" = erken sistolik üfürüm), Değerlendirme
 * modunda tarayıcının Ağ (Network) sekmesini açan bir öğrenci, sıradaki istenen dosyanın
 * ADINDAN cevabı ÖNCEDEN çıkarabilir. Bu, docs/03 §4'teki diğer iki sızıntı yüzeyiyle
 * (klavye kısayolu kaçışı, DOM data-* özniteliği) AYNI sınıf zafiyettir ama farklı bir
 * katmanda (derleme sonrası paket çıktısı) yaşar — kod incelemesiyle değil, üretim
 * paketinin kendisini denetleyerek bulunur.
 *
 * AUSCULTA'DA NEREDE
 * -------------------
 * scripts/lib/obfuscate-audio.mjs — `vite build` TAMAMLANDIKTAN SONRA, paketleme
 * (build-html.mjs/build-scorm.mjs) ÖNCESİNDE `dist/`i post-process eder: her runtime ses
 * dosyası, içeriğinin sha1 özetinin ilk 12 hex karakteriyle düz bir ada KOPYALANIR
 * (kategori klasörü de KALDIRILIR — kategori de bir ipucudur), `dist/` altındaki TÜM metin
 * dosyalarında (JS paketi dahil) eski göreli yol yeni opak yolla DEĞİŞTİRİLİR (gerçek
 * dosya listesinden çıkarılan haritayla tam-dizge ikamesi, regex tahmini DEĞİL), eski
 * klasör SİLİNİR. Yalnız ÜRETİM paketleri için çalışır — geliştirmede (`npm run dev`,
 * paketlenmemiş `npm run build`) kaynak `public/`e dokunmaz, okunabilir adlar KALIR.
 *
 * ÜRÜN-BAĞIMSIZ KULLANIM
 * ------------------------
 * `mediaGlob`/`mediaExt` parametrelerini kendi medya türünüze (ses/görüntü/video) göre
 * ayarlayın; fonksiyonu paketleme betiğinizde `vite build` (veya eşdeğeri) SONRASINDA,
 * zip'leme ÖNCESİNDE çağırın.
 */

// Kaynak: scripts/lib/obfuscate-audio.mjs obfuscateAudioInDist
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

function obfuscateMediaInDist(distDir, { mediaSubdir = path.join('assets', 'audio'), mediaExt = '.wav' } = {}) {
  const mediaRoot = path.join(distDir, mediaSubdir)
  const runtimeRoot = path.join(mediaRoot, 'runtime')
  if (!fs.existsSync(runtimeRoot)) return { renamed: 0, patchedFiles: 0 }

  const opaqueDir = path.join(mediaRoot, 'r')
  fs.mkdirSync(opaqueDir, { recursive: true })

  function walkMedia(dir) {
    const out = []
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name)
      if (e.isDirectory()) out.push(...walkMedia(full))
      else if (e.isFile() && e.name.toLowerCase().endsWith(mediaExt)) out.push(full)
    }
    return out
  }

  const mediaFiles = walkMedia(runtimeRoot)
  const map = new Map() // eski göreli URL -> yeni opak göreli URL
  const usedHashes = new Set()
  for (const abs of mediaFiles) {
    const buf = fs.readFileSync(abs)
    let hash = crypto.createHash('sha1').update(buf).digest('hex').slice(0, 12)
    let extra = 12
    while (usedHashes.has(hash) && extra < 40) {
      extra += 4
      hash = crypto.createHash('sha1').update(buf).digest('hex').slice(0, extra)
    }
    usedHashes.add(hash)
    const relOld = path.relative(distDir, abs).split(path.sep).join('/')
    const relNew = `${mediaSubdir.split(path.sep).join('/')}/r/${hash}${mediaExt}`
    map.set(relOld, relNew)
    fs.copyFileSync(abs, path.join(distDir, relNew))
  }
  fs.rmSync(runtimeRoot, { recursive: true, force: true })

  const textExts = new Set(['.js', '.html', '.css', '.json', '.xml', '.txt'])
  let patchedFiles = 0
  function patchTextFiles(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name)
      if (e.isDirectory()) { patchTextFiles(full); continue }
      if (!textExts.has(path.extname(e.name).toLowerCase())) continue
      const text = fs.readFileSync(full, 'utf8')
      let next = text
      let changed = false
      for (const [oldRel, newRel] of map) {
        if (next.includes(oldRel)) { next = next.split(oldRel).join(newRel); changed = true }
      }
      if (changed) { fs.writeFileSync(full, next); patchedFiles++ }
    }
  }
  patchTextFiles(distDir)

  return { renamed: map.size, patchedFiles }
}

// Kullanım örneği (build-scorm.mjs'ten sadeleştirilmiş):
// await runViteBuild()
// const { renamed, patchedFiles } = obfuscateMediaInDist(DIST_DIR)
// console.log(`${renamed} medya dosyası opaklaştırıldı, ${patchedFiles} metin dosyası yamalandı.`)
// await zipDist()

if (typeof module !== 'undefined') module.exports = { obfuscateMediaInDist }
