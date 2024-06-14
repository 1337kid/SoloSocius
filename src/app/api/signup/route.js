import {NextResponse} from 'next/server'
import { connectToDB } from '@/db';
import bcrypt from 'bcrypt'
import { INSTANCE } from '@/constants'
import returnKeyPair from '@/utils/keyPair'

export const POST = async (req) => {
    const data = await req.json();
    try {
        await connectToDB()
        const keyPair = returnKeyPair();
        await createUser({
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
        return NextResponse.json({message: 'Account created'},{status:200})
    } catch (error){
        console.log(error)
        return NextResponse.json({error:'Internal Server Error'},{status:500})
    }
}