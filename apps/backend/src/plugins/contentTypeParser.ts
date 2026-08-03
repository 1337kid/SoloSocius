import fp from "fastify-plugin";

export default fp(async (fastify) => {
  fastify.addContentTypeParser(
    "application/activity+json",
    { parseAs: "string" },
    (req, body, done) => {
      try {
        const json = JSON.parse(body as string);
        done(null, json);
      } catch (err: any) {
        err.statusCode = 400;
        done(err, undefined);
      }
    },
  );
});
