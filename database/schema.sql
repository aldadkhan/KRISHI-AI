CREATE TABLE IF NOT EXISTS farmers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150),
    identifier VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(20) NOT NULL DEFAULT 'farmer' CHECK (role IN ('farmer', 'admin')),
    mobile VARCHAR(20),
    email VARCHAR(150),
    district VARCHAR(100),
    panchayat VARCHAR(150),
    preferred_language VARCHAR(10) DEFAULT 'ml',
    main_crop VARCHAR(100),
    land_area NUMERIC(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE farmers ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE farmers ALTER COLUMN password_hash DROP NOT NULL;
ALTER TABLE farmers ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'farmer';

CREATE TABLE IF NOT EXISTS farmer_queries (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER REFERENCES farmers(id) ON DELETE CASCADE,
    query_text TEXT NOT NULL,
    language VARCHAR(10),
    crop VARCHAR(100),
    district VARCHAR(100),
    image_url TEXT,
    ai_response TEXT,
    confidence NUMERIC(5,2),
    status VARCHAR(30) DEFAULT 'answered',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE farmer_queries ADD COLUMN IF NOT EXISTS image_url TEXT;

CREATE TABLE IF NOT EXISTS government_schemes (
    id SERIAL PRIMARY KEY,
    scheme_name VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    description TEXT,
    eligibility TEXT,
    benefits TEXT,
    application_url TEXT,
    state VARCHAR(100) DEFAULT 'Kerala',
    language VARCHAR(10) DEFAULT 'en',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE government_schemes ADD COLUMN IF NOT EXISTS scheme_key VARCHAR(120);
CREATE UNIQUE INDEX IF NOT EXISTS idx_schemes_scheme_key ON government_schemes(scheme_key) WHERE scheme_key IS NOT NULL;

CREATE TABLE IF NOT EXISTS officers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    district VARCHAR(100),
    phone VARCHAR(30),
    email VARCHAR(150),
    active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS escalations (
    id SERIAL PRIMARY KEY,
    query_id INTEGER REFERENCES farmer_queries(id) ON DELETE CASCADE,
    officer_id INTEGER REFERENCES officers(id),
    reason TEXT,
    status VARCHAR(30) DEFAULT 'pending',
    officer_response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_queries_farmer ON farmer_queries(farmer_id);
CREATE INDEX IF NOT EXISTS idx_queries_district ON farmer_queries(district);
