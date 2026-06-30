# Solosocius

> A lightweight, single-user ActivityPub server built for self-hosting.

Solosocius is an experimental ActivityPub implementation focused on simplicity and learning. It allows a single user to publish posts, interact with the Fediverse, and host their own social presence without the complexity of a multi-user platform.

<img src="docs/img1.png" alt="img" />

---

# Deployment

## Requirements

- Docker
- Docker Compose

---

## Clone

```bash
git clone https://github.com/1337kid/solosocius.git

cd solosocius
```

---

## Configure Environment

Copy `.env.default` into `.env` and fill it.

## Configure Caddy

Edit

```
Caddyfile
```

Replace `localhost` with `social.example.com`

---

## Run the application

```bash
docker compose up -d
```

---

# License

MIT