import { isAuthorized } from './helper';
import { neo4jgraphql } from "neo4j-graphql-js";

export default async (obj, params, ctx, resolveInfo) => {
    isAuthorized(ctx);

    params.meId = ctx.user.id;
    return neo4jgraphql(obj, params, ctx, resolveInfo, true);
};
