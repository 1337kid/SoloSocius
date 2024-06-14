export const genActorEndpointBody = (user) => {
    return {
        "@context": ["https://www.w3.org/ns/activitystreams","https://w3id.org/security/v1"],
        "type": "Person",
        "id": `${user.fediverse.self}`,
        "following": `${user.fediverse.self}/following`,
        "followers": `${user.fediverse.self}/followers`,
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