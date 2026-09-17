---
name: deerva-admin-structure
description: Naudok, kai kuri, pertvarkai ar peržiūri admin panelės sidebar meniu grupavimą, settings tabus, overview dashboard išdėstymą arba logo/favicon tvarkymą bet kuriame Deerva projekte. Netinka pasirenkant rolių ar permission modelį, ir netinka viešos svetainės vizualiniam dizainui.
---

# 02 — Admin struktūra

Admin panelė yra pats produktas. Vieša svetainė — tai, ką ji sukuria. Jei
klientą reikia mokyti, kaip pridėti paslaugą ar atsakyti į užklausą, admin
dar nebaigtas.

## Meniu tvarka — fiksuota

Rikiuojama nuo dažniausiai naudojamo iki rečiausiai. Vienoda kiekviename
projekte.

WORKSPACE
  Dashboard       kas laukia dėmesio, pagrindiniai skaičiai
  Inquiries       ateinančios užklausos / žinutės
  Calendar        jei sektorius jo turi
  Messages        pokalbiai, jei sektorius jų turi ir neturi Calendar
  Analytics       tikri lankytojai, šalys, šaltiniai

MANAGE (Valdymas)      ← ši dalis priklauso nuo sektoriaus
  <kartojama esybė>    paslaugos / skelbimai / projektai / objektai
  Articles             straipsniai — turi būti kiekviename projekte
  Testimonials         atsiliepimai

SETTINGS (Nustatymai)
  Users           vartotojai
  Settings        tabais, žr. žemiau

Tik MANAGE grupė keičiasi tarp sektorių. WORKSPACE ir SETTINGS identiški visur.

Sidebar apačioje: vartotojo el. paštas, rolės žymė mažosiomis didžiosiomis
raidėmis, „Back to site", „Sign out".

## Settings tabai

Pirmas ir paskutinis tabas fiksuoti. Vidurinieji tabai **atspindi viešos
svetainės meniu** — po vieną tabą kiekvienam viešam puslapiui.

Business        pavadinimas, adresas, telefonas, el. paštas, licencijų
                 numeriai, socialinių tinklų nuorodos
Appearance       logo įkėlimas, logo dydžio slankiklis, favicon, atstatymas
                 į numatytąjį
Home texts       kiekvienas redaguojamas laukas puslapyje /
About texts      …
Contact texts    …
<po vieną tabą kiekvienam kitam viešam puslapiui>
Maintenance      techninių darbų režimo jungiklis — lankytojai mato
                 laikiną puslapį

## Maintenance mode elgesys

Prisijungusiam personalui, kai maintenance mode įjungtas: rodoma tikra
vieša svetainė, ne laikinas puslapis, bet su nuolatiniu, nepaslepiamu
pranešimu juostoje viršuje: "Techniniai darbai įjungti — svetainę matote
tik Jūs, nes esate prisijungęs. Lankytojams rodomas atnaujinimo
pranešimas." Juostoje du veiksmai: "Peržiūrėti kaip lankytojas" (perjungia
rodinį į tą patį laikiną puslapį, kurį mato visi kiti) ir "Išjungti"
(nuoroda tiesiai į Settings → Maintenance).

Neprisijungusiam lankytojui — visada laikinas puslapis, be jokios
išimties.

Numatytoji būsena, kol autentifikacijos patikra dar neišspręsta, privalo
būti PASLĖPTA (laikinas puslapis), ne matoma. Rodyti realų turinį, kol dar
tikrinama, ar žmogus prisijungęs, reiškia, kad greitas apsilankymas ar
crawler gali pamatyti tikrą turinį per tą langą. Numatytasis elgesys
visada rodo mažiau, niekada daugiau, kol įrodyta kitaip.

Naujo viešo puslapio pridėjimas reiškia jo tabo pridėjimą tuo pačiu metu.
Puslapis su neredaguojamu tekstu yra broku.

## Logo taisyklė

Vienas logotipas, vienas dydis, visur:

- viešos svetainės viršuje
- prisijungimo ekrane
- admin sidebar kairėje viršuje, virš meniu

Jis ateina iš `site_settings` — klientas gali įkelti ir keisti dydį
Appearance tabe, su „restore default" mygtuku. Paspaudus visada grąžina į
pradžios puslapio viršų, nuskrolinant net jei jau esi viršuje.

Favicon tvarkomas tame pačiame tabe ir kildinamas iš to paties ženklo.

## Sekcijų plotis — per visą plotį

Admin panelė nėra skaitymo puslapis. Kiekvienas admin puslapis naudoja
**visą turinio srities plotį** — jokių `max-w-3xl`, `max-w-4xl`,
`mx-auto` salų, jokių siaurų stulpelių balto fono viduryje. Plotį riboja
tik AdminShell `<main>` paddingas (`px-4 py-6 md:px-6 md:py-8`), ir jis
vienodas visuose puslapiuose.

Taisyklės:

- Šakninis puslapio konteineris: `w-full` + vertikalus `space-y-*`.
  Niekada `max-w-*` ant šakninio konteinerio.
- Sąrašai, lentelės ir kortelių tinkleliai tempiasi per visą plotį;
  tankis reguliuojamas stulpelių skaičiumi (`sm:grid-cols-2
  lg:grid-cols-3`), ne konteinerio siaurinimu.
- Formos taip pat per visą plotį, laukai dėliojami į gridą
  (`grid gap-4 sm:grid-cols-2`), o ne vienas siauras stulpelis.
- `max-w-*` leidžiamas tik trijose vietose: dialoguose/sheet'uose,
  viešo puslapio peržiūros (preview) blokuose, kurie imituoja tikrą
  svetainės plotį, ir pavieniame trumpame įvesties lauke, kuriam visas
  plotis būtų absurdiškas.
- Puslapių antraštė vienoda: `h1` + vieno sakinio paaiškinimas, tada
  turinys. Antraštė lygiuojama su turiniu kairėje, niekada necentruota.

Skirtingi pločiai skirtinguose puslapiuose yra broko požymis — perėjus
tarp meniu punktų turinys neturi šokinėti.

## Overview puslapis


Trys blokai, šia tvarka:

1. **Needs attention** — neperskaitytos užklausos, laukiantys prašymai.
  Tuščia būsena aiškiai tą pasako.
2. **Numbers** — apsilankymai per 7 dienas, kartojamos esybės kiekis, bet
  kas, ką savininkas tikrina kas savaitę.
3. **Quick actions** — 2–4 mygtukai į tai, ką jie daro dažniausiai.

## „Set as default" eilė

Klientai gali paprašyti, kad jų dabartinis setup'as taptų numatytuoju.
Paspaudžia mygtuką; developeris gauna prašymą eilėje ir jį pritaiko.
Klientai niekada tiesiogiai nerašo numatytųjų reikšmių —
`page_media_defaults` priklauso developeriui.

## Elgesio taisyklės

- Kiekvienas sąrašas turi tuščią būseną kliento kalba, ne „No data".
- Kiekvienas naikinantis veiksmas patvirtinamas ir pasako, kas bus prarasta.
- Išsaugojimas rodo toast pranešimą. Neišsaugoti pakeitimai įspėja prieš
išeinant iš puslapio.
- Editor mato tik peržiūros pranešimus vietoj paslėptų mygtukų — tyla atrodo
kaip klaida.
- Panelė patogi telefone. Savininkai tikrina užklausas iš telefono.
