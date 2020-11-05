import { ensureAuthorized, debugQuery, singleQuote, groupExist, userExist, friendshipExist, userBelongsToGroup } from './../../common/helper';
import { ApolloError } from "apollo-server"
import { Session } from "neo4j-driver";
import { neo4jgraphql } from "neo4j-graphql-js";

const groupNotFoundError = singleQuote("Podana grupa nie istnieje!");
const userNotFoundError = singleQuote("Podany użytkownik nie istnieje!");
const lackingFriendshipError = singleQuote("Podany użytkownik nie jest Twoim znajomym!");
const lackingMembershipError = singleQuote("Nie należysz do podanej grupy!");

export default async (obj, params, ctx, resolveInfo) => {
    await ensureAuthorized(ctx);
    const session: Session = ctx.driver.session();

    if ( await groupExist(session, params.input.groupId) === false) {
        throw new ApolloError(groupNotFoundError, "400", [groupNotFoundError]);
    }

    if (await userExist(session, params.input.friendId) === false) {
        throw new ApolloError(userNotFoundError, "400", [userNotFoundError]);
    }

    if (await friendshipExist(session, ctx.user.id, params.input.friendId) === false) {
        throw new ApolloError(lackingFriendshipError, "400", [lackingFriendshipError]);
    }

    if (await userBelongsToGroup(session, params.input.groupId, ctx.user.id) === false) {
        throw new ApolloError(lackingMembershipError, "400", [lackingMembershipError]);
    }

    await session.close();

    params.meId = ctx.user.id;
    return neo4jgraphql(obj, params, ctx, resolveInfo, debugQuery());
};
