# Smart Zigbee Thermostat Interface 🌡️

Een moderne, volledig aanpasbare thermostaat interface ontworpen voor integratie met Home Assistant. Deze applicatie biedt een high-end "tablet-aan-de-muur" ervaring met dynamische weerachtergronden, uitgebreide schema's en gedetailleerde instellingen.

![Hoofdscherm](docs/images/banner.png)
*(Plaats hier een screenshot van het hoofdscherm)*

## ✨ Mogelijkheden

### 🎨 Visueel & Interface
*   **Dynamische Achtergronden**: De achtergrond verandert automatisch op basis van het lokale weer (via Open-Meteo API) en dagdeel (licht/donker).
*   **Glassmorphism Design**: Moderne semi-transparante vlakken met instelbare blur en transparantie.
*   **Volledig Aanpasbare Layout**: Via de instellingen kun je de UI schalen, verticale afstanden aanpassen en grafieken vergroten of verbergen. Perfect voor elk formaat tablet of scherm.
*   **Screensaver & Dimmen**: Het scherm dimt automatisch naar een instelbaar niveau na inactiviteit. Tikt of beweegt u, dan licht het weer op.

### 🌡️ Klimaatbeheersing
*   **Intuïtieve Bediening**: Swipe horizontaal over het scherm of gebruik de grote knoppen om de temperatuur aan te passen.
*   **Slimme Modi**: Schakelt automatisch tussen 'Thuis', 'Slapen' en 'Weg' op basis van het ingestelde programma.
*   **Zomermodus**: Voorkomt onnodig stoken in de zomer met een vaste "anti-vorst" temperatuur.
*   **Vakantiemodus**: Stel een periode in waarin de temperatuur laag blijft.

### 📅 Planning & Schema's
*   **Werkdagen & Weekend**: Aparte schema's met onbeperkte tijdsloten.
*   **Labels**: Geef tijdsloten namen zoals "Opstaan", "Werk", "Thuis", "Slapen".
*   **Visueel Beheer**: Tijdsloten toevoegen, wijzigen en verwijderen direct vanuit de interface.

### ⚙️ Geavanceerde Systeeminstellingen
*   **Hysteresis**: Instelbare schakelmarge (bijv. 0.3°C) om pendelen van de CV te voorkomen.
*   **Calibratie**: Corrigeer de temperatuursensor met een offset als deze afwijkt.
*   **Onderhoudsmodus**: Voorkom vastroesten van kleppen door de pomp periodiek te laten draaien (frequentie en duur instelbaar).

---

## 📸 Screenshots

| Hoofdscherm | Instellingen: Programma |
|:-----------:|:-----------------------:|
| ![Hoofdscherm](docs/images/hoofdscherm.png) | ![Programma](docs/images/programma.png) |
| *Duidelijke weergave van temp & weer* | *Eenvoudig slepen en instellen* |

| Instellingen: Weergave | Instellingen: Layout |
|:-----------:|:--------------------:|
| ![Weergave](docs/images/weergave.png) | ![Layout](docs/images/layout.png) |
| *Pas transparantie en dimmen aan* | *Schaal de interface voor jouw scherm* |

---

## 🚀 Installatie

Deze applicatie is gebouwd met React. Je kunt hem lokaal draaien of hosten op een server (of Home Assistant zelf) en integreren als dashboard.

### 1. Vereisten
*   Node.js (versie 16 of hoger)
*   NPM of Yarn

### 2. Project bouwen
Clone deze repository en installeer de afhankelijkheden:

```bash
git clone https://github.com/jouw-naam/smart-thermostat.git
cd smart-thermostat
npm install
```

Start de applicatie in development modus:
```bash
npm start
```
De app draait nu op `http://localhost:3000`.

### 3. Integratie in Home Assistant

Om dit als hoofdscherm in Home Assistant te gebruiken, heb je twee opties:

#### Optie A: Webpage Card (Iframe)
1.  Host de applicatie (bijvoorbeeld via Vercel, Netlify, of een lokale webserver/Docker container).
2.  Ga in Home Assistant naar je dashboard → **Bewerk Dashboard**.
3.  Voeg een nieuwe kaart toe: **Webpagina**.
4.  Vul de URL in waar de app draait.
5.  Zet 'Aspect Ratio' op 100% of gebruik "Panel Mode" (Venstermodus) voor het dashboard.

#### Optie B: Statische HTML in `www` map
1.  Bouw de app voor productie:
    ```bash
    npm run build
    ```
2.  Hernoem de map `build` naar `thermostat` en upload deze naar de `/config/www/` map in je Home Assistant.
3.  Je kunt de thermostaat nu benaderen via: `http://<JOUW_HA_IP>:8123/local/thermostat/index.html`
4.  Gebruik deze URL in een Webpagina kaart of iframe paneel.

---

## 🛠️ Gebruik

### Temperatuur Wijzigen
*   **Touch/Muis**: Sleep horizontaal over het midden van het scherm (van links naar rechts) om de temperatuur te verhogen of te verlagen.
*   **Knoppen**: Gebruik de pijltjes omhoog/omlaag voor stappen van 0.5°C.

### Instellingen Openen
Druk op het scherm (of beweeg de muis) om de interface op te lichten. Klik op het **tandwiel-icoon** rechtsboven (verschijnt bij activiteit) om het menu te openen.

### Layout Aanpassen
Ziet de interface er niet goed uit op jouw tablet?
1.  Ga naar **Instellingen** > **Layout**.
2.  Gebruik **Kaart Grootte** om alles te schalen.
3.  Gebruik **Grafiek Hoogte** om de grafieken kleiner te maken of te verbergen als ze niet passen.

---

## 🤝 Bijdragen
Heb je ideeën voor verbeteringen of wil je Zigbee2MQTT integratie toevoegen? Pull requests zijn welkom!

1.  Fork het project
2.  Maak je feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit je wijzigingen (`git commit -m 'Add some AmazingFeature'`)
4.  Push naar de branch (`git push origin feature/AmazingFeature`)
5.  Open een Pull Request

---

## 📄 Licentie
Gedistribueerd onder de MIT Licentie.
