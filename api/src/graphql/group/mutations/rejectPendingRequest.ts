import { ApolloError } from "apollo-server"
import { Session } from "neo4j-driver";
import { neo4jgraphql } from "neo4j-graphql-js";
import { getValueFromSessionResult } from "../../utils/helper";

export default async (obj, params, ctx, resolveInfo) => {
    const session: Session = ctx.driver.session();

    if (ctx.user === null) {
        throw new ApolloError("Not authorized", "405", ["Not authorized"]);
    }

    const isGroupExist = await session.run(
        `
        MATCH (g: Group{id: ${params.groupId}})
        RETURN g as result
        `,
    );

    if(isGroupExist.records.length === 0) {
        throw new ApolloError("This group doesn't exist", "400", ["This group doesn't exist"]);
    }

    const isBelongsTo = await session.run(
        `
        MATCH (a: Account{id: ${ctx.user.id.low}})
        MATCH (g: Group{id: ${params.groupId}})
        RETURN EXISTS( (a)-[:BELONGS_TO]-(g) ) as result
        `,
    );

    if (getValueFromSessionResult(isBelongsTo, "result") === false) {
        throw new ApolloError("You don't belong to this group", "400", ["You don't belong to this group"]);
    }

    params.meId = ctx.user.id.low;
    return neo4jgraphql(obj, params, ctx, resolveInfo, true);
};