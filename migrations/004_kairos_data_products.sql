CREATE TABLE IF NOT EXISTS kairos_data_products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  domain TEXT NOT NULL,
  owner TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ACTIVE','DRAFT','DEPRECATED')),
  sla_tier TEXT NOT NULL CHECK (sla_tier IN ('Tier 1 (99.9%)','Tier 2 (99.5%)','Tier 3 (99.0%)')),
  contract_version TEXT NOT NULL DEFAULT '1.0.0',
  description TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS kairos_data_product_assets (
  product_id TEXT NOT NULL REFERENCES kairos_data_products(id) ON DELETE CASCADE,
  asset_id TEXT NOT NULL REFERENCES kairos_assets(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, asset_id)
);