import {NextResponse} from 'next/server'
import connectToDB from '@/utils/connectToDB'
import User from '@/models/user'

export const GET = async (req,{params}) => {
    try {
        const username = params.username
        await connectToDB()
        let actor = {}
        await User.findOne({username:username}).then(user => {
            actor = {
                "@context": ["https://www.w3.org/ns/activitystreams",],
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
            }})
        return NextResponse.json(actor, {status:201})
    } catch (error) {
        console.log(error)
        return NextResponse.json({error:'Internal Server Error'},{status:500})
    }
}