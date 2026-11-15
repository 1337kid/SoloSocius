import { FastifyInstance } from "fastify";
import {
  addRelay,
  getRelays,
  removeRelay,
  resubscribeRelay,
  unsubscribeRelay,
} from "../controllers/relay.controller.js";
import {
  createRelayRouteSchema,
  relayIdRouteSchema,
} from "../validations/relay.val.js";

export async function RelayRoutes(fastify: FastifyInstance) {
  fastify.get("/relays", getRelays);
  fastify.post("/relays", { schema: createRelayRouteSchema }, addRelay);
  fastify.delete("/relays/:id", { schema: relayIdRouteSchema }, removeRelay);

  fastify.patch(
    "/relays/:id/unsubscribe",
    { schema: relayIdRouteSchema },
    unsubscribeRelay,
  );

  fastify.patch(
    "/relays/:id/resubscribe",
    { schema: relayIdRouteSchema },
    resubscribeRelay,
  );
}
