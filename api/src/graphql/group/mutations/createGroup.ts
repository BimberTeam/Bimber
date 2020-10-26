import { Session } from 'neo4j-driver';
import { getValueFromSessionResult, singleQuote } from './../../common/helper';
import { ensureAuthorized, debugQuery } from '../../common/helper';
import { neo4jgraphql } from "neo4j-graphql-js";
import { ApolloError } from 'apollo-server';
import login from '../../user/resolvers/login';

const userNotFoundError = singleQuote("Jeden z podanych użytkowników nie istnieje!");
const lackingFriendshipError = singleQuote("Jeden z podanych użytkowników  nie jest Twoim znajomym!");

export default async (obj, params, ctx, resolveInfo) => {
    await ensureAuthorized(ctx);
    const session: Session = ctx.driver.session();

    for (const userId of params.input.usersId) {
        const friendExists = await session.run(
            `
            MATCH (a: Account{id: "${userId}"})
            RETURN a as result
            `,
        );

        if (friendExists.records.length === 0) {
            throw new ApolloError(userNotFoundError, "400", [userNotFoundError]);
        }

        const friendshipExists = await session.run(
            `
            MATCH (me: Account{id: "${ctx.user.id}"})
            MATCH (a: Account{id: "${userId}"})
            RETURN EXISTS( (a)-[:FRIENDS]-(me) ) as result
            `,
        );

        if (getValueFromSessionResult(friendshipExists, "result") === false) {
            throw new ApolloError(lackingFriendshipError, "400", [lackingFriendshipError]);
        }
    }

    params.meId = ctx.user.id;
    return neo4jgraphql(obj, params, ctx, resolveInfo, debugQuery());
};
