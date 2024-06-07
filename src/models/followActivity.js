import { Schema, model, models } from "mongoose";

const followActivitySchema = new Schema({
    activityID: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    actor: {
        type: String,
        required: true
    },
    object: {
        type: String,
        required: true
    }
})