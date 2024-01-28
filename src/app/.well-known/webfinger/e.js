import connectToDB from '@/utils/connectToDB'
import { HOST } from '@/constants'
import User from '@/models/user'

const page = async ({searchParams}) => {
  try {
    const account = searchParams.resource.slice(5).split('@')
    if (account[1] == HOST) {
        await connectToDB()
        console.log('t')
        const user = await User.find({username: account[0]})
        const webfinger = {
            subject: `acct:${account[0]}@${HOST}`,
            aliases: [
                `{user.profileURL}`,
                `{user.self}`
            ],
            links: [
                {
                    rel: "http://webfinger.net/rel/profile-page",
                    type: "text/html",
                    href: `{user.profileURL}`
                },
                {
                    rel: "self",
                    type: "application/activity+json",
                    href: `{user.self}`
                },
                {
                    rel: "http://webfinger.net/rel/avatar",
                    type: "image/png",
                    href: `{user.profilePhoto}`
                }
            ]
        }
    }
    return Response.json(webfinger)
  } catch {
    return (
        <></>
    )
  }
}

export default page