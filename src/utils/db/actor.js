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
                actorId: recipientId,
                activityId: activityId
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

const getContacts = async (type,page) => {
    await connectToDB();
    try {
        
    } catch (error) {
        console.log(error)
    }
}

export { getActorFromDB, addActorToContacts, getContacts }