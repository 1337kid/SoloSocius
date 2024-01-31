import connectToDB from '@/utils/connectToDB'
import User from '@/models/user'
import { NextResponse } from 'next/server'

export const GET = async(request) => {
  try {
    const searchParams = request.nextUrl.searchParams
    const resource = searchParams.get('resource')
    const account = resource.slice(5).split('@')
    await connectToDB()
    let webfinger = {}
    await User.findOne({username: account[0]}).then(user => {
        webfinger = {
            subject: `acct:${resource}`,
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
    })
    return NextResponse.json(webfinger, { status: 200 })
} catch (e){
    console.log(e)
    return new NextResponse('', { status: 404 })
  }
}