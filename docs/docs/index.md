# SoloSocius

### Your own place in the Fediverse.

**SoloSocius** is a lightweight, self-hosted, single-user [ActivityPub](https://www.w3.org/TR/activitypub/) server designed for people who want to own their social presence without running a full multi-user social network.

It lets you publish posts, follow people across the Fediverse, interact with remote posts, and maintain your own federated identity — all from infrastructure you control.

---

## What is SoloSocius?

Social platforms traditionally require you to create an account on someone else's infrastructure. Your profile, posts, media, and social graph live on a platform operated by someone else.

SoloSocius takes a different approach.

Instead of joining a large social platform, you can run **your own personal ActivityPub server**. Your server becomes your home on the Fediverse while still allowing you to communicate with users on other compatible platforms such as Mastodon, Misskey, and other ActivityPub implementations.

Think of it as:

> **A personal social server rather than a social network.**

SoloSocius focuses on doing one thing well: giving **one person their own federated social presence** without the operational complexity of a traditional multi-user platform.

---

## Why SoloSocius?

Running a full social platform for yourself can be unnecessary.

Projects designed for large communities often come with features for:

* Multiple users and accounts
* User administration
* Moderation systems
* Complex permissions
* Community management
* Large-scale federation
* Extensive configuration

But what if you just want **your own corner of the Fediverse**?

SoloSocius strips the problem down to its essentials.

### Own your identity

Your ActivityPub identity belongs to your server rather than being tied to a centralized social platform.

### Own your infrastructure

Host SoloSocius on infrastructure you control — whether that's a VPS, home server, or another environment capable of running Docker.

### Stay connected

Self-hosting doesn't mean becoming isolated.

SoloSocius communicates with the wider Fediverse through ActivityPub, allowing you to interact with users on compatible platforms.

### Keep it simple

SoloSocius is intentionally designed around a **single-user model**.

Less administration.
Less complexity.
More control.

---

## Who Should Use SoloSocius?

SoloSocius is primarily intended for people who want to experiment with or operate their own personal presence on the Fediverse.

### Developers

If you're interested in:

* ActivityPub
* Federation
* Distributed systems
* Decentralized social networks
* Backend development
* Self-hosting

SoloSocius provides a practical project to explore how these technologies work together.

### Self-hosting enthusiasts

If you already run your own services and want to add a personal social platform to your infrastructure, SoloSocius is designed with self-hosting in mind.

### Fediverse users

If you want your own independently hosted identity while still interacting with Mastodon, Misskey, and other ActivityPub servers, SoloSocius can provide that personal node.

### Researchers & Experimenters

SoloSocius can also serve as a small, understandable environment for experimenting with federation protocols and decentralized social networking concepts without deploying a large production platform.

---

## What Can SoloSocius Do?

SoloSocius currently supports the core functionality required for a personal federated social presence.

### Publishing

Create and publish public posts from your own server.

Posts can also include **image attachments**.

### Federation

Communicate with other ActivityPub servers across the Fediverse.

This allows your account to interact with users outside your own SoloSocius instance.

### Follow Remote Users

Follow users hosted on other ActivityPub-compatible platforms.

For example, you can follow users on:

* Mastodon
* Misskey
* Other ActivityPub implementations

### Receive Remote Posts

Posts from accounts you follow can appear in your timeline, allowing your SoloSocius instance to participate in the wider Fediverse.

### Interact With Remote Posts

SoloSocius supports interactions such as:

* Likes
* Reposts
* Replies
* Following
* Unfollowing

### Media Attachments

Publish posts and replies containing image attachments.

### Self-Hosting

Deploy the entire application using Docker and Docker Compose.

---

## License

SoloSocius is open-source software released under the **MIT License**.

See the [repository](https://github.com/1337kid/SoloSocius) for the source code and project development.