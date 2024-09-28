export const genActorEndpointBody = (user) => {
    return {
        "@context": ["https://www.w3.org/ns/activitystreams","https://w3id.org/security/v1"],
        "type": "Person",
        "id": `${user.fediverse.self}`,
        "following": `${user.profileURL}actor/following`,
        "followers": `${user.profileURL}actor/followers`,
        "inbox": `${user.fediverse.inbox}`,
        "outbox": `${user.fediverse.outbox}`,
        "preferredUsername": `${user.username}`,
        "name": `${user.name}`,
        "summary": `${user.summary}`,
        "url": `${user.profileURL}`,
        "publicKey": {
            id: `${user.fediverse.self}#main-key`,
            owner: `${user.fediverse.self}`,
            publicKeyPem: `${user.fediverse.publicKey}`
        },
        "icon": [
            `${user.profilePhoto}`
        ]
    }
}

export const genWebFinger = (user) => {
    return {
        subject: `${resource}`,
        aliases: [
            `${user.profileURL}`,
            `${user.fediverse.self}`
        ],
        links: [
            {
                rel: "http://webfinger.net/rel/profile-page",
                type: "text/html",
                href: `${user.profileURL}`
            },
            {
                rel: "self",
                type: "application/activity+json",
                href: `${user.fediverse.self}`
            },
            {
                rel: "http://webfinger.net/rel/avatar",
                type: "image/png",
                href: `${user.profilePhoto}`
            }
        ]
    }
}