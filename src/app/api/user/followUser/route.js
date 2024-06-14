import genFollowAcceptActivity from "@/utils/activities/genFollowAcceptActivity";
import { NextResponse } from "next/server";
import { getExternalActor, sendSignedRequest } from "@/utils/activities";
import { getUserActorFromDB } from "@/db/actor";
import { connectToDB } from "@/db";

export const POST = async(req) => {
    await connectToDB();
    const data = await req.json();
    try {
        const actor = await getUserActorFromDB();
        const recipientObject = await getExternalActor(data.recipient);
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