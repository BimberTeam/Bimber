import { ensureAuthorized, debugQuery, singleQuote } from './../../common/helper';
import { ApolloError } from "apollo-server"
import { Session } from "neo4j-driver";
import { neo4jgraphql } from "neo4j-graphql-js";
import { getValueFromSessionResult } from "../../common/helper";

const groupNotFoundError = singleQuote("Podana grupa nie istnieje!");
const lackingMembershipError = singleQuote("Nie należysz do podanej grupy!");

export default async (obj, params, ctx, resolveInfo) => {
    await ensureAuthorized(ctx);
    const session: Session = ctx.driver.session();

    const doesGroupExist = await session.run(
        `
        MATCH (g: Group{id: "${params.id}"})
        RETURN g as result
        `,
    );

    if (doesGroupExist.records.length === 0) {
        throw new ApolloError(groupNotFoundError, "400", [groupNotFoundError]);
    }

    const userBelongsToGroup = await session.run(
        `
        MATCH (a: Account {id: "${ctx.user.id}"})
        MATCH (g: Group{id: "${params.id}"})
        RETURN EXISTS( (a)-[:BELONGS_TO]-(g) ) as result
        `,
    );

    if (getValueFromSessionResult(userBelongsToGroup, "result") === false) {
        throw new ApolloError(lackingMembershipError, "400", [lackingMembershipError]);
    }

    await session.close();

    params.meId = ctx.user.id;
    return neo4jgraphql(obj, params, ctx, resolveInfo, debugQuery());
};
