CREATE TABLE IF NOT EXISTS orders (
  id          bigserial PRIMARY KEY,
  customer_id text        NOT NULL,
  sku         text        NOT NULL,
  qty         int         NOT NULL,
  status      text        NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- alguns pedidos iniciais para as listagens não começarem vazias
INSERT INTO orders (customer_id, sku, qty, status)
SELECT 'cust-' || (g % 50),
       'SKU-' || lpad(((g % 20) + 1)::text, 3, '0'),
       (g % 3) + 1,
       'confirmed'
FROM generate_series(1, 50) AS g;
