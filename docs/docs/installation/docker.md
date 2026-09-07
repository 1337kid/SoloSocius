# Building SoloSocius using Docker Compose

!!! info "Info"
    Make sure you have Docker Engine and Docker Compose installed before continuing

## Clone the Repository

```bash
git clone https://github.com/1337kid/SoloSocius.git
cd SoloSocius
```

## Configuration

Before building SoloSocius, create the required configuration files from the provided examples.

Below command copies `.env.example` and `Caddyfile.example` to their actual config file names.

```bash
cp .env.example .env
cp Caddyfile.example Caddyfile
```

Then update `.env` with your environment-specific values and the `Caddyfile` with your domain name.

## Build Docker Image

Run the below command to build SoloSocius Docker image.

```bash
sudo docker compose build
```

## Startup

You can launch SoloSocius using the below command.

```bash
sudo docker compose up -d
```

Enjoy your single user Fediverse instance.... :3