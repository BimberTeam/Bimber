import { Session } from 'neo4j-driver';
import { singleQuote, userExists, friendshipExist } from './../../common/helper';
import { ensureAuthorized, debugQuery } from '../../common/helper';
import { neo4jgraphql } from "neo4j-graphql-js";
import { ApolloError } from 'apollo-server';

const userNotFoundError = singleQuote("Jeden z podanych użytkowników nie istnieje!");
const lackingFriendshipError = singleQuote("Jeden z podanych użytkowników  nie jest Twoim znajomym!");

export default async (obj, params, ctx, resolveInfo) => {
    await ensureAuthorized(ctx);
    const session: Session = ctx.driver.session();

    for (const userId of params.input.usersId) {
        if (await userExists(session, userId) == false) {
            throw new ApolloError(userNotFoundError, "400", [userNotFoundError]);
        }

        if (await friendshipExist(session, ctx.user.id, userId) === false) {
            throw new ApolloError(lackingFriendshipError, "400", [lackingFriendshipError]);
        }
    }

    await session.close();

    params.meId = ctx.user.id;
    return neo4jgraphql(obj, params, ctx, resolveInfo, debugQuery());
};
