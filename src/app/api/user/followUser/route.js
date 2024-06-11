import User from "@/models/user";
import genFollowAcceptActivity from "@/utils/activitypub/activity/genFollowAcceptActivity";
import connectToDB from "@/utils/connectToDB";
import { NextResponse } from "next/server";
import { getActorFromWebfinger, sendSignedRequest } from "@/utils/activitypub";

export const POST = async(req) => {
    const data = await req.json();
    try {
        await connectToDB();
        // split recipient into user & domain
        const recipient = data.recipient.split('@')
        // get actor's (the user in this server) privateKey, inbox & main-key
        const actor = await User.findOne({username: data.username}, {"fediverse":1,_id:0});
        // get recipient's inbox
        const recipientObject = await getActorFromWebfinger(recipient[0],recipient[1].split(':')[0]);
         // genrate request body for follow activity
        const body = genFollowAcceptActivity(actor.fediverse.self, recipientObject.id, "Follow");
        // send a signed request to the recipient's inbox
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