import { OrderedCollection } from "../types/index.js";
import { userEndpoints } from "./actor.js";

export const createOrderedCollection = (data: OrderedCollection) => {
  return {
    "@context": "https://www.w3.org/ns/activitystreams",
    id: userEndpoints.outbox,
    type: "OrderedCollection",
    totalItems: data.totalItems,
    first: `${userEndpoints.outbox}?page=${data.first}`,
    last: `${userEndpoints.outbox}?page=${data.last}`,
  };
};

export const createOrderedCollectionPage = (
  pageNumber: number,
  orderedItems: any,
  hasMoreItems: boolean,
) => {
  let res = {
    "@context": "https://www.w3.org/ns/activitystreams",
    id: `${userEndpoints.outbox}?page=${pageNumber}`,
    type: "OrderedCollectionPage",
    partOf: userEndpoints.outbox,
    orderedItems: orderedItems,
    next: undefined as string | undefined,
  };

  if (hasMoreItems) {
    res.next = `${userEndpoints.outbox}?page=${pageNumber + 1}`;
  }

  return res;
};
