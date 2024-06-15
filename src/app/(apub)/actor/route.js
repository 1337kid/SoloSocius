import { NextResponse } from 'next/server'
import { connectToDB } from '@/db'
import { genActorEndpointBody } from '@/utils/activities/public';
import { getUserActorFromDB } from '@/db/actor';

export const GET = async (req,{params}) => {
    try {
        await connectToDB();
        const user = await getUserActorFromDB("-password");
        if (!user) return NextResponse.json({error: 'Actor not found'}, {status:404});
        return NextResponse.json(genActorEndpointBody(user) ,{
            status: 200,
            headers : {
                "Content-Type": "application/activity+json"
            }
        });
    } catch (error) {
        console.log(error);
        return NextResponse.json({error:'Internal Server Error'},{status:500});
    }
}