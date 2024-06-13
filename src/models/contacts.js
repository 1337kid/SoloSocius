import { Schema, model, models } from "mongoose";

const contactSchema = new Schema({
    actorId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Actors'
    },
    activityId: {
        type: String
    },
    isContact: {
        type: Boolean,
        default: true
    }
})

const Followers = models.Followers || model('Followers', contactSchema)
const Following = models.Following || model('Following', contactSchema)
export { Followers, Following }