import { NextResponse } from 'next/server';
import { headers } from "next/headers";
import { getExternalActor, sendSignedRequest, verifySignature } from '@/utils/activities';
import genFollowAcceptActivity from '@/utils/activities/genFollowAcceptActivity';
import { 
    addExternalUserActorToFollowers,
    addExternalUserActorToFollowing,
    getUserActorFromDB,
    getExternalUserActorFromDB,
    addExternalUserActorToDB,
    removeExternalUserActorFromFollowers
} from '@/db/actor';
import { connectToDB } from '@/db';

const getMongoIdOfExternalActor = async (actorObject) => {
    let mongoID = await getExternalUserActorFromDB(actorObject.id);
    if(!mongoID) mongoID = await addExternalUserActorToDB(actorObject);
    return mongoID;
}

const handleFollowAction = async (reqBody) => {
    const actor = await getUserActorFromDB();
    const externalActor = await getExternalActor(reqBody.actor);
    const body = genFollowAcceptActivity(actor.fediverse.self, reqBody, "Accept")
    const requestStatus = await sendSignedRequest(
        actor.fediverse.privateKey,
        externalActor.inbox,
        body,
        `${actor.fediverse.self}#main-key`,
    )
    if (requestStatus) {
        let externalActorMongoId = await getMongoIdOfExternalActor(externalActor)
        await addExternalUserActorToFollowers(externalActor.id, externalActorMongoId, reqBody.id);
        return NextResponse.json({},{status:200});
    }
    return NextResponse.json({}, {status:403});
}

const handleUndoActivity = async(reqBody) => {
    const activityIdToUndo = reqBody.object.id;
    const activityType = reqBody.object.type;
    if (activityType === "Follow") {
        await removeExternalUserActorFromFollowers("activityId", activityIdToUndo);
        return NextResponse.json({},{status:200});
    }
}

const handleAcceptActivity = async(reqBody) => {
    const externalActor = await getExternalActor(reqBody.actor);
    let externalActorMongoId = await getMongoIdOfExternalActor(externalActor);
    await addExternalUserActorToFollowing(externalActor.id, externalActorMongoId, reqBody.object.id || reqBody.object);
    return NextResponse.json({}, {status:200});
}

export const POST = async(req) => {
    await connectToDB();
    const headerList = headers();
    try {
        const isAuthentic = await verifySignature(headerList, req.url);
        if (isAuthentic) {
            const reqBody = await req.json();
            console.log(reqBody)
            if (reqBody.type === "Follow") await handleFollowAction(reqBody);
            else if (reqBody.type === "Undo") await handleUndoActivity(reqBody);
            else if (reqBody.type === "Accept") await handleAcceptActivity(reqBody);
            return NextResponse.json({error:'test'}, {status:200})
        } else {
            return NextResponse.json({error:'Invalid signature'}, {status:403})
        }
    } catch (error) {
        console.log(error)
        return NextResponse.json({error:"Internal Server Error"}, {status:500});
    }
}