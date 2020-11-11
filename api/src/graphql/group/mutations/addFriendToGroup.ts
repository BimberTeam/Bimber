import { ensureAuthorized, debugQuery, singleQuote, groupExists, userExists, friendshipExist, userBelongsToGroup, groupInvitationExist, userAlreadyPendingToGroup } from './../../common/helper';
import { ApolloError } from "apollo-server"
import { Session } from "neo4j-driver";
import { neo4jgraphql } from "neo4j-graphql-js";

const groupNotFoundError = singleQuote("Podana grupa nie istnieje!");
const userNotFoundError = singleQuote("Podany użytkownik nie istnieje!");
const lackingFriendshipError = singleQuote("Podany użytkownik nie jest Twoim znajomym!");
const lackingMembershipError = singleQuote("Nie należysz do podanej grupy!");
const friendBelongsToGroupError = singleQuote("Podany użytkownik już należy do tej grupy!");
const friendAlreadyInvitedError = singleQuote("Podany użytkownik już został zaproszony do tej grupy!");
const alreadyPendingError = singleQuote("Podany użytkownik już oczekuje na dołącznie do tej grupy!");

export default async (obj, params, ctx, resolveInfo) => {
    await ensureAuthorized(ctx);
    const session: Session = ctx.driver.session();

    if ( await groupExists(session, params.input.groupId) === false) {
        throw new ApolloError(groupNotFoundError, "400", [groupNotFoundError]);
    }

    if (await userExists(session, params.input.userId) === false) {
        throw new ApolloError(userNotFoundError, "400", [userNotFoundError]);
    }

    if (await friendshipExist(session, ctx.user.id, params.input.userId) === false) {
        throw new ApolloError(lackingFriendshipError, "400", [lackingFriendshipError]);
    }

    if (await userBelongsToGroup(session, params.input.groupId, ctx.user.id) === false) {
        throw new ApolloError(lackingMembershipError, "400", [lackingMembershipError]);
    }

    if (await userBelongsToGroup(session, params.input.groupId, params.input.userId) === true) {
        throw new ApolloError(friendBelongsToGroupError, "400", [friendBelongsToGroupError]);
    }

    if (await groupInvitationExist(session, params.input.groupId, params.input.userId) === true) {
        throw new ApolloError(friendAlreadyInvitedError, "400", [friendAlreadyInvitedError]);
    }

    if (await userAlreadyPendingToGroup(session, params.input.groupId, params.input.userId) === true) {
        throw new ApolloError(alreadyPendingError, "200", [alreadyPendingError]);
    }

    await session.close();

    params.meId = ctx.user.id;
    return neo4jgraphql(obj, params, ctx, resolveInfo, debugQuery());
};
