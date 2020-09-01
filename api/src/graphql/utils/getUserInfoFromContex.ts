import { ApolloError } from "apollo-server"
import { neo4jgraphql } from "neo4j-graphql-js";

export default async (obj, params, ctx, resolveInfo) => {
    if (ctx.user === null) {
        throw new ApolloError("Not authorized", "405", ["You are not allowed to do that"]);
    }

    params.email = ctx.user.email;
    params.meID = ctx.user.id.low;
    return neo4jgraphql(obj, params, ctx, resolveInfo, true);
};
