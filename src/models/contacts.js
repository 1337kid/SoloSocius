import { Schema, model, models } from "mongoose";

const followersSchema = new Schema({
    count: {
        type: Number,
        default: 0
    },
    followers: [{
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Actor'
    }]
})

const followingSchema = new Schema({
    count: {
        type: Number,
        default: 0
    },
    following: [{
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Actor'
    }]
})

const Followers = models.Followers || model('Followers', followersSchema)
const Following = models.Following || model('Following', followingSchema)
export { Followers, Following }