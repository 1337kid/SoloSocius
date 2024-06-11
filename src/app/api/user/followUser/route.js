import genFollowAcceptActivity from "@/utils/activities/genFollowAcceptActivity";
import { NextResponse } from "next/server";
import { getActor, sendSignedRequest } from "@/utils/activities";
import { getActorFromDB } from "@/utils/db/actor";

export const POST = async(req) => {
    const data = await req.json();
    try {
        const actor = await getActorFromDB("username",data.username);
        const recipientObject = await getActor(data.recipient);
        const body = genFollowAcceptActivity(actor.fediverse.self, recipientObject.id, "Follow");
        const requestStatus = await sendSignedRequest(
            actor.fediverse.privateKey,
            recipientObject.inbox,
            body,
            `${actor.fediverse.self}#main-key`,
        )
        if (requestStatus) return NextResponse.json({message: `Sent follow activity to ${recipientObject.inbox}`},{status:200});
        else return NextResponse.json({error: "Follow request failed"}, {status: 500});
    } catch (error) {
        console.log(error);
        return NextResponse.json({error: "Internal server error"},{status:500})
    }
}