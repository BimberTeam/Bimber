import { Session } from 'neo4j-driver';
import { ApolloError } from 'apollo-server';
import { groupExists, userBelongsToGroup, singleQuote } from '../../common/helper';
import { ensureAuthorized, debugQuery } from '../../common/helper';
import { neo4jgraphql } from "neo4j-graphql-js";

export const groupNotFoundError = singleQuote("Podana grupa nie istnieje!");
export const lackingMembershipError = singleQuote("Nie należysz do podanej grupy!");

export default async (obj, params, ctx, resolveInfo) => {
    await ensureAuthorized(ctx);
    const session: Session = ctx.driver.session();

    if (!await groupExists(session, params.id)) {
        throw new ApolloError(groupNotFoundError, "400", [groupNotFoundError]);
    }

    if (!await userBelongsToGroup(session, params.id, ctx.user.id )) {
        throw new ApolloError(lackingMembershipError, "400", [lackingMembershipError]);
    }

    await session.close();
    params.meId = ctx.user.id;
    return neo4jgraphql(obj, params, ctx, resolveInfo, debugQuery());
};
