import {NextResponse} from 'next/server'
import connectToDB from '@/utils/connectToDB'
import User from '@/models/user'
import bcrypt from 'bcrypt'
import { INSTANCE } from '@/constants'
import returnKeyPair from '@/utils/keyPair'

export const POST = async (req) => {
    const data = await req.json();
    try {
        await connectToDB()
        const keyPair = returnKeyPair();
        const user = new User({
            username: data.username,
            password: bcrypt.hashSync(data.password, 12),
            name: data.name,
            profileURL: `${INSTANCE}/u/${data.username}`,
            fediverse: {
                self: `${INSTANCE}/user/${data.username}`,
                inbox: `${INSTANCE}/user/${data.username}/inbox`,
                outbox: `${INSTANCE}/user/${data.username}/oubox`,
                publicKey: keyPair.publicKey,
                privateKey: keyPair.privateKey
            }
        })
        await user.save()
        return NextResponse.json(user,{status:200})
    } catch (error){
        console.log(error)
        return NextResponse.json({error:'Internal Server Error'},{status:500})
    }
}