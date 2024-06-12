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

const addActorToContacts = async(actor, type) => {
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
            
            const updateObject = {
                $inc: { count: 1 },
                $push: { [type] : recipientId },
            }

            if (type === "followers") {
                await Followers.findOneAndUpdate({count: {$gte: 0}}, updateObject);
                return
            }
            await Following.findOneAndUpdate({count: {$gte: 0}}, updateObject);
        })
    } catch (error) {
        console.log(error)
    }
}

export { getActorFromDB, addActorToContacts }