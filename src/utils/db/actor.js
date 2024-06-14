import Actors from "@/models/actors";
import connectToDB from ".";
import User from "@/models/user";
import { Followers, Following } from "@/models/contacts";

const getActorFromDB = async(field,value) => {
    await connectToDB()
    try {
        const user = await User.findOne({[field]: value}, {"fediverse":1,_id:0});
        return user
    } catch (error) {
        console.log(error)
        return error
    }
}

const addActorToContacts = async(actor, type, activityId) => {
    await connectToDB()
    try {
        const newActor = {
            actorId: actor.id,
            actor: actor
        }
        await Actors.findOne({actorId: actor.id}).select("_id").then(async (data) => {
            let recipientId = ''
            if(!data) {
                const result = new Actors(newActor);        
                await result.save()
                recipientId = result._id;
            } else recipientId = data._id 
            
            const insertObject = {
                actorId: actor.id,
                actorObject: data._id,
                activityId: activityId,
            }

            if (type === "followers") {
                await new Followers(insertObject).save();
                return
            }
            await new Following(insertObject).save();
        })
    } catch (error) {
        console.log(error)
    }
}

const genContactsAggregateOptions = (page,limit) => {
    limit = page === 0 ? limit = 1 : limit;
    page = page >= 1 ? page-1 : page;
    return [
        {$match: {}},
        {$sort: {_id: -1}},
        {$limit: page*limit + limit},
        {$skip: page*limit},
        {$group: {_id: null, actors: {$push: "$actorId"}}},
        {$project: {actors: true, _id: false}}
    ]
}

const getActorFollowers = async (page=1,limit=10) => {
    const totalCount = await Followers.find({}).countDocuments();
    const data = await Followers.aggregate(genContactsAggregateOptions(page, limit));
    return [totalCount, data[0]?.actors]
}

const getActorFollowing = async (page=1,limit=10) => {
    const totalCount = await Following.find({}).countDocuments();
    const data = await Following.aggregate(genContactsAggregateOptions(page, limit));
    return [totalCount, data[0]?.actors]
}

export { getActorFromDB, addActorToContacts, getActorFollowers, getActorFollowing}