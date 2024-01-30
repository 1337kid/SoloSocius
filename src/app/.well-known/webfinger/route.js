import connectToDB from '@/utils/connectToDB'
import { HOST, PORT } from '@/constants'
import User from '@/models/user'
import { NextResponse } from 'next/server'

export const GET = async(request) => {
  try {
    const searchParams = request.nextUrl.searchParams
    const account = searchParams.get('resource').slice(5).split('@')
    if (account[1] == HOST) {
        await connectToDB()
        let webfinger = {}
        await User.findOne({username: account[0]}).then(user => {
            webfinger = {
                subject: `acct:${account[0]}@${HOST}`,
                aliases: [
                    `http://${HOST}:${PORT}${user.profileURL}`,
                    `http://${HOST}:${PORT}${user.self}`
                ],
                links: [
                    {
                        rel: "http://webfinger.net/rel/profile-page",
                        type: "text/html",
                        href: `http://${HOST}:${PORT}${user.profileURL}`
                    },
                    {
                        rel: "self",
                        type: "application/activity+json",
                        href: `http://${HOST}:${PORT}${user.self}`
                    },
                    {
                        rel: "http://webfinger.net/rel/avatar",
                        type: "image/png",
                        href: `http://${HOST}:${PORT}${user.profilePhoto}`
                    }
                ]
            }
        })
        return NextResponse.json(webfinger, { status: 200 })
    }
  } catch (e){
    console.log(e)
    return new NextResponse('', { status: 404 })
  }
}