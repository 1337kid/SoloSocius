import { Schema, model, models } from "mongoose";

const actorsSchema = new Schema({
    actorId: {
        type: String,
        required: true
    },
    actor: {
        type: Object,
        require: true
    }
})

const Actors = models.Actors || model('Actors',actorsSchema)
export default Actors