import { NextResponse } from 'next/server';
import { headers } from "next/headers";
import { getActor, sendSignedRequest, verifySignature } from '@/utils/activities';
import genFollowAcceptActivity from '@/utils/activities/genFollowAcceptActivity';
import { addActorToContacts, getActorFromDB } from '@/utils/db/actor';

export const POST = async(req) => {
    const headerList = headers();
    const isAuthentic = await verifySignature(headerList, req.url);
    try {
        if (isAuthentic) {
            const object = await req.json();
            console.log(object)
            if (object?.type === "Follow") {
                const actor = await getActorFromDB("fediverse.self", object.object);
                const recipientObject = await getActor(object.actor);
                const body = genFollowAcceptActivity(actor.fediverse.self, object, "Accept")
                const requestStatus = await sendSignedRequest(
                    actor.fediverse.privateKey,
                    recipientObject.inbox,
                    body,
                    `${actor.fediverse.self}#main-key`,
                )
                console.log(requestStatus)
                if (requestStatus) {
                    await addActorToContacts(recipientObject, "followers", object.id);
                    return NextResponse.json({},{status:200})
                }
            }
            // else if (object.type === "Accept") {
                
            // }
            return NextResponse.json({error:'Invalid signature'}, {status:200})
        } else {
            return NextResponse.json({error:'Invalid signature'}, {status:403})
        }
    } catch (error) {
        console.log(error)
        return NextResponse.json({error:"Internal Server Error"}, {status:200});
    }
}