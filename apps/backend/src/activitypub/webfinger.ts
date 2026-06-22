import { userEndpoints } from "./actor.js";
import { DOMAIN } from "../config/env.js";

export const webfingerResponse = (username: string) => {
  return {
    subject: `acct:${username}@${DOMAIN}`,
    aliases: [userEndpoints.actorUri],
    links: [
      {
        rel: "http://webfinger.net/rel/profile-page",
        type: "text/html",
        href: userEndpoints.home,
      },
      {
        rel: "self",
        type: "application/activity+json",
        href: userEndpoints.actorUri,
      },
    ],
  };
};
