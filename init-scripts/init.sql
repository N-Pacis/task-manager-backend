-- init.sql

-- Update postgresql.conf to listen on all addresses
ALTER SYSTEM SET listen_addresses = '*';

-- Update pg_hba.conf to allow connections from the Docker subnet
-- Adjust the CIDR notation based on your Docker subnet
-- For example, if your Docker subnet is 172.24.0.0/16, use 172.24.0.0/16
INSERT INTO pg_hba.conf (type, database, "user", address, method)
VALUES ('host', 'all', 'all', '172.24.0.0/16', 'md5');
