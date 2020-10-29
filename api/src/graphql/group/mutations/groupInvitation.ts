import { debugQuery } from '../../common/helper';
import { neo4jgraphql } from 'neo4j-graphql-js';
import { ensureAuthorized, singleQuote } from "../../common/helper";
import { ApolloError } from "apollo-server"
import { Session } from "neo4j-driver";
import { getValueFromSessionResult } from "../../common/helper";

const groupNotFoundError = singleQuote("Podana grupa nie istnieje!");
const lackingInvitationError = singleQuote("Nie masz zaproszenia do tej grupy!");

export default async (obj, params, ctx, resolveInfo) => {
    await ensureAuthorized(ctx);
    const session: Session = ctx.driver.session();

    const doesGroupExist = await session.run(
        `
        MATCH (g: Group{id: "${params.input.groupId}"})
        RETURN g as result
        `,
    );

    if (doesGroupExist.records.length === 0) {
        throw new ApolloError(groupNotFoundError, "400", [groupNotFoundError]);
    }

    const invitationExist = await session.run(
        `
        MATCH (a: Account{id: "${ctx.user.id}"})
        MATCH (g: Group{id: "${params.input.groupId}"})
        RETURN EXISTS( (a)-[:GROUP_INVITATION]-(g) ) as result
        `,
    );

    if (getValueFromSessionResult(invitationExist, "result") === false) {
        throw new ApolloError(lackingInvitationError, "400", [lackingInvitationError]);
    }

    await session.close();

    params.meId = ctx.user.id;
    return neo4jgraphql(obj, params, ctx, resolveInfo, debugQuery());
}