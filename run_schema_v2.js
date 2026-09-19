const { Client } = require('pg');
const sql = `
-- Drop existing tables to start fresh (careful with dependencies)
DROP TABLE IF EXISTS posts, memberships, plans, business_members, businesses, locations, categories CASCADE;
DROP TABLE IF EXISTS business_revisions, business_categories, business_services, business_media, business_links, business_hours, plan_entitlements, payments, business_events, business_claims, ai_jobs, ai_sources, import_jobs, post_categories CASCADE;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Core Lookups
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- province, district, ward
    parent_id UUID REFERENCES locations(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Core Business Entity
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Identity
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    short_description TEXT,
    description TEXT,
    -- Location Base
    location_id UUID REFERENCES locations(id),
    address TEXT,
    map_coordinates JSONB, -- { lat, lng }
    -- Contact Base
    phone TEXT,
    zalo TEXT,
    email TEXT,
    website TEXT,
    socials JSONB DEFAULT '{}'::jsonb, -- { facebook, tiktok, youtube }
    -- SEO
    seo_title TEXT,
    seo_description TEXT,
    canonical_url TEXT,
    structured_data JSONB DEFAULT '{}'::jsonb,
    -- System
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'suspended', 'expired', 'archived')),
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Business Extensions (Classification & Content)
CREATE TABLE business_categories (
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    PRIMARY KEY (business_id, category_id)
);

CREATE TABLE business_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price_min NUMERIC,
    price_max NUMERIC,
    currency TEXT DEFAULT 'VND',
    image_url TEXT,
    sort_order INT DEFAULT 0
);

CREATE TABLE business_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('logo', 'cover', 'gallery', 'video')),
    url TEXT NOT NULL,
    sort_order INT DEFAULT 0
);

CREATE TABLE business_hours (
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    open_time TIME,
    close_time TIME,
    is_closed BOOLEAN DEFAULT false,
    PRIMARY KEY (business_id, day_of_week)
);

-- 4. Revisions & Approvals (Draft -> Publish)
CREATE TABLE business_revisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    submitted_by UUID, -- user_id
    changes JSONB NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID, -- admin user_id
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Ownership & Claims
CREATE TABLE business_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role TEXT DEFAULT 'editor' CHECK (role IN ('owner', 'editor', 'staff')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(business_id, user_id)
);

CREATE TABLE business_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    contact_email TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    proof_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Analytics Events
CREATE TABLE business_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('business_view', 'phone_click', 'zalo_click', 'map_click', 'website_click', 'booking_click', 'social_click')),
    source TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Monetization
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    duration_days INT NOT NULL,
    entitlements JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES plans(id),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id),
    membership_id UUID REFERENCES memberships(id),
    amount NUMERIC NOT NULL,
    provider TEXT, -- VietQR, Stripe, Manual
    transaction_id TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. AI Ingestion Engine
CREATE TABLE ai_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_url TEXT NOT NULL,
    status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
    result_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    field_name TEXT NOT NULL,
    source_url TEXT NOT NULL,
    confidence TEXT DEFAULT 'HIGH' CHECK (confidence IN ('HIGH', 'MEDIUM', 'LOW')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CMS / Blog
CREATE TABLE post_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL
);

CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    category_id UUID REFERENCES post_categories(id),
    meta_title TEXT,
    meta_description TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
`;

async function run() {
    const client = new Client({ connectionString: 'postgresql://postgres.ejlltaigohemjagfzxxh:MYW_.Guf3YkQ4qi@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres' });
    try {
        await client.connect();
        await client.query(sql);
        console.log('Schema V2 successfully applied!');
    } catch(e) {
        console.error(e);
    } finally {
        client.end();
    }
}
run();
