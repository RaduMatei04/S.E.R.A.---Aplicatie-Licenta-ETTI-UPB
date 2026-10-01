# CLAUDE.md — SERA Backend

Acest fișier este perechea lui `frontend/AGENTS_SERA.md`. Orice sesiune de lucru pe
`backend/` — umană sau agent — respectă regulile de aici fără să le renegocieze.

---

## 1. Context

SERA (Sistem Electronic de Reglare și Automatizare) este o aplicație de licență (ETTI, UPB)
pentru monitorizarea unei sere inteligente.

Backend-ul are un singur rol: **consumă telemetria publicată de ESP32 pe MQTT, o persistă în
Postgres și o servește frontend-ului** prin REST și WebSocket.

Fluxul complet:

```
ESP32 --MQTT--> sera-mosquitto --+--> sera-telegraf --> sera-influxdb   (proiectul `infra`, neatins)
                                 |
                                 +--> backend-sera --> postgres-sera --> REST/WS --> frontend-sera
```

### Reguli absolute

1. **Backend-ul este read-only față de device.** Nu publică NICIODATĂ pe MQTT. Nu există cod
   care trimite comenzi către ESP32. Dacă o cerință pare să ceară asta, se discută cu
   utilizatorul înainte, nu se implementează.
2. **Nu se inventează date, câmpuri, protocoale sau endpoint-uri.** Dacă hardware-ul nu
   există (actuatoarele nu sunt montate), nu se creează contract de API pentru el.
3. **Influx și Telegraf nu se ating.** Sunt un consumator paralel, în alt proiect compose.

---

## 2. Stack fix

- Java 21
- Spring Boot 3.5 (web, data-jpa, validation, websocket, oauth2-resource-server, actuator)
- Spring Integration MQTT (Paho)
- PostgreSQL + Flyway
- springdoc-openapi
- Maven, cu wrapper (`./mvnw`)

### Interzis explicit

- **Lombok.** `record`-urile din Java 21 acoperă aproape tot; restul ar fi cod generat
  invizibil, greu de depanat și greu de apărat într-o lucrare de licență.
- **`ddl-auto` diferit de `validate`.** Schema vine exclusiv din migrări Flyway.
- **Entități JPA expuse prin controllere.** Vezi §4.
- **Injecție pe câmp** (`@Autowired` pe atribut). Doar prin constructor.
- **`System.out.println`.** Doar SLF4J.
- **`@Value` împrăștiat prin cod.** Configurarea vine prin `@ConfigurationProperties` tipate.
- Biblioteci noi fără acordul explicit al utilizatorului.

---

## 3. Structura de pachete

**Package-by-feature, nu package-by-layer.** Fiecare feature își conține controller-ul,
serviciul, repository-ul, entitatea și DTO-urile. Nu există pachete globale `controllers/`,
`services/`, `repositories/` — altfel orice feature nou atinge trei pachete diferite.

```
ro.upb.etti.sera
├── SeraApplication.java
├── common/      # ApiExceptionHandler, tipuri partajate, bean-ul Clock
├── config/      # *Properties, SecurityConfig, WebSocketConfig, MqttConfig, OpenApiConfig
├── ingest/      # consumul MQTT: adapter, payload, serviciu de ingest, throttle, health
├── telemetry/   # citiri: entitate, repository, serviciu, controller, dto/
├── aggregate/   # agregare orară + retention
├── events/      # jurnal de evenimente derivate
├── device/      # starea device-ului + watchdog de offline
├── settings/    # configurarea serei și pragurile de alertă
└── ws/          # broadcast STOMP
```

Un pachet își expune serviciul; restul claselor din el sunt detaliu de implementare. Dacă
două feature-uri au nevoie de același lucru, acel lucru urcă în `common/`, nu se importă
lateral.

---

## 4. Reguli de strat

Dependențele merg într-o singură direcție:

```
Controller  ->  Service  ->  Repository
```

- **Controller-ul** traduce HTTP în apeluri de serviciu. Nu conține reguli de business, nu
  atinge niciodată un repository, nu construiește query-uri.
- **Serviciul** conține regulile. Nu știe de HTTP: fără `HttpServletRequest`, fără
  `ResponseEntity`, fără coduri de stare.
- **Repository-ul** doar citește și scrie. Fără reguli de business în `@Query`.

### Entitățile nu ies din stratul de serviciu

Controller-ele returnează exclusiv `record`-uri DTO. Motivul e dublu: previne serializarea
accidentală a relațiilor lazy (și `LazyInitializationException` în plin răspuns HTTP), și
decuplează contractul public al API-ului de schema bazei de date, ca o migrare să nu rupă
frontend-ul în tăcere.

GREȘIT — entitatea ajunge în JSON, schema DB devine contract public:

```java
@GetMapping("/{id}")
public Reading get(@PathVariable Long id) {
    return repository.findById(id).orElseThrow();
}
```

CORECT — serviciul întoarce un DTO:

```java
@GetMapping("/{id}")
public ReadingResponse get(@PathVariable Long id) {
    return service.findById(id);
}
```

### Injecție prin constructor

GREȘIT — dependență invizibilă, clasa nu poate fi testată fără Spring:

```java
@Autowired
private ReadingRepository repository;
```

CORECT:

```java
private final ReadingRepository repository;

TelemetryService(ReadingRepository repository) {
    this.repository = repository;
}
```

---

## 5. Convenții

### Denumire

| Tip | Sufix | Exemplu |
|---|---|---|
| Controller REST | `*Controller` | `TelemetryController` |
| Serviciu de domeniu | `*Service` | `TelemetryService` |
| Repository Spring Data | `*Repository` | `ReadingRepository` |
| DTO de intrare | `*Request` | `UpdateSettingsRequest` |
| DTO de ieșire | `*Response` | `CurrentTelemetryResponse` |
| Configurare tipată | `*Properties` | `IngestProperties` |
| Migrare Flyway | `V<n>__descriere.sql` | `V1__init.sql` |

### Limbă

**Identificatorii sunt în engleză, mesajele către utilizator în română.** Amestecul de limbi
în numele de clase și metode este cea mai frecventă sursă de inconsistență într-un proiect
scris parțial în română. Etichetele afișate (`label_ro` în catalogul de metrici, mesajele din
evenimente) sunt în română pentru că ajung direct pe ecran.

### Imutabilitate

`record` pentru DTO-uri și pentru `@ConfigurationProperties`. `final` pe toate câmpurile de
dependență. Entitățile JPA fac excepție — Hibernate are nevoie de constructor fără argumente
și de setteri pentru câmpurile mutabile.

### Zero valori magice

Fiecare prag, interval, nume de topic sau limită vine dintr-un `*Properties` tipat, cu valoare
implicită în `application.yml` și posibilitate de suprascriere prin variabilă de mediu. Un
număr literal într-o condiție de business este un bug care așteaptă.

---

## 6. Persistență

- **Orice schimbare de schemă este o migrare Flyway nouă.** O migrare deja aplicată nu se
  editează niciodată — Flyway verifică suma de control și refuză pornirea.
- `spring.jpa.hibernate.ddl-auto: validate` este plasa de siguranță: aplicația refuză să
  pornească dacă entitățile nu corespund schemei, în loc să modifice baza în tăcere.
- Numele de tabele și coloane sunt `snake_case`, la singular pentru tabele (`reading`, nu
  `readings`).
- Orice tabel cu serie de timp are index pe `(ts desc)` și o constrângere de unicitate care
  face inserarea idempotentă.

---

## 7. Erori

Serviciile aruncă excepții de domeniu (`SettingsNotFoundException`, `UnknownMetricException`).
Traducerea în răspuns HTTP se face **o singură dată**, în `common/ApiExceptionHandler`, prin
`@RestControllerAdvice`, către `ProblemDetail` (RFC 7807).

Un controller nu prinde excepții ca să le transforme în coduri de stare. Un serviciu nu
întoarce `null` pentru „nu există”.

---

## 8. Logare

- Doar SLF4J, prin `LoggerFactory.getLogger(ClasaCurenta.class)`.
- `debug` — fiecare mesaj MQTT primit. La 1 Hz, pe `info` ar face logul inutilizabil.
- `info` — **doar tranziții de stare**: conectare/deconectare de la broker, reabonare, device
  trecut offline/online, rulări de job cu rezultat.
- `warn` — payload invalid, valoare în afara intervalului fizic, mesaj ignorat.
- `error` — doar ce cere intervenție.
- Niciodată date sensibile: fără token-uri, fără parole, fără conținut de JWT.

---

## 9. Testare

- **Teste unitare fără Spring** pentru logica pură: `SoilStateResolver`, `EventDetector`,
  `PersistenceThrottle`. Sunt rapide și prind exact regulile care contează.
- **`@DataJpaTest` cu Testcontainers** pentru repository-uri — pe Postgres real, nu H2.
  Diferențele de dialect (`jsonb`, `ON CONFLICT`, `DISTINCT ON`) fac H2 inutil aici.
- **Un singur `@SpringBootTest`** care verifică doar că aplicația pornește și contextul se
  construiește.
- Testele nu depind de brokerul real și nu au nevoie de ESP32 pornit.

---

## 10. Checklist de refactor (înainte de fiecare commit)

- O metodă peste ~25 de linii se sparge în pași cu nume.
- O clasă cu mai mult de o responsabilitate se împarte.
- Un `if` pe un string literal devine `enum`.
- Duplicarea apărută a treia oară se extrage; de două ori se tolerează.
- Orice `TODO` primește fie o rezolvare, fie un issue — niciodată nu rămâne orfan.
- Orice valoare numerică nouă într-o regulă de business intră într-un `*Properties`.
- Importurile nefolosite și codul mort dispar.

---

## 11. Ce nu se inventează

- Endpoint-uri pentru hardware care nu e montat (actuatoare).
- Câmpuri care nu există în payload-ul real al ESP32.
- Comenzi către device, în orice formă.
- Valori implicite „plauzibile” pentru senzori care lipsesc — un câmp absent din payload nu
  produce rând în baza de date.
