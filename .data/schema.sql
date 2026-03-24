CREATE TABLE accounts (
	id text PRIMARY KEY NOT NULL,
	user_id text NOT NULL,
	account_id text NOT NULL,
	provider_id text NOT NULL,
	access_token text,
	refresh_token text,
	id_token text,
	expires_at integer,
	password text,
	created_at integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE outlets (
	id text PRIMARY KEY NOT NULL,
	name text NOT NULL,
	code text NOT NULL,
	address text NOT NULL,
	phone text,
	status text DEFAULT 'ACTIVE' NOT NULL,
	created_at integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE UNIQUE INDEX outlets_code_unique ON outlets (code);

CREATE TABLE sessions (
	id text PRIMARY KEY NOT NULL,
	expires_at integer NOT NULL,
	user_id text NOT NULL,
	token text NOT NULL,
	ip_address text,
	user_agent text,
	created_at integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE no action ON DELETE cascade
);

CREATE UNIQUE INDEX sessions_token_unique ON sessions (token);

CREATE TABLE transactions (
	id text PRIMARY KEY NOT NULL,
	voucher_id text NOT NULL,
	user_id text NOT NULL,
	outlet_id text NOT NULL,
	status text DEFAULT 'SUCCESS' NOT NULL,
	notes text,
	created_at integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (voucher_id) REFERENCES vouchers(id) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON UPDATE no action ON DELETE restrict
);

CREATE TABLE users (
	id text PRIMARY KEY NOT NULL,
	name text NOT NULL,
	email text NOT NULL,
	password text,
	phone text,
	role text DEFAULT 'OPERATOR' NOT NULL,
	outlet_id text,
	is_active integer DEFAULT true NOT NULL,
	email_verified integer DEFAULT false NOT NULL,
	last_login_at integer,
	failed_login_attempts integer DEFAULT 0 NOT NULL,
	locked_until integer,
	metadata text,
	created_at integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON UPDATE no action ON DELETE set null
);

CREATE UNIQUE INDEX users_email_unique ON users (email);

CREATE TABLE verifications (
	id text PRIMARY KEY NOT NULL,
	identifier text NOT NULL,
	value text NOT NULL,
	expires_at integer NOT NULL,
	created_at integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE vouchers (
	id text PRIMARY KEY NOT NULL,
	code text NOT NULL,
	type text NOT NULL,
	value text NOT NULL,
	status text DEFAULT 'ACTIVE' NOT NULL,
	expiry_date integer NOT NULL,
	outlet_id text NOT NULL,
	created_by text NOT NULL,
	qr_code_url text NOT NULL,
	metadata text,
	created_at integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (created_by) REFERENCES users(id) ON UPDATE no action ON DELETE restrict
);

CREATE UNIQUE INDEX vouchers_code_unique ON vouchers (code);

CREATE TABLE voucher_redemptions (
	id text PRIMARY KEY NOT NULL,
	voucher_id text NOT NULL,
	transaction_id text,
	outlet_id text NOT NULL,
	operator_id text NOT NULL,
	status text NOT NULL,
	failure_reason text,
	qr_code_data text,
	ip_address text,
	user_agent text,
	created_at integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (voucher_id) REFERENCES vouchers(id) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (operator_id) REFERENCES users(id) ON UPDATE no action ON DELETE restrict
);
