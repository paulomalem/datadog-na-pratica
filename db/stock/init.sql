CREATE TABLE IF NOT EXISTS stock (
  sku text PRIMARY KEY,
  qty int NOT NULL
);

INSERT INTO stock (sku, qty)
SELECT 'SKU-' || lpad(g::text, 3, '0'), 1000000
FROM generate_series(1, 20) AS g;

-- Tabela grande para o cenário de consulta lenta (2 milhões de linhas)
CREATE TABLE IF NOT EXISTS movements (
  id         bigserial PRIMARY KEY,
  sku        text        NOT NULL,
  ref        text        NOT NULL,
  qty        int         NOT NULL,
  note       text,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO movements (sku, ref, qty, note)
SELECT 'SKU-' || lpad(((g % 20) + 1)::text, 3, '0'),
       'REF-' || lpad(((g % 5000) + 1)::text, 5, '0'),
       (g % 5) + 1,
       md5(g::text)
FROM generate_series(1, 2000000) AS g;

-- O índice em ref existe, mas a consulta "lenta" usa lower(ref) e não consegue usá-lo
CREATE INDEX idx_movements_ref ON movements (ref);
ANALYZE movements;
