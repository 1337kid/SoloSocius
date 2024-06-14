import Actors from "@/models/actors";
import User from "@/models/user";
import { Followers, Following } from "@/models/contacts";
import { getContactsAggregateOptions } from "@/db/aggregateOptions";

//=================== User & Database
export const createUser = async(object) => {
    await new User(object).save();
}

export const getUserActorFromDB = async(select={"fediverse":1, _id:0 }) => {
    const user = await User.findOne({}, select);
    return user
}

//=================== External Actors & Database

export const addExternalUserActorToDB = async(actorObject) => {
    const actor = await new Actors({actorId: actorObject.id, actor: actorObject});
    actor.save()
    return actor._id;
}

export const getExternalUserActorFromDB = async(actorId, select="_id") => {
    const actor = await Actors.findOne({actorId}).select(select);
    return actor
}

//==================== Followers & Following

export const addExternalUserActorToFollowers = async(actorId, actorMongoId, activityId) => {
    await new Followers({actorId, actorObject: actorMongoId, activityId}).save();
}

export const addExternalUserActorToFollowing = async(actorId, mongoActorId, activityId) => {
    await new Following({actorId, actorObject:mongoActorId , activityId}).save();
}

export const removeExternalUserActorFromFollowers = async(field, value) => {
    await Followers.findOneAndDelete({[field]: value})
}

export const removeExternalUserActorFromFollowing = async(field, value) => {
    await Following.findOneAndDelete({[field]: value})
}

export const getUserActorFollowers = async (page=1,limit=10) => {
    const totalCount = await Followers.find({}).countDocuments();
    const data = await Followers.aggregate(getContactsAggregateOptions(page, limit));
    return [totalCount, data[0]?.actors]
}

export const getUserActorFollowing = async (page=1,limit=10) => {
    const totalCount = await Following.find({}).countDocuments();
    const data = await Following.aggregate(getContactsAggregateOptions(page, limit));
    return [totalCount, data[0]?.actors]
}
