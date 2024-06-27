import { connectToDB } from "@/db"
import { getUserActorFromDB, getUserActorConnectionsCount } from "@/db/actor"
import { NextResponse } from "next/server"
import { INSTANCE } from "@/constants"

export const GET = async () => {
    try {
        await connectToDB()
        const userActor_ = await getUserActorFromDB("-password -fediverse -_id -__v");
        if (!userActor_) return NextResponse.json({eroor: 'account unavailable'}, {status:404})
        const connections = await getUserActorConnectionsCount();
        const stats = [
            {name: "Following", data: connections.following},
            {name: "Followers", data: connections.followers}
        ]
        let userActor = userActor_._doc
        userActor.username = `@${userActor.username}@${INSTANCE}`
        return NextResponse.json({
            userActor, stats
        }, {status:200});
    } catch (error) {
        console.log(error)
        return NextResponse.json({error:'Internal Server Error'}, {status:500})
    }
}