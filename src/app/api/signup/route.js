import {NextResponse} from 'next/server'
import connectToDB from '@/utils/connectToDB'
import User from '@/models/user'
import bcrypt from 'bcrypt'
import { INSTANCE } from '@/constants'
import returnKeyPair from '@/utils/keyPair'
import { Followers,Following } from '@/models/contacts'

export const POST = async (req) => {
    const data = await req.json();
    try {
        await connectToDB()
        const keyPair = returnKeyPair();
        const user = new User({
            username: data.username,
            password: bcrypt.hashSync(data.password, 12),
            name: data.name,
            profileURL: `https://${INSTANCE}/u/${data.username}`,
            fediverse: {
                self: `https://${INSTANCE}/user/${data.username}`,
                inbox: `https://${INSTANCE}/user/${data.username}/inbox`,
                outbox: `https://${INSTANCE}/user/${data.username}/oubox`,
                publicKey: keyPair.publicKey,
                privateKey: keyPair.privateKey
            }
        })
        await user.save()
        const followersCollection = new Followers({followers: []})
        const followingCollection = new Following({following: []})
        await followersCollection.save()
        await followingCollection.save()
        return NextResponse.json(user,{status:200})
    } catch (error){
        console.log(error)
        return NextResponse.json({error:'Internal Server Error'},{status:500})
    }
}