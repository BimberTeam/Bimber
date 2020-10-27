import { ensureAuthorized, singleQuote, debugQuery } from "../../common/helper";
import { neo4jgraphql } from "neo4j-graphql-js";
import swipe from "../common/swipe";


export default async (obj, params, ctx, resolveInfo) => {
    await ensureAuthorized(ctx);
    await swipe(params, ctx);

    params.meId = ctx.user.id;
    return neo4jgraphql(obj, params, ctx, resolveInfo, debugQuery());
};
