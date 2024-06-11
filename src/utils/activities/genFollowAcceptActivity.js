import { v4 as uuidv4 } from 'uuid';
import { INSTANCE } from '@/constants';

/*
  genFollowAcceptActivity() -> returns an object based on activity type
  arguments:  actor ->  actor endpoint of the user who sends the request
              object -> object/recipient's actor endpoint
              type -> Type of the activity (either "Follow" or "Accept")
*/

const genFollowAcceptActivity = (actor,object,type) => {
  const id_ = `https://${INSTANCE}/${uuidv4()}`
  return {
    "@context": "https://www.w3.org/ns/activitystreams",
    id: id_,
    type: type,
    actor: actor,
    object: object
  } 
}

export default genFollowAcceptActivity;