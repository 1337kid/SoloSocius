import User from "@/models/user";
import genFollowActivity from "@/utils/activitypub/activity/genFollowActivity";
import connectToDB from "@/utils/connectToDB";
import { NextResponse } from "next/server";
import { webfingerLookup, genSignature } from "@/utils/activitypub";
import axios from "axios";
import { genUserAgent } from "@/utils";

export const POST = async(req) => {
    const data = await req.json();
    try {
        await connectToDB();
        const recipient = data.recipient.split('@')
        const actor = await User.findOne({username: data.username}, {"fediverse":1,_id:0});
        const body = genFollowActivity(actor.fediverse.self, data.recipient, "Follow");
        console.log(body)
        // webfinger lookup for getting recipient's inbox
        const webfingerResult = await webfingerLookup(recipient[0],recipient[1]);
        let recipientInbox = '';
        webfingerResult.links.map((link) => {
            if (link.rel === "self") {
                recipientInbox = link.href
            }
        })
        // generate required request headers for server to server request
        const {currentDate, signatureHeader, digestHeader} = genSignature(
            actor.fediverse.privateKey,
            recipientInbox,
            body,
            `${actor.fediverse.self}#main-key`
        )
        // send send request to recipient server
        result = await axios.post(recipientInbox, body , {
            headers: {
                "Date": currentDate,
                "Signature": signatureHeader,
                "Digest": digestHeader,
                "User-Agent": genUserAgent(),
                "Content-Type": "application/activity+json"
            }
        })
        return NextResponse.json({message: `Sent follow activity to ${recipientInbox}`},{status:200})
    } catch (error) {
        console.log(error);
        return NextResponse.json({error: "Internal server error"},{status:500})
    }
}