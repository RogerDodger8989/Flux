Master Roadmap: Flux

Vision: En självhostad, integritetsfokuserad fotoplattform med professionella redigeringsverktyg, AI-restaurering och social delning.

Tech Stack:

Frontend: React, Tailwind CSS, Vite (PWA)

Backend: Node.js, Express/Fastify

Databas: SQLite (med Prisma ORM)

AI/Bild: TensorFlow.js, Sharp, Libvips

📐 Projektregler & Principer (Context)

Dessa regler ska följas genom hela utvecklingen i Antigravity.

Mobile First: All UI-design ska fungera perfekt på mobil (touch-targets, responsivitet) innan desktop.

Offline First: Appen ska starta och visa cachat innehåll även utan internetuppkoppling.

Privacy by Default: Ingen data (bildanalys, telemetri) får lämna servern utan aktivt val. Integritet går först.

Non-destructive: Originalfiler får ALDRIG skrivas över. Alla redigeringar sparas som metadata/sidecars.

Data Integrity: Verifiera alltid filens hash/checksumma vid flytt eller kopiering för att förhindra "bit rot" och korruption.

Performance: Listor med >100 objekt måste använda virtualisering (windowing). UI:t får aldrig låsa sig pga tunga processer (Graceful Degradation).

Keyboard First: Hela applikationen ska gå att navigera och använda effektivt med enbart tangentbord (för Power Users).

Conventional Commits: Följ standard för commits (t.ex. feat:, fix:) för att möjliggöra automatiska changelogs.

Språk: Kod, kommentarer och commits ska vara på Engelska. UI-text ska vara på Svenska (med stöd för i18n).

## 🎯 Projektförutsättningar

**Startpunkt**: Från scratch – helt nytt projekt utan befintlig kodbas.

**Målgrupp**: Power users som vill ha full kontroll över sin fotoplattform och data.

**Deployment**: Docker-container på TrueNAS Scale för enkel installation och hantering.

**Autentisering**: Multi-user applikation med admin-konto och familjemedlemmar som användare.
- **Admin**: Full kontroll - skapa användare, redigera bilder, hantera rättigheter
- **User**: Begränsad åtkomst - kan se bilder, rättigheter styrs av admin

**Tekniska prioriteringar**:
- Export-funktionalitet tidigt (Fas 2)
- Progressiv AI-skalning (börja med MobileNet, uppgradera senare)
- Bundle size budget för snabb PWA
- IndexedDB + Service Worker för robust offline-läge

**Säkerhet från start**:
- Rate limiting för API och uppladdningar
- CSP headers för säker körning
- Audit logging för kritiska operationer

**UX-prioriteringar**:
- Onboarding wizard ("Välkommen till Flux!")
- Progressindikatorer för tunga operationer
- Keyboard shortcuts overlay (tryck `?`)

Fas 1: Fundamentet, Design & Infrastruktur

Mål: Få igång systemet, sätta designprinciper och säkerställa drift.

$$$$

 Docker-container: Officiell image för enkel installation ("one-click deploy").

$$$$

 Autentisering & Login: Multi-user login med admin och user-roller.

$$$$

 User Management: Admin kan skapa, redigera och ta bort användarkonton för familjemedlemmar.

$$$$

 Rättighetshantering: Admin styr vad varje användare får göra (läsa, redigera, ladda upp, radera).

$$$$

 CSP Headers: Content Security Policy för att förhindra XSS och code injection.

$$$$

 Rate Limiting: API-begränsningar för att förhindra missbruk och DoS-attacker.

$$$$

 Flux UI Shell: Responsiv "Tre-panels-layout" (Sidebar, Main, Inspector) med collapsible menyer.

$$$$

 Theme Engine: Stöd för dynamiska teman (CSS-variabler) för Ljust/Mörkt läge samt valbara accentfärger.

$$$$

 Keyboard Shortcuts Overlay: Tryck `?` för att visa alla tangentbordsgenvägar.

$$$$

 Progress Indicators: Visuella indikatorer för import, AI-analys och andra tunga operationer.

$$$$

 Hälsokontroll: Dashboard för serverns CPU/RAM/Disk-status.

$$$$

 Offline-läge (PWA): IndexedDB + Service Worker för att cacha bilder och visning utan internet.

$$$$

 Import-motor: Scanna mappar, skapa thumbnails/previews.

$$$$

 Bit-rot Scanner: Korruptions-scanner som hittar filer som "ruttnat" på disken.

$$$$

 Backup-motor: Schemalagd backup av databas och viktiga inställningar till moln/lokal disk.

Fas 2: Organisation & Workflow (The Daily Driver)

Mål: Effektiv hantering av stora bibliotek.

$$$$

 Onboarding Wizard: "Välkommen till Flux! Låt oss scanna din första mapp..." – guidad installation.

$$$$

 Export-motor: Exportera bilder med redigeringar (JPEG/PNG), vattenstämpel och metadata-stripping.

$$$$

 Betyg: Sätt 0-5 stjärnor (stöd för halva stjärnor).

$$$$

 Färg-etiketter: Röd, Gul, Grön, Blå (standardiserat filter).

$$$$

 Smart Folders: Virtuella mappar baserade på regler (t.ex. "Betyg > 4 OCH År == 2024").

$$$$

 Stacking: Gruppera RAW+JPG eller serietagningar (bursts) som "en" fil.

$$$$

 Batch-rename: Byt namn på 1000-tals filer med mönster (t.ex. {Datum}_{Tid}_{Kamera}.jpg).

$$$$

 Tidsjustering: Skifta datum/tid på bilder (fixa fel tidszoner).

$$$$

 "Att göra"-lista: Workflow-taggar ("Ska redigeras", "Ska skrivas ut").

$$$$

 Papperskorg & Arkiv: Soft delete (30 dagar) och Arkivera (dölj men spara).

$$$$

 Dublett-rensare: Avancerad guide/wizard för att välja rätt dublett att behålla.

Fas 3: "Flux Vision" – AI & Analys

Mål: Låta maskinen göra grovjobbet.

$$$$

 Ansiktsigenkänning: Detektera, klustra och namnge personer.

$$$$

 Objektigenkänning: Auto-tagga "Bil", "Hund", "Strand", "Mat".

$$$$

 Visuell Duplicate Detection: Hitta bilder som ser likadana ut (även om filnamn skiljer).

$$$$

 Färg-sök: Extrahera dominant färgpalett så man kan söka på "Blå bilder".

$$$$

 Exif-strip: Funktion för att rensa metadata vid export.

Fas 4: Redigeringsstudion (Pro Tools)

Mål: Ersätta Lightroom för 90% av behoven.

$$$$

 RAW-stöd: Hantera .CR2, .NEF, .ARW direkt i webbläsaren.

$$$$

 Histogram: RGB-histogram i realtid.

$$$$

 Focus Peaking: Visuell markering av vad som är skarpt i bilden.

$$$$

 Side-by-side: Jämför 2-4 bilder bredvid varandra för gallring.

$$$$

 Redigeringshistorik: Obegränsad Undo/Redo under sessionen.

$$$$

 Snapshots: Spara olika versioner av redigeringar på samma bild.

$$$$

 Klon-verktyg: "Spot removal" för damm och finnar.

$$$$

 Röda ögon: Auto-fix eller manuell pensel.

$$$$

 Vattenstämpel: Automatiskt pålägg vid export.

Fas 5: AI Restaurering (Magic Lab)

Mål: Rädda och förbättra gamla minnen.

$$$$

 AI Upscaling: Super-resolution för att göra små bilder stora och skarpa.

$$$$

 Svartvitt till Färg: Automatisk kolorisering av gamla foton.

$$$$

 Rep-borttagning: AI-modell tränad på att laga repor och vikningar.

Fas 6: Video & Live Media

Mål: Hantera rörlig bild lika bra som stillbild.

$$$$

 Video-uppspelning: Stöd för MP4, MOV, MKV.

$$$$

 Transcoding: Konvertera 4K/HEVC on-the-fly för webbvisning.

$$$$

 Hover-play: Snabbförhandsvisning när musen vilar på en video.

$$$$

 Live Photos: Stöd för Apple/Samsung Live Photos (bild + snutt).

$$$$

 Video-metadata: Visa bitrate, längd, FPS.

$$$$

 Frame Extraction: Spara en bildruta ur en video som JPG.

Fas 7: Kartor, Tid & Rum

Mål: Visualisera datan geografiskt och kronologiskt.

$$$$

 Heatmaps: Glödande kluster på kartan där du fotat mest.

$$$$

 Rese-rutter: Rita linjer mellan bilder tagna i sekvens (visualisera resan).

$$$$

 Omvänd Geokoding: Hämta "Stad, Land" från GPS-koordinater.

$$$$

 Manuell Kartnål: Dra-och-släpp bilder på kartan för att geotagga i efterhand.

$$$$

 Mörkt Kart-läge: Anpassad kartstil.

$$$$

 Tidsresa: UI för att scrolla blixtsnabbt genom åren.

$$$$

 Kalender-vy: Rutnät baserat på datum.

$$$$

 "On this day": Minnesfunktion (vad hände idag för X år sedan?).

Fas 8: Socialt, Publicering & Web

Mål: Dela med sig av biblioteket.

$$$$

 Gäst-portal: QR-kod/Länk för gäster att ladda upp bilder (t.ex. bröllop).

$$$$

 Delade Album: Samarbeta kring album med andra användare.

$$$$

 Reaktioner & Kommentarer: Gilla-hjärtan och kommentarsfält.

$$$$

 Blogg-motor: Skriv inlägg där bilder från biblioteket infogas.

$$$$

 Avancerade Teman: Användare kan skapa egna CSS-teman och dela med andra.

$$$$

 Lösenordsskyddade länkar: Tidsbegränsad delning.

$$$$

 Familjeträd: Visuellt träd baserat på Person-taggar och relationer.

Fas 9: Säkerhet & Integration

Mål: Skydda datan och prata med andra system.

$$$$

 2FA: Tvåfaktorsinloggning (TOTP).

$$$$

 Krypterade Album: Mappar som kräver extra PIN-kod för att öppnas.

$$$$

 Audit Log: Logga vem som raderade, laddade ner eller ändrade vad.

$$$$

 GDPR-export: Knapp för att hämta all data om sig själv.

$$$$

 WebDAV Server: Montera Flux som en nätverksdisk i OS.

$$$$

 Home Assistant: Integration för smarta hem-paneler.

$$$$

 Cast / AirPlay: Kasta media till TV.

$$$$

 Digital Ram-läge: Anpassat UI för vägghängda surfplattor.

$$$$

 E-post import: Maila bilder till inkorgen.

$$$$

 Statistik-wrap: "Ditt fotoår" (snygg visuell sammanfattning).