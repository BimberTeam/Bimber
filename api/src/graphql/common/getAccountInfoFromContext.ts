import { ensureAuthorized, debugQuery } from './helper';
import { neo4jgraphql } from "neo4j-graphql-js";

export default async (obj, params, ctx, resolveInfo) => {
    await ensureAuthorized(ctx);

    params.meId = ctx.user.id;

    return neo4jgraphql(obj, params, ctx, resolveInfo, debugQuery());
};
