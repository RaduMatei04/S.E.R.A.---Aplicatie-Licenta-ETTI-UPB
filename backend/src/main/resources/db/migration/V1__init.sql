-- Schema initiala SERA.
--
-- Patru marimi sunt la nivel de sera (un singur BME280, un singur BH1750) si una
-- este per planta (senzorul de sol). Din cauza acestei asimetrii tabelul de citiri
-- este lung/ingust, cu `plant_id` nullable, nu lat cu o coloana per senzor: altfel
-- fiecare rand de planta ar avea coloanele globale NULL.

-- ---------------------------------------------------------------------------
-- Catalogul de metrici: sursa unica pentru unitati, etichete si validare.
-- UI-ul citeste de aici, deci nu hardcodeaza niciodata "°C" sau "hPa".
-- ---------------------------------------------------------------------------
CREATE TABLE metric (
    code       TEXT PRIMARY KEY,
    unit       TEXT    NOT NULL,
    label_ro   TEXT    NOT NULL,
    per_plant  BOOLEAN NOT NULL,
    min_valid  NUMERIC NOT NULL,
    max_valid  NUMERIC NOT NULL,
    sort_order INTEGER NOT NULL,
    CONSTRAINT metric_valid_range CHECK (min_valid < max_valid)
);

-- Intervalele de validare sunt limitele fizice ale senzorilor, nu praguri de alerta:
-- ce iese din ele inseamna citire gresita, nu conditie de seara nepotrivita.
INSERT INTO metric (code, unit, label_ro, per_plant, min_valid, max_valid, sort_order) VALUES
    ('TEMP_AIR',      '°C',   'Temperatura aerului', FALSE, -40,  85,    1),
    ('HUMIDITY_AIR',  '%',    'Umiditatea aerului',  FALSE,   0, 100,    2),
    ('PRESSURE',      'hPa',  'Presiune atmosferica', FALSE, 300, 1100,  3),
    ('LUX',           'lx',   'Lumina',              FALSE,   0, 65535,  4),
    ('SOIL_MOISTURE', '%',    'Umiditatea solului',  TRUE,    0, 100,    5);

-- ---------------------------------------------------------------------------
-- Citirile brute.
-- ---------------------------------------------------------------------------
CREATE TABLE reading (
    id       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ts       TIMESTAMPTZ NOT NULL,
    metric   TEXT        NOT NULL REFERENCES metric (code),
    plant_id TEXT        NULL,
    value    NUMERIC     NOT NULL,
    payload  JSONB       NULL,
    CONSTRAINT reading_plant_matches_metric CHECK (
        (plant_id IS NULL) OR (plant_id IN ('P1', 'P2'))
    ),
    -- NULLS NOT DISTINCT (Postgres 15+) face unicitatea sa functioneze si pentru
    -- metricile globale, unde plant_id este NULL. Fara el, acelasi timestamp ar
    -- putea fi inserat de oricate ori la retrimiteri.
    CONSTRAINT reading_unique_sample UNIQUE NULLS NOT DISTINCT (metric, plant_id, ts)
);

CREATE INDEX reading_ts_idx ON reading (ts DESC);
CREATE INDEX reading_metric_plant_ts_idx ON reading (metric, plant_id, ts DESC);

-- ---------------------------------------------------------------------------
-- Agregate orare, pentru graficele pe intervale lungi.
-- ---------------------------------------------------------------------------
CREATE TABLE reading_hourly (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    bucket       TIMESTAMPTZ NOT NULL,
    metric       TEXT        NOT NULL REFERENCES metric (code),
    plant_id     TEXT        NULL,
    min_value    NUMERIC     NOT NULL,
    avg_value    NUMERIC     NOT NULL,
    max_value    NUMERIC     NOT NULL,
    sample_count INTEGER     NOT NULL,
    CONSTRAINT reading_hourly_unique_bucket UNIQUE NULLS NOT DISTINCT (bucket, metric, plant_id)
);

CREATE INDEX reading_hourly_bucket_idx ON reading_hourly (bucket DESC);

-- ---------------------------------------------------------------------------
-- Jurnalul de evenimente, derivate de backend din telemetrie.
-- ---------------------------------------------------------------------------
CREATE TABLE event (
    id       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ts       TIMESTAMPTZ NOT NULL,
    type     TEXT        NOT NULL,
    severity TEXT        NOT NULL,
    metric   TEXT        NULL REFERENCES metric (code),
    plant_id TEXT        NULL,
    value    NUMERIC     NULL,
    message  TEXT        NOT NULL,
    source   TEXT        NOT NULL DEFAULT 'BACKEND',
    CONSTRAINT event_type_known CHECK (type IN (
        'THRESHOLD_HIGH', 'THRESHOLD_LOW', 'DEVICE_OFFLINE', 'DEVICE_ONLINE', 'INVALID_READING'
    )),
    CONSTRAINT event_severity_known CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL'))
);

CREATE INDEX event_ts_idx ON event (ts DESC);
CREATE INDEX event_type_ts_idx ON event (type, ts DESC);

-- ---------------------------------------------------------------------------
-- Configurarea serei. Un singur rand - aplicatia are o singura sera.
-- Valorile sunt folosite DOAR pentru detectia de alerte; nimic nu se trimite
-- catre ESP32, backend-ul fiind read-only fata de device.
-- ---------------------------------------------------------------------------
CREATE TABLE greenhouse_settings (
    id                   SMALLINT PRIMARY KEY,
    name                 TEXT     NOT NULL,
    description          TEXT     NULL,
    read_interval_second INTEGER  NOT NULL,
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT greenhouse_settings_single_row CHECK (id = 1),
    CONSTRAINT greenhouse_settings_interval_positive CHECK (read_interval_second > 0)
);

INSERT INTO greenhouse_settings (id, name, description, read_interval_second) VALUES
    (1, 'Sera SERA', 'Sera de laborator cu doua plante monitorizate.', 1);

-- ---------------------------------------------------------------------------
-- Praguri de alerta. Tabel separat (nu JSONB) pentru ca solul are praguri
-- per planta, iar un prag trebuie sa poata fi dezactivat individual.
-- ---------------------------------------------------------------------------
CREATE TABLE threshold (
    id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    metric    TEXT    NOT NULL REFERENCES metric (code),
    plant_id  TEXT    NULL,
    min_value NUMERIC NULL,
    max_value NUMERIC NULL,
    enabled   BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT threshold_unique_target UNIQUE NULLS NOT DISTINCT (metric, plant_id),
    CONSTRAINT threshold_has_bound CHECK (min_value IS NOT NULL OR max_value IS NOT NULL),
    CONSTRAINT threshold_bounds_ordered CHECK (
        min_value IS NULL OR max_value IS NULL OR min_value < max_value
    )
);

-- Praguri initiale, deliberat largi: scopul lor este sa existe structura, nu sa
-- impuna conditii agronomice pe care nu le-a cerut nimeni. Se ajusteaza din /setari.
INSERT INTO threshold (metric, plant_id, min_value, max_value, enabled) VALUES
    ('TEMP_AIR',      NULL,  10,   35, TRUE),
    ('HUMIDITY_AIR',  NULL,  20,   80, TRUE),
    ('PRESSURE',      NULL, 950, 1050, FALSE),
    ('LUX',           NULL,   0, 50000, FALSE),
    ('SOIL_MOISTURE', 'P1',  20,   90, TRUE),
    ('SOIL_MOISTURE', 'P2',  20,   90, TRUE);
