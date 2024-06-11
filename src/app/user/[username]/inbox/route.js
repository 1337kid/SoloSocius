import { NextResponse } from 'next/server'
import { headers } from "next/headers";
import connectToDB from '@/utils/connectToDB'
import User from '@/models/user'
import { getActor, sendSignedRequest, verifySignature } from '@/utils/activitypub'
import genFollowAcceptActivity from '@/utils/activitypub/activity/genFollowAcceptActivity';

export const POST = async(req) => {
    const headerList = headers();
    // verify signature
    const isAuthentic = await verifySignature(headerList, req.url);
    try {
        if (isAuthentic) {
            await connectToDB()
            const object = await req.json();
            if (object?.type === "Accept") {
                console.log(object)
            }
            // if a "Follow" activity, send an "Accept" activity back to the origin
            else if (object?.type === "Follow") {
                const actor = await User.findOne({"fediverse.self": object.object}, {"fediverse":1,_id:0});
                const recipientObject = await getActor(object.actor);
                // generate "Accept" activity
                const body = genFollowAcceptActivity(actor.fediverse.self, object, "Accept")
                // send signed request to recipient's inbox
                const requestStatus = await sendSignedRequest(
                    actor.fediverse.privateKey,
                    recipientObject.inbox,
                    body,
                    `${actor.fediverse.self}#main-key`,
                )
                if (requestStatus) return NextResponse.json({},{status:200})
                else return NextResponse.json({error:"error"}, {status:500})
            }
            else {
                return NextResponse.json(object,{status:200})
            }
        } else {
            return NextResponse.json({error:'Malformed signature'}, {status:200})
        }
    } catch (error) {
        console.log(error)
        return NextResponse.json({error:"Internal Server Error"}, {status:200});
    }
    return new NextResponse("lmap")
}