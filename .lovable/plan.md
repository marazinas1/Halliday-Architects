# Image upload, optimization and delivery pipeline (Halliday Architects)

Kaip šiame projekte išspręstas nuotraukų įkėlimas, glaudinimas ir atvaizdavimas: visada aukščiausia raiška serveryje, visada tik tiek pikselių naršyklėje, kiek ekranas realiai mato.

## Principas vienu sakiniu

**Master įkeliamas didelis ir kokybiškas vieną kartą; pristatymas (delivery) vyksta per responsive variants — naršyklė parsisiunčia tik tokio pločio variantą, kokio slote reikia.** Kokybė niekada nėra aukojama dėl greičio — greitis pasiekiamas teisingu pločio parinkimu, ne master'o mažinimu.

## 1. Upload pipeline (kliento pusėje, prieš storage)

Failas: `src/lib/images/optimizeImage.ts`, naudoja `browser-image-compression`.

- Kiekvienas admin įkėlimas eina per `optimizeImage(file, preset, onProgress)` — be išimčių, jokių direct-to-storage kelių.
- Preset'ai (`IMAGE_PRESETS`):

| Preset | Ilgiausia briauna | Tikslas | Kokybė | Tipas |
|---|---|---|---|---|
| `hero` | 3200px | ≤2.2 MB | 0.88 | WebP |
| `project` | 3000px | ≤1.6 MB | 0.86 | WebP |
| `cover` (blog) | 2000px | ≤0.7 MB | 0.86 | WebP |
| `body` | 1600px | ≤0.5 MB | 0.82 | WebP |
| `headshot` | 1200px | ≤0.25 MB | 0.82 | WebP |
| `logo` | 800px | ≤0.5 MB | 1.0 | PNG (skaidrumas) |
| `favicon` | 256px | ≤0.1 MB | 1.0 | PNG |

- EXIF visada išmetamas (`preserveExif: false`).
- Skip taisyklė: jei failas jau mažesnis už `skipUnderBytes`, jau tinkamo formato ir telpa į `maxDimension` — grąžinamas nepaliestas (antras glaudinimas neduoda nieko).
- SVG atmetamas (`NotAnImageError`) — nėra saugus pipeline'o kelias.
- Rezultatas: vienas WebP master krepšyje (`team-photos`, projektų, blog'o bucket'ai), įkeliamas su `cacheControl: 31536000`.
- Keičiant/trinant nuotrauką senas objektas storage ištrinamas — našlaičių nebelieka.

## 2. Responsive delivery (naršyklėje)

Failas: `src/components/ResponsiveImage.tsx`.

- Storage URL perrašomas iš `/storage/v1/object/public/` į `/storage/v1/render/image/public/` su `width`, `resize=contain`, `quality` parametrais — tai Lovable Cloud image transformation endpoint'as, kuris iš vieno master'o paduoda bet kokio pločio variantą on-the-fly. Ne storage URL (bundled assets) renderinami nepaliesti.
- Variantų laipteliai: `WIDTHS = [640, 960, 1400, 2000, 2400, 3000]`.
- `srcset` statomas iš visų laiptelių iki `maxWidth` lubų; `src` fallback — vidutinis variantas.
- **Kodėl tai sharp:** taisyklė „sharpness first" — kiekvieno sloto `maxWidth` lubos = realus renderintas plotis × 2 (retina). Niekada mažiau: žemiau tos ribos retina ekrane nuotrauka jau minkšta. Bajtai kertami tik ten, kur jie nematomi.
- **Kodėl tai greita:** naršyklė pagal `sizes` pasiima tik vieną variantą — telefonas ~640–960px, desktop'as pagal slotą.

## 3. Per-slot kontraktas (ką turi perduoti kiekvienas slotas)

Kiekvienas `ResponsiveImage` naudojimas privalo deklaruoti tris dalykus pagal savo realų išdėstymą:

1. **`sizes`** — tikslus CSS sizes, atitinkantis layout'ą (pvz. hero `100vw`; 3-kol eilutė `(min-width: 1024px) 33vw, 100vw`). Neteisingas `sizes` = naršyklė tyčia pasiima per mažą variantą ir soft'ina net tobulą master'į. Tai buvo #1 blur priežastis istorijoje.
2. **`maxWidth`** — retina lubos (renderintas plotis ×2). Pvz.: homepage hero 3000 q85; projects grid 2400/2000/1600 q82; gallery 2000 q82; lightbox 3000 q88 (pilna kokybė ten, kur žiūrima iš arti).
3. **`width`/`height`** — deklaruoti matmenys turi atitikti sloto aspect ratio (kad skeleton'as/frame'as neužšoktų kraunant; CLS = 0).

Papildomai:
- Tik **vienas** above-the-fold vaizdas per puslapį gauna `priority` (eager + fetchpriority=high + sync decoding). Viskas žemiau fold'o — `lazy` + `async`.
- Homepage hero papildomai: SSR loader'is įdeda realų URL į raw HTML, todėl naršyklė pradeda siųstis hero iškart, nelaukdama JS round-trip'ų (grey-card problemos sprendimas).

## 4. Taisyklės, kurių negalima laužyti

- Jokio kokybės mažinimo dėl greičio — kertami tik plotis/bajtai, ne raiška.
- Jokio universalaus „vienas `sizes` visiems" — kiekvienas slotas savo.
- Jokio localStorage/blur-placeholder sluoksnio — buvo bandyta, davė flicker; vietoj to SSR + boot prefetch.
- Jokio raw `<img>` su storage URL naujame kode — viskas per `ResponsiveImage`.
- Keičiant ar trinant — senas objektas iš storage ištrinamas.

## Skirta išgryninti į skill

Kai patvirtinsi, šį tekstą suspausiu į skill formato taisykles (preset lentelė + ResponsiveImage kontraktas + forbidden sąrašas) paruoštas kopijavimui.
