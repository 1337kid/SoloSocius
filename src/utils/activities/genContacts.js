import { INSTANCE } from "@/constants";

const genContacts = (id,totalCount,data,page) => {
    const url = new URL(id);
    let returnObject = {
        "@context": "https://www.w3.org/ns/activitystreams",
        id: `https://${INSTANCE}${url.pathname}${url.search}`,
        type: "OrderedCollectionPage",
        totalItems: totalCount,
        first: `https://${INSTANCE}${url.pathname}?page=1`,
        next: `https://${INSTANCE}${url.pathname}?page=${page+1}`,
        partOf: `https://${INSTANCE}${url.pathname}`,
        orderedItems: data || []
    }

    if (!page) {
        delete returnObject.partOf;
        delete returnObject.orderedItems;
        delete returnObject.next;
    } else delete returnObject.first;
    if (page*10 > totalCount) delete returnObject.next;
    return returnObject;
}

export default genContacts