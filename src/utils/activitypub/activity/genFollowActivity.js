import { v4 as uuidv4 } from 'uuid';
import { INSTANCE } from '@/constants';

const genFollowActivity = (actor,object,type) => {
  const id_ = `https://${INSTANCE}/${uuidv4()}`
  return {
    "@context": "https://www.w3.org/ns/activitystreams",
    id: id_,
    type: type,
    actor: actor,
    object: object
  } 
}

export default genFollowActivity;