import { singleQuote, groupExists, userBelongsToGroup } from './../../common/helper';
import { ensureAuthorized, debugQuery } from '../../common/helper';
import { neo4jgraphql } from "neo4j-graphql-js";
import { Session } from 'neo4j-driver';
import { ApolloError } from 'apollo-server';

const groupNotFoundError = singleQuote("Podana grupa nie istnieje!");
const lackingMembershipError = singleQuote("Nie należysz do podanej grupy!");

export default async (obj, params, ctx, resolveInfo) => {
    await ensureAuthorized(ctx);
    const session: Session = ctx.driver.session();

    if (!await groupExists(session, params.groupId)) {
        throw new ApolloError(groupNotFoundError, "400", [groupNotFoundError]);
    }

    if (!await userBelongsToGroup(session, params.groupId, ctx.user.id)) {
        throw new ApolloError(lackingMembershipError, "400", [lackingMembershipError]);
    }

    params.meId = ctx.user.id;
    return neo4jgraphql(obj, params, ctx, resolveInfo, debugQuery());
};
