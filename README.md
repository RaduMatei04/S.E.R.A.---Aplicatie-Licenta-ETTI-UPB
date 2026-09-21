# S.E.R.A. — Sistem Electronic de Reglare și Automatizare

Aplicație de licență (ETTI, UPB) pentru monitorizarea și configurarea unei sere inteligente. Proiectul acoperă interfața web (frontend) și infrastructura de autentificare (Keycloak) rulate împreună printr-un singur `docker-compose.yml`.

> Faza curentă este **UI-first**: dispozitivul ESP32, integrarea cu backend-ul și telemetria reală nu există încă. Interfața este construită astfel încât aceste integrări să poată fi adăugate ulterior fără a restructura frontend-ul.

---

## 1. Arhitectura de ansamblu

```text
┌─────────────────────────────────────────────────────────┐
│                        Docker host                       │
│                                                           │
│   ┌────────────────────┐        ┌────────────────────┐   │
│   │   keycloak-sera     │        │   frontend-sera     │   │
│   │  (Keycloak 26.7.0)  │◄──────►│ (React + Nginx)     │   │
│   │  port 8080          │  OIDC  │  port 5173 → 80      │   │
│   └─────────┬───────────┘        └────────────────────┘   │
│             │                                             │
│      volum  │ keycloak-data (persistență realm/useri)     │
│             │ import realm-sera.json la pornire            │
│             │ temă custom "sera" (login theme)             │
└─────────────┴─────────────────────────────────────────────┘
```

- **`frontend/`** — aplicația React (SPA) care rulează în producție într-un container Nginx, obținut printr-un build multi-stage (`node:22-alpine` → `nginx:1.27-alpine`).
- **`keycloak-sera`** — server de identitate (autentificare/autorizare), pornit cu `start-dev --import-realm`, care importă automat realm-ul `frontend/keycloak/realm-sera.json` și folosește o temă de login personalizată din `frontend/sera-theme/sera`.
- **`docker-compose.yml`** (rădăcina repo-ului) — orchestrează cele două servicii; frontend-ul pornește doar după ce Keycloak trece healthcheck-ul (`condition: service_healthy`).

Viitor (neimplementat încă): backend + bază de date + comunicare cu un dispozitiv ESP32 pentru citiri reale de senzori. Acestea nu sunt incluse deliberat în stadiul actual, pentru a nu inventa contracte de API sau protocoale de comunicație înainte de a fi decise.

---

## 2. Structura repo-ului

```text
SERA/
├── docker-compose.yml        # orchestrare frontend + keycloak
├── .gitignore
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
    │   ├── lib/                # utilitare (ex. `cn`)
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

Din rădăcina repo-ului:

```bash
docker compose up -d --build
```

Servicii disponibile după pornire:

- **Frontend**: http://localhost:5173
- **Keycloak (admin console)**: http://localhost:8080 (`admin` / `admin` — doar pentru dezvoltare locală)

Frontend-ul așteaptă automat ca Keycloak să devină `healthy` înainte de a porni (import realm + temă custom deja configurate).

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

## 7. Stadiu actual și limitări cunoscute

- Nu există backend și nici bază de date — sunt excluse intenționat din acest repo în etapa curentă.
- Nu există integrare reală cu ESP32; nu se folosesc date de senzori simulate ca fiind reale.
- Nu există protocoale de comunicație (REST/MQTT/WebSocket) decise încă pentru telemetrie.
- Structura este pregătită să primească aceste integrări ulterior prin query-uri TanStack, fără a rescrie componentele de prezentare.

---

## 8. Licență

Proiect realizat în cadrul lucrării de licență — Facultatea de Electronică, Telecomunicații și Tehnologia Informației (ETTI), Universitatea Politehnica din București (UPB).
