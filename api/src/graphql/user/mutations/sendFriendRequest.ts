import { friendRequestExists } from './../../common/helper';
import { ApolloError } from 'apollo-server';
import { Session } from 'neo4j-driver';
import { userExists, singleQuote, friendshipExist } from '../../common/helper';
import { ensureAuthorized, debugQuery } from '../../common/helper';
import { neo4jgraphql } from "neo4j-graphql-js";

const userNotFoundError = singleQuote("Podany użytkownik nie istnieje!");
const friendshipExistsError = singleQuote("Podany użytkownik już jest Twoim znajomym!");
const friendRequestExistsError = singleQuote("Wysłano już zaproszenie do tego użytkownika!");
const requestedFriendIsMeError = singleQuote("Nie możesz zaprosić samego siebie do znajomych!");

export default async (obj, params, ctx, resolveInfo) => {
    await ensureAuthorized(ctx);
    const session: Session = ctx.driver.session();

    if (params.input.id === ctx.user.id) {
        throw new ApolloError(requestedFriendIsMeError, "400", [requestedFriendIsMeError]);
    }

    if (!await userExists(session, params.input.id)) {
        throw new ApolloError(userNotFoundError, "400", [userNotFoundError]);
    }

    if (await friendshipExist(session, ctx.user.id, params.input.id)) {
        throw new ApolloError(friendshipExistsError, "400", [friendshipExistsError]);
    }

    if (await friendRequestExists(session, ctx.user.id, params.input.id)) {
        throw new ApolloError(friendRequestExistsError, "400", [friendRequestExistsError]);
    }

    params.meId = ctx.user.id;
    return neo4jgraphql(obj, params, ctx, resolveInfo, debugQuery());
};
