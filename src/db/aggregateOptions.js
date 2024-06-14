export const getContactsAggregateOptions = (page,limit) => {
    limit = page === 0 ? limit = 1 : limit;
    page = page >= 1 ? page-1 : page=0;
    return [
        {$match: {}},
        {$sort: {_id: -1}},
        {$limit: page*limit + limit},
        {$skip: page*limit},
        {$group: {_id: null, actors: {$push: "$actorId"}}},
        {$project: {actors: true, _id: false}}
    ]
}