import { connectToDB } from "@/db"
import { getUserActorFromDB, getUserActorConnectionsCount } from "@/db/actor"
import { NextResponse } from "next/server"

export const GET = async () => {
    try {
        await connectToDB()
        const userActor = await getUserActorFromDB("-password -fediverse -_id -__v");
        if (!userActor) return NextResponse.json({eroor: 'account unavailable'}, {status:404})
        const connections = await getUserActorConnectionsCount();
        return NextResponse.json({
            userActor, connections
        }, {status:200});
    } catch (error) {
        console.log(error)
        return NextResponse.json({error:'Internal Server Error'}, {status:500})
    }
}