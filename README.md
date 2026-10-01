# S.E.R.A. — Sistem Electronic de Reglare și Automatizare

Aplicație de licență (ETTI, UPB) pentru monitorizarea și configurarea unei sere inteligente. Proiectul acoperă interfața web (frontend), backend-ul de telemetrie și infrastructura de autentificare (Keycloak), rulate împreună printr-un singur `docker-compose.yml`.

> Telemetria reală este integrată: un ESP32 publică pe MQTT, backend-ul o persistă în Postgres și o servește interfeței prin REST și WebSocket. Actuatoarele (pompă, ventilator) **nu sunt montate** și apar explicit ca indisponibile — nu există date simulate în aplicație.

---

## 1. Arhitectura de ansamblu

```text
┌──────────────────────────────────────────────────────────────────────┐
│  Proiectul `infra`  (sera-code/infra/docker-compose.yml)              │
│                                                                      │
│   ESP32 ──MQTT──►  sera-mosquitto  ──►  sera-telegraf  ──►  influxdb  │
│                     (1883)    │                                      │
└───────────────────────────────┼──────────────────────────────────────┘
                                │  rețeaua `infra_default`
┌───────────────────────────────┼──────────────────────────────────────┐
│  Proiectul `sera`  (acest repo)│                                      │
│                                ▼                                     │
│   ┌──────────────┐      ┌──────────────┐      ┌──────────────┐       │
│   │ keycloak-sera│◄────►│ backend-sera │◄────►│ postgres-sera│       │
│   │   :8080      │ JWT  │    :8081     │ JDBC │    :5432     │       │
│   └──────┬───────┘      └──────┬───────┘      └──────────────┘       │
│          │ OIDC                │ REST + STOMP                        │
│          └────────►┌───────────▼────┐                                │
│                    │ frontend-sera  │                                │
│                    │  :5173 → 80    │                                │
│                    └────────────────┘                                │
└──────────────────────────────────────────────────────────────────────┘
```

- **`frontend/`** — aplicația React (SPA) care rulează în producție într-un container Nginx, obținut printr-un build multi-stage (`node:22-alpine` → `nginx:1.27-alpine`).
- **`keycloak-sera`** — server de identitate (autentificare/autorizare), pornit cu `start-dev --import-realm`, care importă automat realm-ul `frontend/keycloak/realm-sera.json` și folosește o temă de login personalizată din `frontend/sera-theme/sera`.
- **`backend/`** — serviciu Spring Boot (Java 21) care se abonează la topicul MQTT `sera/senzori`, persistă citirile în Postgres și le expune prin REST (`/api/v1`) și STOMP (`/ws`). Regulile de cod sunt în [`backend/CLAUDE.md`](backend/CLAUDE.md).
- **`postgres-sera`** — baza de date a aplicației; schema vine exclusiv din migrări Flyway, iar Hibernate rulează cu `ddl-auto: validate`.
- **`docker-compose.yml`** (rădăcina repo-ului) — orchestrează cele patru servicii, cu dependențe pe healthcheck.

### Relația cu proiectul `infra`

Brokerul MQTT, Telegraf și InfluxDB rulează într-un **proiect compose separat**, lângă firmware-ul ESP32 (`sera-code/infra/`). Acest repo **nu le modifică și nu le înlocuiește**: backend-ul SERA se atașează la rețeaua `infra_default` și devine pur și simplu un al doilea abonat pe `sera/senzori`, lângă Telegraf. MQTT fiind publish/subscribe, cei doi consumatori nu se influențează — Influx continuă să primească exact aceleași date ca înainte.

Consecință practică: **proiectul `infra` trebuie pornit primul**. Docker Compose nu acceptă `depends_on` între proiecte diferite, deci dacă rețeaua lipsește, `docker compose up` eșuează imediat, cu mesaj explicit.

Viitor (neimplementat încă): backend + bază de date + comunicare cu un dispozitiv ESP32 pentru citiri reale de senzori. Acestea nu sunt incluse deliberat în stadiul actual, pentru a nu inventa contracte de API sau protocoale de comunicație înainte de a fi decise.

---

## 2. Structura repo-ului

```text
SERA/
├── docker-compose.yml        # orchestrare frontend + backend + postgres + keycloak
├── .env.example              # variabile de mediu (copiază în .env)
├── .gitignore
├── backend/
│   ├── CLAUDE.md             # reguli de cod curat pentru backend
│   ├── pom.xml               # Spring Boot 3.5 / Java 21 / Maven
│   ├── Dockerfile            # build multi-stage: maven → JRE alpine
│   └── src/main/
│       ├── java/ro/upb/etti/sera/
│       │   ├── common/        # tratarea erorilor, bean-ul Clock
│       │   ├── config/        # MQTT, securitate, WebSocket, proprietăți tipate
│       │   ├── ingest/        # consumul MQTT, throttling, health indicator
│       │   ├── telemetry/     # citiri, catalog de metrici, serii
│       │   ├── aggregate/     # agregare orară + retention
│       │   ├── events/        # jurnal de evenimente derivate
│       │   ├── device/        # starea stației + watchdog de offline
│       │   ├── settings/      # configurarea serei și pragurile
│       │   └── ws/            # broadcast STOMP
│       └── resources/
│           ├── application.yml
│           └── db/migration/V1__init.sql
└── frontend/
    ├── src/
    │   ├── app/               # router, providers, layout aplicație
    │   │   ├── layout/         # AppShell, Navbar, ProtectedApp
    │   │   ├── providers/      # AppProviders, query-client
    │   │   └── router/         # AppRouter
    │   ├── auth/               # integrare Keycloak (AuthProvider, useAuth, keycloak.ts)
    │   ├── components/ui/      # primitive shadcn/ui (Button, Card, Tabs, Popover, ...)
    │   ├── features/           # câte un folder per funcționalitate (owns page + components + hooks)
    │   │   ├── home/
    │   │   ├── status/
    │   │   ├── charts/
    │   │   ├── history/
    │   │   ├── settings/
    │   │   ├── profile/
    │   │   ├── start/
    │   │   └── theme/
    │   ├── api/               # client fetch, tipuri și chei de query
    │   ├── hooks/             # hook-uri partajate (socket live, catalog, stare device)
    │   ├── lib/                # utilitare (ex. `cn`, formatare)
    │   └── main.tsx
    ├── keycloak/
    │   └── realm-sera.json     # realm importat automat la pornirea Keycloak
    ├── sera-theme/sera/        # temă de login Keycloak personalizată (FreeMarker + CSS)
    ├── docs/                   # documentație internă (arhitectură, rute, features)
    ├── Dockerfile              # build multi-stage: node (build) → nginx (serve)
    ├── nginx.conf
    └── package.json
```

---

## 3. Stack tehnologic

### Frontend

| Categorie | Tehnologie |
|---|---|
| Framework | React 19 + TypeScript |
| Build tool | Vite 8 |
| Stilizare | Tailwind CSS v4 |
| Componente UI | shadcn/ui pe bază de Radix UI |
| Iconițe | Lucide React |
| Rutare | React Router DOM 7 |
| Stare server / caching | TanStack Query |
| Formulare | TanStack Form + Zod (validare) |
| Autentificare | Keycloak (`keycloak-js`) |
| Lint | oxlint |

Stack-ul este fix și documentat în [`frontend/AGENTS_SERA.md`](frontend/AGENTS_SERA.md) — nu se introduc alternative (fără Axios, Bootstrap, MUI, Chakra, Ant Design, styled-components, Emotion sau sisteme de autentificare custom).

### Backend

| Categorie | Tehnologie |
|---|---|
| Limbaj | Java 21 |
| Framework | Spring Boot 3.5 |
| Consum MQTT | Spring Integration MQTT (Eclipse Paho) |
| Persistență | Spring Data JPA + PostgreSQL 17 |
| Migrări | Flyway (SQL versionat) |
| Securitate | OAuth2 Resource Server (JWT emis de Keycloak) |
| Push în timp real | WebSocket + STOMP |
| Documentare API | springdoc-openapi |
| Build | Maven, cu wrapper (`./mvnw`) |

Fără Lombok: `record`-urile din Java 21 acoperă aproape tot, iar restul ar fi cod generat invizibil. Regulile complete sunt în [`backend/CLAUDE.md`](backend/CLAUDE.md).

### Identitate / Autentificare

- **Keycloak 26.7.0**, rulat cu `start-dev --import-realm`.
- Realm-ul `sera` este importat automat din `frontend/keycloak/realm-sera.json`.
- Temă de login proprie (`sera-theme/sera`), montată ca volum în containerul Keycloak.
- Healthcheck dedicat (probă TCP pe portul de management 9000, verifică `status: UP`), deoarece imaginea Keycloak nu are `curl`/`wget`.

### Containerizare

- **Frontend**: build multi-stage — `npm ci && npm run build` într-un stagiu Node, apoi artefactele statice sunt servite de Nginx (`nginx.conf` propriu).
- **Keycloak**: imagine oficială `quay.io/keycloak/keycloak`, fără build local.
- **Volum persistent** `keycloak-data` — păstrează datele Keycloak (utilizatori, sesiuni, configurație realm) între restart-uri de containere.

---

## 4. Funcționalitate — rutele aplicației

Aplicația este un SPA cu următoarele rute principale:

| Rută | Pagină | Responsabilitate (curentă / viitoare) |
|---|---|---|
| `/` | **Home** | Prezentare/landing; acces prin click pe sigla SERA din navbar (nu există buton explicit „Acasă”). Va afișa date curente pentru ambele plante (temperatură, umiditate, lumină, sol etc.). |
| `/status` | **STATUS** | Starea actuatoarelor (pompe, ventilatoare). Nu există concept de „mod Manual/Automat” — exclus intenționat din aplicație. |
| `/grafice` | **GRAFICE** | Evoluția istorică a parametrilor pentru ambele plante (grafice). |
| `/istoric` | **ISTORIC** | Jurnal de evenimente / istoricul sistemului. |
| `/setari` | **SETĂRI** | Nume/descriere seră, interval de citire senzori, praguri de alertă, configurare sistem, status conexiune ESP32. |
| *(popup profil)* | **Profil** | Date personale ale utilizatorului; accesibil doar din popup-ul de profil, nu din navigarea centrală. |

### Navbar

- Stânga: siglă frunză + wordmark „SERA” (colorate cu accentul curent), click → Home.
- Centru: STATUS / GRAFICE / ISTORIC / SETĂRI — stil discret, fără fundal permanent, doar hover subtil.
- Dreapta: control **TEMA** (popup) și control **profil** (popup), vizual mai distincte față de navigarea centrală.

### Sistem de temă

Două axe independente de personalizare vizuală:

1. **Mod de afișare** — Light / Dark (fundal neutru: gri foarte deschis / gri închis).
2. **Culoare de accent** — una dintre:
   - Brad `#139438`
   - Iris `#4948E8`
   - Trandafir `#D62957`
   - Lavandă `#9673E7`

Accentul influențează sigla, starea activă din navbar, acțiunile primare, focus ring-uri și emfaza din grafice — fără a recolora fundalul întregii aplicații. Culorile sunt centralizate prin token-uri CSS (`--background`, `--accent-color`, `--ring`, etc.), nu împrăștiate în componente.

---

## 5. Arhitectura frontend-ului (principii cheie)

- **Ownership pe feature**: fiecare folder din `src/features/<nume>/` deține pagina, componentele, hook-urile, schema și tipurile proprii — nu se amestecă responsabilități între feature-uri.
- **Primitive shadcn/ui** trăiesc exclusiv în `src/components/ui/`; nu se duplică sau re-stilizează local (ex. `CustomButton`).
- **Stare server** exclusiv prin TanStack Query (query keys centralizate); niciun apel HTTP direct în componente de UI.
- **Formulare complexe** prin TanStack Form + Zod, cu schema ca sursă unică de adevăr pentru validare.
- **Autentificare** — Keycloak este singura autoritate; TanStack Query nu gestionează sesiunea, doar starea de server ce necesită token valid.
- **TypeScript strict** — `any` interzis; date externe validate prin Zod la granițele de încredere.
- **Fișiere sub ~300 linii**, fără abstractizări premature, fără dependențe adăugate „de conveniență”.

Regulile complete de arhitectură, convenții de naming, structură de foldere și workflow pentru contribuții sunt documentate exhaustiv în [`frontend/AGENTS_SERA.md`](frontend/AGENTS_SERA.md) și în [`frontend/docs/`](frontend/docs).

---

## 6. Rulare locală

### Cu Docker Compose (recomandat)

**Pasul 1 — pornește infrastructura MQTT** (alt proiect compose, lângă firmware):

```bash
cd ../sera-code/infra && docker compose up -d
```

**Pasul 2 — configurează variabilele de mediu**, o singură dată:

```bash
cp .env.example .env
```

**Pasul 3 — pornește aplicația**, din rădăcina acestui repo:

```bash
docker compose up -d --build
```

Servicii disponibile după pornire:

| Serviciu | Adresă | Observații |
|---|---|---|
| Frontend | http://localhost:5173 | |
| Backend (OpenAPI) | http://localhost:8081/swagger-ui.html | |
| Backend (health) | http://localhost:8081/actuator/health | include starea conexiunii MQTT |
| Keycloak | http://localhost:8080 | `admin` / `admin`, doar pentru dezvoltare locală |
| Postgres | `localhost:5432` | utilizator și bază `sera` |

Ordinea de pornire este impusă prin healthcheck-uri: backend-ul așteaptă ca Postgres să fie `healthy` (altfel Flyway ar eșua la prima rulare), iar frontend-ul așteaptă Keycloak.

### Lucrul cu baza de date din terminal

Portul 5432 este publicat pe host, deci te poți conecta și cu psql, DBeaver, pgAdmin sau IntelliJ. Direct din container:

```bash
docker compose exec postgres-sera psql -U sera -d sera
```

Câte citiri există per metrică și cât de recente sunt:

```bash
docker compose exec postgres-sera psql -U sera -d sera -c "select metric, plant_id, count(*), max(ts) from reading group by 1,2 order by 1;"
```

### Backend fără Docker

```bash
cd backend
./mvnw spring-boot:run     # necesită Postgres și brokerul MQTT accesibile
./mvnw verify              # compilare + teste
```

### Dezvoltare directă (fără Docker, doar frontend)

```bash
cd frontend
npm install
npm run dev       # server de dezvoltare Vite
npm run build      # tsc -b && vite build
npm run lint       # oxlint
npm run preview
```

Necesită o instanță Keycloak accesibilă (local sau prin `docker compose up keycloak-sera`) pentru ca autentificarea să funcționeze.

---

## 7. Telemetria

Senzorii reali și câmpurile pe care le publică ESP32-ul pe topicul `sera/senzori`:

```json
{"temp":27.21,"umid":28.38672,"presiune":1003.628,"lux":12.5,"sol1":100,"sol2":100}
```

| Metrică | Unitate | Nivel | Câmp MQTT | Senzor |
|---|---|---|---|---|
| `TEMP_AIR` | °C | seră | `temp` | BME280 |
| `HUMIDITY_AIR` | % | seră | `umid` | BME280 |
| `PRESSURE` | hPa | seră | `presiune` | BME280 |
| `LUX` | lx | seră | `lux` | BH1750 |
| `SOIL_MOISTURE` | % | plantă (P1, P2) | `sol1`, `sol2` | senzor capacitiv |

Patru metrici sunt la nivel de seră și una este per plantă, de aceea tabelul `reading` este lung/îngust, cu `plant_id` nullable, în loc de lat cu o coloană per senzor.

Trei decizii merită reținute, pentru că nu sunt evidente din cod:

- **Ritmul de scriere.** Device-ul publică la 1 Hz. Fiecare mesaj pleacă imediat pe WebSocket, deci interfața este în timp real, dar în Postgres se scrie doar la 5 secunde (`SERA_PERSIST_INTERVAL`) — altfel baza ar crește cu ~518.000 de rânduri pe zi fără câștig de informație.
- **Mesajele retained sunt ignorate.** Pe topic există un mesaj păstrat de broker dintr-o versiune anterioară de firmware, livrat instant la fiecare abonare chiar cu ESP32-ul oprit. Fără filtrul explicit din `TelemetryIngestService`, fiecare pornire de backend ar înregistra o valoare veche ca fiind proaspătă.
- **Eticheta de sol este recalculată.** Firmware-ul o calculează în `soilLabel()`, dar publică doar procentul; backend-ul o reconstruiește cu aceleași praguri (20/40/70), configurate în `application.yml`.

---

## 8. Stadiu actual și limitări cunoscute

- **Actuatoarele nu sunt montate.** Nu există endpoint pentru ele și nici valori afișate: apar ca plăci dezactivate, marcate „Indisponibil — hardware nemontat”. Structura rămâne la locul ei, ca pagina să fie gata când echipamentul apare.
- **Backend-ul este read-only față de device.** Nu publică niciodată pe MQTT; pragurile din Setări sunt folosite doar pentru generarea alertelor, nu sunt trimise către ESP32.
- **ESP32-ul publică la QoS 0**, iar brokerul nu reține mesaje pentru abonați deconectați. Backend-ul se reconectează automat în câteva secunde, dar citirile din timpul unei opriri a lui se pierd pentru Postgres (Influx continuă să le primească prin Telegraf). Zero pierderi ar cere înlocuirea bibliotecii MQTT din firmware, pentru că PubSubClient publică doar QoS 0.

---

## 9. Licență

Proiect realizat în cadrul lucrării de licență — Facultatea de Electronică, Telecomunicații și Tehnologia Informației (ETTI), Universitatea Politehnica din București (UPB).
