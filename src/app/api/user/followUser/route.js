import User from "@/models/user";
import genFollowActivity from "@/utils/activitypub/activity/genFollowActivity";
import connectToDB from "@/utils/connectToDB";
import { NextResponse } from "next/server";
import { getActor, genSignature } from "@/utils/activitypub";
import axios from "axios";
import { genUserAgent } from "@/utils";

export const POST = async(req) => {
    const data = await req.json();
    try {
        await connectToDB();
        const recipient = data.recipient.split('@')                                         // split recipient into user & domain
        const actor = await User.findOne({username: data.username}, {"fediverse":1,_id:0}); // get actor's (the user in this server) privateKey, inbox & main-key
        const recipientObject = await getActor(recipient[0],recipient[1]);                  // get recipient's inbox
        const body = genFollowActivity(actor.fediverse.self, recipientObject.id, "Follow");     // genrate request body for follow activity
        console.log(body)
        // generate required request headers for server to server request
        const {currentDate, signatureHeader, digestHeader} = genSignature(
            actor.fediverse.privateKey,
            recipientObject.inbox,
            body,
            `${actor.fediverse.self}#main-key`
        );

        // send send request to recipient server
        const result = await axios.post(recipientObject.inbox, body , {
            headers: {
                "Date": currentDate,
                "Signature": signatureHeader,
                "Digest": digestHeader,
                "User-Agent": genUserAgent(),
                "Content-Type": "application/activity+json"
            }
        })
        return NextResponse.json({message: `Sent follow activity to ${recipientObject.inbox}`},{status:200})
    } catch (error) {
        console.log(error);
        return NextResponse.json({error: "Internal server error"},{status:500})
    }
}