# Vässarö AIS

En interaktiv karta för att följa Vässarös fartyg i realtid via AIS (Automatic Identification System).

## Om projektet

Kartan visar var Vässarös egna fartyg befinner sig just nu, hämtar positionsdata live och låter dig också gå tillbaka i historiken för att se var ett fartyg har rört sig. Appen är byggd för bruk på Vässarö och dess omgivande farvatten.


## Funktioner

### Realtidskarta
- Live-positioner via WebSocket – kartan uppdateras automatiskt utan omladdning
- Riktningsvisare (pil) som roterar efter fartygets kurs
- Hastighetsvektorer som visar vart fartyget är på väg
- Popup med fartygsinfo: fart, kurs, navigeringsstatus, koordinater och senast sedd

### Filter och vyer
- **Visa alla fartyg** – växlar mellan att bara visa Vässarös fartyg och SSRS fartyg eller alla AIS-sändare i området
- **Visa fasta punkter** – visar stationära AIS-sändare (t.ex. referenspunkter och grund)
- **Visa offline-fartyg** – visar Vässarös fartyg som inte sänt nyligen men fortfarande har historik

### Hamnar
Fasta markörer för hamnar och kajer i närheten:
- Djuphamn
- Fladan
- Strömsviken
- Öregrund
- Äspskär
- Sundsveden

### Rutt-historik
Klicka på ett fartyg och välj "Se historik" för att läsa in positionshistorik:

| Val | Beskrivning |
|-----|-------------|
| 12h | Nedsamplad data för de senaste 12 timmarna |
| 24h | Nedsamplad data för de senaste 24 timmarna |
| 48h | Nedsamplad data för de senaste 48 timmarna |
| Exakt data 48h | Fullupplöst rådata – tar längre tid att ladda |

I historikläge visas:
- Fartygets rutt som en streckad linje på kartan
- En slider för att scrolla igenom tidpunkter
- Fart och kurs för varje position
- Datahål (ex. när sändaren inte nåddes) markeras gråa i slidern

#### Uppspelning
En **play-knapp** låter dig spela upp rutten automatiskt position för position. Ikonen växlar mellan play och paus. Fyra intervalltider väljs under slidern:

| Intervall | Hastighet |
|-----------|-----------|
| 0.1 s | Mycket snabb |
| 0.5 s | Snabb |
| 1 s | Normal (standard) |
| 2 s | Långsam |

Uppspelningen stannar automatiskt vid ett datahål eller vid ruttslutet. Att dra i slidern eller klicka på pil-knapparna stoppar uppspelningen.

### Kartlager
- **OpenStreetMap** – standardvy
- **Satellit** – flygfoto via Esri/Maxar

Sjömilsskala visas alltid i nedre högra hörnet.

## Teknik

| Komponent | Bibliotek |
|-----------|-----------|
| Karta | [Leaflet.js](https://leafletjs.com/) 1.9.4 |
| UI | [Bulma](https://bulma.io/) 1.0.4 |
| Ikoner | [Font Awesome](https://fontawesome.com/) 7.0 |
| Kartstöd | leaflet-rotatedmarker, leaflet-geometryutil |
| Sjömilsskala | Lokal `leaflet.nauticalscale.js` |
| Data | WebSocket + REST API via `jumpgate.vassaro.net` |

## Kom igång
Sidan nås [här](https://vassaro.github.io/AIS).