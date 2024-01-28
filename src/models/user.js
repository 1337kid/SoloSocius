import { Schema, model, models } from "mongoose";

const userSchema = new Schema({
    id: Schema.Types.ObjectId,
    username: String,
    profileURL: String,
    inbox: String,
    outbox: String,
    profilePhoto: String,
    self: String
})

const User = models.User || model('User',userSchema)
export default User