-- Tables initialization

DROP TABLE IF EXISTS user_portfolio CASCADE;
DROP TABLE IF EXISTS round_up_pool CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS investment_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    bank_balance NUMERIC(12, 2) NOT NULL DEFAULT 5000.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Investment Profiles Table
CREATE TABLE investment_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    risk_type VARCHAR(20) NOT NULL CHECK (risk_type IN ('CONSERVATIVE', 'MODERATE', 'AGGRESSIVE')) DEFAULT 'MODERATE',
    trigger_limit NUMERIC(10, 2) NOT NULL DEFAULT 50.00,
    exact_round_up NUMERIC(10, 2) NOT NULL DEFAULT 2.00,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions Table
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    merchant VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Round Up Pool Table (temporary record of computed round-ups)
CREATE TABLE round_up_pool (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    transaction_id INTEGER REFERENCES transactions(id) ON DELETE CASCADE,
    round_up_amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(30) NOT NULL CHECK (status IN ('PENDING', 'INVESTED', 'FAILED_INSUFFICIENT')) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Portfolio Table
CREATE TABLE user_portfolio (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    asset_name VARCHAR(50) NOT NULL,
    asset_type VARCHAR(20) NOT NULL,
    quantity NUMERIC(16, 6) NOT NULL DEFAULT 0.000000,
    total_invested NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    average_cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, asset_name)
);

-- SEED DATA
-- 1. Insert User
INSERT INTO users (name, email, bank_balance) 
VALUES ('Ahmet Yılmaz', 'ahmet@finup.com', 2500.00);

-- 2. Insert Investment Profile (Aggressive for demo)
INSERT INTO investment_profiles (user_id, risk_type, trigger_limit, exact_round_up) 
VALUES (1, 'AGGRESSIVE', 50.00, 2.00);

-- 3. Insert some initial mock portfolio items
-- BTC Asset (Crypto)
INSERT INTO user_portfolio (user_id, asset_name, asset_type, quantity, total_invested, average_cost)
VALUES (1, 'BTC', 'CRYPTO', 0.000350, 450.00, 1285714.28);

-- ETH Asset (Crypto)
INSERT INTO user_portfolio (user_id, asset_name, asset_type, quantity, total_invested, average_cost)
VALUES (1, 'ETH', 'CRYPTO', 0.002800, 300.00, 107142.85);

-- 4. Insert some initial spending transactions
INSERT INTO transactions (user_id, amount, merchant, created_at)
VALUES (1, 64.30, 'Starbucks Coffee', CURRENT_TIMESTAMP - INTERVAL '2 hours');

INSERT INTO round_up_pool (user_id, transaction_id, round_up_amount, status, created_at)
VALUES (1, 1, 5.70, 'PENDING', CURRENT_TIMESTAMP - INTERVAL '2 hours');

INSERT INTO transactions (user_id, amount, merchant, created_at)
VALUES (1, 128.50, 'Burger King', CURRENT_TIMESTAMP - INTERVAL '1 hour');

INSERT INTO round_up_pool (user_id, transaction_id, round_up_amount, status, created_at)
VALUES (1, 2, 1.50, 'PENDING', CURRENT_TIMESTAMP - INTERVAL '1 hour');
