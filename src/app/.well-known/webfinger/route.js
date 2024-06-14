import { connectToDB } from '@/db';
import { NextResponse } from 'next/server';
import { INSTANCE } from '@/constants';
import { getUserActorFromDB } from '@/db/actor';

export const GET = async(request) => {
    const searchParams = request.nextUrl.searchParams
    try {
    const resource = searchParams.get('resource')
    const account = resource.slice(5).split('@')
    if (INSTANCE != account[1]) return NextResponse.json({error:'Not Found'}, { status: 404 });
    await connectToDB();
    const user = await getUserActorFromDB("-password");
    console.log(user.username)
    if (user && user.username != account[0]) return NextResponse.json({error:'Not Found'}, {status:404})
    const webfinger = {
        subject: `${resource}`,
        aliases: [
            `${user.profileURL}`,
            `${user.fediverse.self}`
        ],
        links: [
            {
                rel: "http://webfinger.net/rel/profile-page",
                type: "text/html",
                href: `${user.profileURL}`
            },
            {
                rel: "self",
                type: "application/activity+json",
                href: `${user.fediverse.self}`
            },
            {
                rel: "http://webfinger.net/rel/avatar",
                type: "image/png",
                href: `${user.profilePhoto}`
            }
        ]
    }
    return NextResponse.json(webfinger,{
        status:200,
        headers : {
            "Content-Type": "application/jrd+json"
        }
    });
} catch (e){
    console.log(e)
    return new NextResponse.json({error:'Internal Server Error'}, { status: 500 });
  }
}