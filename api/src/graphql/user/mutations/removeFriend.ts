import { friendshipExist } from './../../common/helper';
import { ApolloError } from 'apollo-server';
import { Session } from 'neo4j-driver';
import { userExists, singleQuote } from '../../common/helper';
import { ensureAuthorized, debugQuery } from '../../common/helper';
import { neo4jgraphql } from "neo4j-graphql-js";

export const userNotFoundError = singleQuote("Podany użytkownik nie istnieje!");
export const lackingFriendshipError = singleQuote("Podany użytkownik nie jest twoim znajomym!");

export default async (obj, params, ctx, resolveInfo) => {
    await ensureAuthorized(ctx);
    const session: Session = ctx.driver.session();

    if (!await userExists(session, params.input.id)) {
        throw new ApolloError(userNotFoundError, "400", [userNotFoundError]);
    }

    if (!await friendshipExist(session, params.input.id, ctx.user.id)) {
        throw new ApolloError(lackingFriendshipError, "400", [lackingFriendshipError]);
    }

    params.meId = ctx.user.id;
    return neo4jgraphql(obj, params, ctx, resolveInfo, debugQuery());
};
