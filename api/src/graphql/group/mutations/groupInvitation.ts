import { groupExists, groupInvitationExist, userAlreadyPendingToGroup } from './../../common/helper';
import { debugQuery } from '../../common/helper';
import { neo4jgraphql } from 'neo4j-graphql-js';
import { ensureAuthorized, singleQuote } from "../../common/helper";
import { ApolloError } from "apollo-server"
import { Session } from "neo4j-driver";

export const groupNotFoundError = singleQuote("Podana grupa nie istnieje!");
export const lackingInvitationError = singleQuote("Nie masz zaproszenia do tej grupy!");

export default async (obj, params, ctx, resolveInfo) => {
    await ensureAuthorized(ctx);
    const session: Session = ctx.driver.session();

    if (!await groupExists(session, params.input.groupId)) {
        throw new ApolloError(groupNotFoundError, "400", [groupNotFoundError]);
    }

    if (!await groupInvitationExist(session, params.input.groupId, ctx.user.id)) {
        throw new ApolloError(lackingInvitationError, "400", [lackingInvitationError]);
    }

    await session.close();

    params.meId = ctx.user.id;
    return neo4jgraphql(obj, params, ctx, resolveInfo, debugQuery());
}