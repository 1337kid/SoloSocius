# Building SoloSocius Manually

!!! info "Info"
    This guide explains how to install and run SoloSocius directly on a Linux server without Docker.

The instructions below assume an Ubuntu 24.04 LTS server with `sudo` access.

## Prerequisites

Before installing SoloSocius, make sure your server has:

* Ubuntu 24.04 LTS
* A domain name pointing to the server
* `sudo` access
* Ports `80` and `443` accessible from the Internet

SoloSocius requires the following services:

| Service    | Purpose                   | Default Port   |
| ---------- | ------------------------- | -------------- |
| Node.js    | Runs SoloSocius           | `3000`, `4000` |
| PostgreSQL | Application database      | `5432`         |
| Redis      | Cache and background data | `6379`         |
| Caddy      | Reverse proxy and HTTPS   | `80`, `443`    |

## Update the System

Update the system package lists and install the basic dependencies.

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y curl git ca-certificates
```

## Install Node.js

SoloSocius requires Node.js 24.

Node.js 24 is currently an LTS release. The official Node.js documentation provides `nvm` as one way to install and manage Node.js versions.

Install `nvm`:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.7/install.sh | bash
```

Reload your shell:

```bash
source ~/.bashrc
```

Install Node.js 24:

```bash
nvm install 24
```

Set Node.js 24 as the default version:

```bash
nvm alias default 24
nvm use 24
```

Verify the installation:

```bash
node --version
npm --version
```

You should see Node.js `v24.x.x`.

## Install pnpm

SoloSocius is a pnpm workspace, so pnpm is required to install its dependencies.

Enable Corepack:

```bash
corepack enable
```

Then prepare pnpm:

```bash
corepack prepare pnpm@latest --activate
```

Verify the installation:

```bash
pnpm --version
```

## Install PostgreSQL

SoloSocius uses PostgreSQL 17.

The PostgreSQL project provides an official APT repository containing supported PostgreSQL versions.

Install the PostgreSQL repository helper:

```bash
sudo apt install -y postgresql-common ca-certificates
```

Configure the PostgreSQL APT repository:

```bash
sudo /usr/share/postgresql-common/pgdg/apt.postgresql.org.sh
```

Update the package lists:

```bash
sudo apt update
```

Install PostgreSQL 17:

```bash
sudo apt install -y postgresql-17
```

Check that PostgreSQL is running:

```bash
sudo systemctl status postgresql
```

If it is not running, start it:

```bash
sudo systemctl start postgresql
```

Enable PostgreSQL to start automatically after reboot:

```bash
sudo systemctl enable postgresql
```

### Create the SoloSocius Database

Switch to the PostgreSQL administrator account:

```bash
sudo -u postgres psql
```

Create a database user:

```sql
CREATE USER solosocius WITH PASSWORD 'CHANGE_THIS_PASSWORD';
```

Create the application database:

```sql
CREATE DATABASE solosocius OWNER solosocius;
```

Exit PostgreSQL:

```sql
\q
```

!!! warning "Use a Strong Password"
    Replace `CHANGE_THIS_PASSWORD` with a strong, randomly generated password.

The resulting database connection string will look similar to:

```text
postgresql://solosocius:CHANGE_THIS_PASSWORD@localhost:5432/solosocius
```

## Install Redis

SoloSocius uses Redis for its Redis-backed functionality.

Redis provides an official APT repository for Ubuntu and Debian systems.

Install the required packages:

```bash
sudo apt install -y lsb-release curl gpg
```

Add the Redis repository signing key:

```bash
curl -fsSL https://packages.redis.io/gpg \
  | sudo gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg
```

Set the correct permissions:

```bash
sudo chmod 644 /usr/share/keyrings/redis-archive-keyring.gpg
```

Add the Redis repository:

```bash
echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" \
  | sudo tee /etc/apt/sources.list.d/redis.list
```

Update the package lists:

```bash
sudo apt update
```

Install Redis:

```bash
sudo apt install -y redis
```

Start Redis:

```bash
sudo systemctl start redis-server
```

Enable Redis at boot:

```bash
sudo systemctl enable redis-server
```

Check the service:

```bash
sudo systemctl status redis-server
```

Test Redis:

```bash
redis-cli ping
```

A successful installation should return:

```text
PONG
```

## Clone the Repository

Clone the SoloSocius repository:

```bash
git clone https://github.com/1337kid/SoloSocius.git
cd SoloSocius
```

## Configuration

Create the required configuration files from the provided examples:

```bash
cp .env.example .env
cp Caddyfile.example Caddyfile
```

Edit the environment configuration:

```bash
nano .env
```

At minimum, configure the database, Redis, domain, storage, and JWT settings.

For a local PostgreSQL and Redis installation, the relevant values should point to `localhost`.

For example:

```env
DATABASE_URL=postgresql://solosocius:CHANGE_THIS_PASSWORD@localhost:5432/solosocius

REDIS_URL=redis://127.0.0.1:6379

DOMAIN=example.com

NODE_ENV=production
```

Configure the remaining variables according to your deployment.

## Install Dependencies

Install the project dependencies using the repository lockfile:

```bash
pnpm install --frozen-lockfile
```

This is equivalent to the dependency installation performed during the Docker build.

## Build SoloSocius

SoloSocius contains two applications:

* `backend`
* `frontend`

The frontend requires `NEXT_PUBLIC_API_URL` during the build.

Export the API URL before building:

```bash
export NEXT_PUBLIC_API_URL="https://example.com/api"
```

Then build both applications:

```bash
pnpm --filter backend --filter frontend build
```

!!! note
    `NEXT_PUBLIC_API_URL` is a build-time variable for the Next.js frontend. If you change this value later, rebuild the frontend.

## Database Migration

Before starting SoloSocius for the first time, run the database migration required by the project.

```bash
pnpm --filter backend migrate
```

## Test the Application

Before creating system services, verify that the backend and frontend can start correctly.

Load the environment variables:

```bash
set -a
source .env
set +a
```

Start the backend:

```bash
pnpm --filter backend start
```

In another terminal, start the frontend:

```bash
pnpm --filter frontend start
```

The backend should be available on:

```text
http://127.0.0.1:4000
```

The frontend should be available on:

```text
http://127.0.0.1:3000
```

## Run SoloSocius using systemd

For a production installation, SoloSocius should not be started manually from an SSH session.

Instead, use `systemd` so the services automatically start on boot and restart when necessary.

Create a dedicated system user:

```bash
sudo useradd --system --create-home --shell /bin/bash solosocius
```

Move the repository to a suitable production directory:

```bash
sudo mkdir -p /opt/solosocius
sudo cp -a . /opt/solosocius/
```

Set the ownership:

```bash
sudo chown -R solosocius:solosocius /opt/solosocius
```

!!! note
    If you cloned the repository directly into `/opt/solosocius`, you can skip the `cp` command.

### Backend Service

Create the backend systemd service:

```bash
sudo nano /etc/systemd/system/solosocius-backend.service
```

Add:

```ini
[Unit]
Description=SoloSocius Backend
After=network.target postgresql.service redis-server.service
Wants=postgresql.service redis-server.service

[Service]
Type=simple
User=solosocius
Group=solosocius
WorkingDirectory=/opt/solosocius

EnvironmentFile=/opt/solosocius/.env

ExecStart=/usr/bin/env pnpm --filter backend start

Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

!!! warning
    If Node.js and pnpm were installed using `nvm`, `/usr/bin/env pnpm` may not work from systemd because systemd does not load your interactive shell's `nvm` environment.

    `In that case, use the absolute path to the Node.js/pnpm installation or install Node.js system-wide.`

### Frontend Service

Create the frontend service:

```bash
sudo nano /etc/systemd/system/solosocius-frontend.service
```

Add:

```ini
[Unit]
Description=SoloSocius Frontend
After=network.target solosocius-backend.service
Wants=solosocius-backend.service

[Service]
Type=simple
User=solosocius
Group=solosocius
WorkingDirectory=/opt/solosocius

EnvironmentFile=/opt/solosocius/.env

ExecStart=/usr/bin/env pnpm --filter frontend start

Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Reload systemd:

```bash
sudo systemctl daemon-reload
```

Enable both services:

```bash
sudo systemctl enable solosocius-backend
sudo systemctl enable solosocius-frontend
```

Start them:

```bash
sudo systemctl start solosocius-backend
sudo systemctl start solosocius-frontend
```

Check their status:

```bash
sudo systemctl status solosocius-backend
sudo systemctl status solosocius-frontend
```

View application logs:

```bash
sudo journalctl -u solosocius-backend -f
```

or:

```bash
sudo journalctl -u solosocius-frontend -f
```

## Install Caddy

Caddy is used as the public-facing reverse proxy for SoloSocius.

It will:

* Listen on ports `80` and `443`
* Automatically obtain TLS certificates
* Forward requests to the frontend and backend
* Keep the Node.js services private

Caddy provides an official package repository for Debian and Ubuntu.

Install the required packages:

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
```

Add the Caddy signing key:

```bash
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
  | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
```

Add the Caddy repository:

```bash
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
  | sudo tee /etc/apt/sources.list.d/caddy-stable.list
```

Set the required permissions:

```bash
sudo chmod o+r /usr/share/keyrings/caddy-stable-archive-keyring.gpg
sudo chmod o+r /etc/apt/sources.list.d/caddy-stable.list
```

Update the package lists:

```bash
sudo apt update
```

Install Caddy:

```bash
sudo apt install -y caddy
```

The official package installs Caddy as a systemd service.

## Configure Caddy

Copy the example Caddy configuration:

```bash
sudo cp Caddyfile.example /etc/caddy/Caddyfile
```

Edit the configuration:

```bash
sudo nano /etc/caddy/Caddyfile
```

Replace `example.com` with your actual domain.

!!! info
    Caddy automatically manages HTTPS certificates when the domain points to the server and ports `80` and `443` are reachable from the Internet.

Validate the configuration:

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
```

If the configuration is valid, restart Caddy:

```bash
sudo systemctl restart caddy
```

Enable Caddy at boot:

```bash
sudo systemctl enable caddy
```

Check its status:

```bash
sudo systemctl status caddy
```

View Caddy logs:

```bash
sudo journalctl -u caddy -f
```

## Firewall

If UFW is enabled, allow SSH and the HTTP/HTTPS ports:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

Enable UFW:

```bash
sudo ufw enable
```

Check the firewall status:

```bash
sudo ufw status
```

!!! warning
    PostgreSQL (`5432`) and Redis (`6379`) should not be exposed publicly. They should remain accessible only from the local machine unless you have a specific reason to expose them.

## Startup

Once PostgreSQL, Redis, SoloSocius, and Caddy are configured, the complete stack can be started with:

```bash
sudo systemctl start postgresql
sudo systemctl start redis-server
sudo systemctl start solosocius-backend
sudo systemctl start solosocius-frontend
sudo systemctl start caddy
```

Check all services:

```bash
sudo systemctl status postgresql
sudo systemctl status redis-server
sudo systemctl status solosocius-backend
sudo systemctl status solosocius-frontend
sudo systemctl status caddy
```

SoloSocius should now be accessible through your configured domain.

## Updating SoloSocius

First, stop the application services:

```bash
sudo systemctl stop solosocius-frontend
sudo systemctl stop solosocius-backend
```

Pull the latest changes:

```bash
cd /opt/solosocius
sudo -u solosocius git pull
```

Install any new dependencies:

```bash
sudo -u solosocius pnpm install --frozen-lockfile
```

Rebuild the applications:

```bash
sudo -u solosocius pnpm --filter backend --filter frontend build
```

Run any required database migrations:

```bash
sudo -u solosocius pnpm --filter backend <migration-command>
```

Start SoloSocius again:

```bash
sudo systemctl start solosocius-backend
sudo systemctl start solosocius-frontend
```

Restart Caddy if its configuration was changed:

```bash
sudo systemctl restart caddy
```

Check the application logs:

```bash
sudo journalctl -u solosocius-backend -f
```

## Troubleshooting

### Check Backend Logs

```bash
sudo journalctl -u solosocius-backend -n 100 --no-pager
```

### Check Frontend Logs

```bash
sudo journalctl -u solosocius-frontend -n 100 --no-pager
```

### Check Caddy Logs

```bash
sudo journalctl -u caddy -n 100 --no-pager
```

### Check PostgreSQL

```bash
sudo systemctl status postgresql
```

Test the database:

```bash
sudo -u postgres psql -c "SELECT version();"
```

### Check Redis

```bash
sudo systemctl status redis-server
```

Test Redis:

```bash
redis-cli ping
```

Expected output:

```text
PONG
```

### Check Listening Ports

```bash
sudo ss -lntp
```

You should see services listening on the expected ports, including:

```text
3000
4000
5432
6379
80
443
```

## Enjoy SoloSocius

Your SoloSocius instance is now running without Docker, with PostgreSQL and Redis managed by systemd and Caddy handling reverse proxying and HTTPS.

Enjoy your single user Fediverse instance.... :3
