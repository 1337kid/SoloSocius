export const webfingerResponse = (username: string, domain: string) => {
  return {
    subject: `acct:${username}@${domain}`,
    aliases: [`https://${domain}/`, `https://${domain}/actor`],
    links: [
      {
        rel: "http://webfinger.net/rel/profile-page",
        type: "text/html",
        href: `https://${domain}/`,
      },
      {
        rel: "self",
        type: "application/activity+json",
        href: `https://${domain}/actor`,
      },
    ],
  };
};
