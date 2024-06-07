import { NextResponse } from 'next/server'
import { headers } from "next/headers";
import connectToDB from '@/utils/connectToDB'
import User from '@/models/user'
import { genSignature, verifySignature } from '@/utils/activitypub'

export const POST = async(req,res) => {
    const headerList = headers();
    const requestUrl = req.url;
    console.log(await verifySignature(headerList, requestUrl))
    // await connectToDB()
    // const user = await User.findOne({username: '1337kid'});
    // console.log(genSignature(user.fediverse.privateKey,"https://solosocius.tld/user/1337kid/inbox" ,{hello:"noice"}, user.fediverse.self))
    return new NextResponse("lmap")
}