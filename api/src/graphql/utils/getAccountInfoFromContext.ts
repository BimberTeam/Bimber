import { ApolloError } from "apollo-server"
import { neo4jgraphql } from "neo4j-graphql-js";

export default async (obj, params, ctx, resolveInfo) => {
    if (ctx.user === null) {
        throw new ApolloError("Not authorized", "405", ["Not authorized"]);
    }

    params.meId = ctx.user.id;
    return neo4jgraphql(obj, params, ctx, resolveInfo, true);
};
