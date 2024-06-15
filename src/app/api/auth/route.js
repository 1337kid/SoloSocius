import {NextResponse} from 'next/server'
import { connectToDB } from '@/db';
import bcrypt from 'bcrypt'
import { INSTANCE } from '@/constants'
import returnKeyPair from '@/utils/keyPair'
import { createUser, getUserActorFromDB } from '@/db/actor';

export const POST = async (req) => {
    const data = await req.json();
    try {
        await connectToDB()
        const user  = await getUserActorFromDB("username password");
        if (user && user.username === data.username) {
            isVerified = bcrypt.compareSync(data.password, user.password)
            if (isVerified) {
                return NextResponse.json({}, {status:200})
            }
        }
        const keyPair = returnKeyPair();
        await createUser({
            username: data.username,
            password: bcrypt.hashSync(data.password, 12),
            name: data.name,
            profileURL: `https://${INSTANCE}/`,
            fediverse: {
                self: `https://${INSTANCE}/actor`,
                inbox: `https://${INSTANCE}/inbox`,
                outbox: `https://${INSTANCE}/oubox`,
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