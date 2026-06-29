import { OrderedCollection } from "../types/index.js";

export const createOrderedCollection = (
  id: string,
  data: OrderedCollection,
) => {
  return {
    "@context": "https://www.w3.org/ns/activitystreams",
    id: id,
    type: "OrderedCollection",
    totalItems: data.totalItems,
    first: `${id}?page=${data.first}`,
    last: `${id}?page=${data.last}`,
  };
};

export const createOrderedCollectionPage = (
  id: string,
  pageNumber: number,
  totalItems: number,
  orderedItems: any,
  hasMoreItems: boolean,
) => {
  let res = {
    "@context": "https://www.w3.org/ns/activitystreams",
    id: `${id}?page=${pageNumber}`,
    type: "OrderedCollectionPage",
    partOf: id,
    totalItems: totalItems,
    orderedItems: orderedItems,
    next: undefined as string | undefined,
  };

  if (hasMoreItems) {
    res.next = `${id}?page=${pageNumber + 1}`;
  }

  return res;
};
