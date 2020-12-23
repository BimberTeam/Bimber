import { Session } from 'neo4j-driver';
import { singleQuote, userExists, friendshipExist } from './../../common/helper';
import { ensureAuthorized, debugQuery } from '../../common/helper';
import { neo4jgraphql } from "neo4j-graphql-js";
import { ApolloError } from 'apollo-server';

export const userNotFoundError = singleQuote("Jeden z podanych użytkowników nie istnieje!");
export const lackingFriendshipError = singleQuote("Jeden z podanych użytkowników nie jest Twoim znajomym!");

export default async (obj, params, ctx, resolveInfo) => {
    await ensureAuthorized(ctx);
    const session: Session = ctx.driver.session();

    for (const userId of params.input.usersId) {
        if (!await userExists(session, userId)) {
            throw new ApolloError(userNotFoundError, "400", [userNotFoundError]);
        }

        if (!await friendshipExist(session, ctx.user.id, userId)) {
            throw new ApolloError(lackingFriendshipError, "400", [lackingFriendshipError]);
        }
    }

    await session.close();

    params.ttl = process.env.NEO4J_TTL;
    params.meId = ctx.user.id;
    return neo4jgraphql(obj, params, ctx, resolveInfo, debugQuery());
};
