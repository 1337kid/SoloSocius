import Actors from "@/models/actors";
import connectToDB from ".";
import User from "@/models/user";

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

const addActorToFollowers = async(actor) => {
    await connectToDB()
    try {
        const newActor = new Actors({
            actorId: actor.id,
            actor: actor
        })
        console.log(newActor);
        await newActor.save()
    } catch (error) {
        console.log(error)
    }
}

export { getActorFromDB, addActorToFollowers }