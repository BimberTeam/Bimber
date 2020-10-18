import { ensureAuthorized, singleQuote } from "./../../common/helper";
import { ApolloError } from "apollo-server"
import { Session } from "neo4j-driver";
import { neo4jgraphql } from "neo4j-graphql-js";
import { getValueFromSessionResult } from "../../common/helper";

const groupDoesNotExistError = singleQuote("Podana grupa nie istnieje !");
const lackingMembershipError = singleQuote("Nie należysz do podanej grupy !");

export default async (obj, params, ctx, resolveInfo) => {

    const session: Session = ctx.driver.session();
    await ensureAuthorized(ctx);

    const groupExists = await session.run(
        `
        MATCH (g: Group{id: "${params.input.groupId}"})
        RETURN g as result
        `,
    );

    if(groupExists.records.length === 0) {
        throw new ApolloError(groupDoesNotExistError, "400", [groupDoesNotExistError]);
    }

    const userBelongsToGroup = await session.run(
        `
        MATCH (a: Account{id: "${ctx.user.id}"})
        MATCH (g: Group{id: "${params.input.groupId}"})
        RETURN EXISTS( (a)-[:BELONGS_TO]-(g) ) as result
        `,
    );

    if (getValueFromSessionResult(userBelongsToGroup, "result") === false) {
        throw new ApolloError(lackingMembershipError, "400", [lackingMembershipError]);
    }

    params.meId = ctx.user.id;
    return neo4jgraphql(obj, params, ctx, resolveInfo, true);
};