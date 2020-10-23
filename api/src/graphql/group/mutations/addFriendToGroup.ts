import { ApolloError } from "apollo-server"
import { Session } from "neo4j-driver";
import { neo4jgraphql } from "neo4j-graphql-js";
import { getValueFromSessionResult } from "../../common/helper";

export default async (obj, params, ctx, resolveInfo) => {
    const session: Session = ctx.driver.session();
    if (ctx.user === null) {
        throw new ApolloError("Not authorized", "405", ["You are not allowed to do that"]);
    }


    params.meId = ctx.user.id.low;
    return neo4jgraphql(obj, params, ctx, resolveInfo, true);
};
