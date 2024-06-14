import { NextResponse } from "next/server"
import { getUserActorFollowing } from "@/db/actor";
import genContacts from "@/utils/activities/genContacts";
import { connectToDB } from "@/db";

export const GET = async (req) => {
    await connectToDB()
    const page = parseInt(req.nextUrl.searchParams.get("page")) || 0
    try {
        const [totalItems, data] = await getUserActorFollowing(page);
        const responseBody = genContacts(req.url, totalItems, data, page);
        return NextResponse.json(responseBody, {
            status:200,
            headers: {
                "Content-Type": "application/activity+json"
            }
        })
    } catch (error) {
        console.log(error);
        return NextResponse.json({},{status:500});
    }
}