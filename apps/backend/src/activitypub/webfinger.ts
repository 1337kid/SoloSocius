import { userEndpoints } from "./actor.js";

export const webfingerResponse = (username: string, domain: string) => {
  return {
    subject: `acct:${username}@${domain}`,
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
