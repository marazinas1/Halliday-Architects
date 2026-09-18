# Administravimo dalies mobiliųjų ekranų sutvarkymas

Tikslas: visi administravimo puslapiai turi patogiai veikti 375 px pločio telefone, be viso puslapio horizontalaus slinkimo, išlaikant pilno pločio sekcijų standartą. Planšetės ir kompiuterio išdėstymas lieka toks pats, išskyrus bendrų elementų suvienodinimą.

## 1. Settings ir kitų sekcijų navigacija

- Telefone horizontaliai slenkamą skirtukų juostą pakeisti vienu pilno pločio pasirinkimo lauku, kuris aiškiai rodo dabartinę sekciją ir atveria visą sąrašą.
- Nuo `sm` pločio palikti dabartinius horizontalius skirtukus su apatiniu aktyvios sekcijos pabraukimu.
- Tą patį bendrą elgesį taikyti Settings, Projects/Tags ir About/Team/Testimonials skirtukams.
- Išlaikyti tikslius viešo meniu pavadinimus ir Contact kaip paskutinį Settings punktą.

## 2. Bendros antraštės ir veiksmų išdėstymas

- Visuose administravimo puslapiuose naudoti vieną mobilų antraštės modelį: pavadinimas ir aprašymas per visą plotį, veiksmai atskiroje eilėje po jais.
- Telefone keli veiksmai užims visą prieinamą plotį arba antriniai veiksmai bus sudėti į trijų taškų meniu.
- Sutvarkyti Projects, Articles, Team, Services, Analytics, formų ir kategorijų antraštes, kad tekstas nebūtų suspaustas.

## 3. Lentelės ir sąrašai telefone

- Articles ir Team lenteles telefone pakeisti skaitomomis kortelių eilutėmis: nuotrauka, pavadinimas, būsena ir svarbiausi duomenys viršuje, veiksmai atskiroje 44 px aukščio eilėje.
- Projects telefone visada rodyti esamą kortelių vaizdą; lentelės perjungiklį ir horizontalią lentelę palikti tik didesniuose ekranuose.
- Users eilutėse ženkliukai galės persikelti į kitą eilę, o destruktyvūs ir reti veiksmai telefone bus trijų taškų meniu.
- Inquiries datą perkelti po pagrindine informacija telefone, kad ji nesuspaustų vardo ir ženkliukų.
- Testimonials suskleistose eilutėse būseną ir perrikiavimo veiksmus telefone dėti į atskirą eilę.

## 4. Filtrai, formos ir išsaugojimo juostos

- Projects telefone palikti paiešką, o tris filtrus sudėti į vieną „Filters“ išskleidžiamą skydelį su aktyvių filtrų skaičiumi.
- Blog ir Project redagavimo juostose telefone palikti Back ir Save; Preview, Delete ir kitas retesnes komandas perkelti į papildomų veiksmų meniu.
- Įvestims telefone užtikrinti bent 16 px tekstą, kad iOS automatiškai nedidintų vaizdo.
- Save ir dialogų veiksmus telefone išdėstyti per visą plotį, nekeisti jų pločio išsaugojimo metu.
- Settings kortelėse lauką ir Save mygtuką telefone statyti vieną po kitu.

## 5. Nuotraukų pasirinkimas ir medijos valdymas

- Nuotraukų pasirinkimo lange išlaikyti fiksuotą antraštę ir tik vieną slenkamą nuotraukų sritį.
- Telefone sutankinti viršutinę navigaciją, projektų pasirinkimą ir nuotraukų skaičių; palikti dviejų stulpelių nuotraukas su pakankamais paspaudimo plotais.
- PageImageSlot bei Services nuotraukų veiksmus telefone dėlioti tvarkingai per visą plotį; developerio eilutė turi lūžti po savo etikete, o ne susispausti.
- Rich text įrankių juostą palikti vienos eilės, slenkamą tik jos viduje, ne visame puslapyje.

## 6. Pilno pločio sekcijų taisyklė

- Visų puslapių šaknis lieka `w-full`; nebus pridedami `max-w-*` ar centruoti turinio blokai administravimo puslapiuose.
- Horizontalus slinkimas leidžiamas tik specializuotame valdiklyje, pavyzdžiui, teksto redaktoriaus įrankių juostoje — niekada visame puslapyje.
- Dialogų ir viešos svetainės peržiūrų pločio ribojimai lieka teisėtos išimtys.

## 7. Patikrinimas

- Prisijungus patikrinti visus administravimo maršrutus 375×675 ir 390×844 ekranuose: Dashboard, Inquiries, Analytics, Projects, Tags, Articles, Testimonials, Users ir visus Settings puslapius bei kūrimo/redagavimo formas.
- Kiekviename puslapyje patikrinti, kad dokumento plotis neviršija ekrano, visi veiksmai pasiekiami, dialogai telpa, o sąrašai nereikalauja viso puslapio horizontalaus slinkimo.
- Atskirai patikrinti Settings pasirinkimą, Projects filtrų skydelį, paskutinės nuotraukos pasiekimą pasirinkimo lange ir ilgiausius sąrašų pavadinimus.
- Patikrinti pagrindinius administravimo puslapius kompiuterio plotyje, kad lentelės, skirtukai ir pilno pločio sekcijos nepasikeitė nepageidaujamai.
