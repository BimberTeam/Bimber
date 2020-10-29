import { ensureAuthorized, debugQuery, singleQuote } from './../../common/helper';
import { ApolloError } from "apollo-server"
import { Session } from "neo4j-driver";
import { neo4jgraphql } from "neo4j-graphql-js";
import { getValueFromSessionResult } from "../../common/helper";

const groupNotFoundError = singleQuote("Podana grupa nie istnieje!");
const userNotFoundError = singleQuote("Podany użytkownik nie istnieje!");
const lackingFriendshipError = singleQuote("Podany użytkownik nie jest Twoim znajomym!");
const lackingMembershipError = singleQuote("Nie należysz do podanej grupy!");

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

    const friendExists = await session.run(
        `
        MATCH (a: Account{id: "${params.input.friendId}"})
        RETURN a as result
        `,
    );

    if (friendExists.records.length === 0) {
        throw new ApolloError(userNotFoundError, "400", [userNotFoundError]);
    }

    const friendshipExists = await session.run(
        `
        MATCH (me: Account{id: "${ctx.user.id}"})
        MATCH (a: Account{id: "${params.input.friendId}"})
        RETURN EXISTS( (a)-[:FRIENDS]-(me) ) as result
        `,
    );

    if (getValueFromSessionResult(friendshipExists, "result") === false) {
        throw new ApolloError(lackingFriendshipError, "400", [lackingFriendshipError]);
    }

    const userBelongsToGroup = await session.run(
        `
        MATCH (a: Account {id: "${ctx.user.id}"})
        MATCH (g: Group{id: "${params.input.groupId}"})
        RETURN EXISTS( (a)-[:BELONGS_TO]-(g) ) as result
        `,
    );

    if (getValueFromSessionResult(userBelongsToGroup, "result") === false) {
        throw new ApolloError(lackingMembershipError, "400", [lackingMembershipError]);
    }

    await session.close();

    params.meId = ctx.user.id;
    return neo4jgraphql(obj, params, ctx, resolveInfo, debugQuery());
};
