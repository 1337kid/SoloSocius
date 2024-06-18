import { Schema, model, models } from "mongoose";

const userSchema = new Schema({
    id: Schema.Types.ObjectId,
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    summary: {
        type: String,
        default: ''
    },
    profileURL: {
        type: String,
        required: true,
    },
    profilePhoto: {
        type: String,
        default: ''
    },
    createdOn: {
        type: Date,
        default: Date.now()
    },
    fediverse: {
        self: {
            type: String,
            required: true,
        },
        inbox: {
            type: String,
            required: true,
        },
        outbox: {
            type: String,
            required: true,
        },
        publicKey: {
            type: String,
            required: true,
        },
        privateKey: {
            type: String,
            required: true,  
        }
    }
})


const User = models?.User || model('User',userSchema)
export default User