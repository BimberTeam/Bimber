import { userBelongsToGroup } from './../../common/helper';
import { ensureAuthorized, debugQuery, singleQuote, groupExist } from '../../common/helper';
import { ApolloError } from "apollo-server"
import { Session } from "neo4j-driver";
import { neo4jgraphql } from "neo4j-graphql-js";

const groupNotFoundError = singleQuote("Podana grupa nie istnieje!");
const lackingMembershipError = singleQuote("Nie należysz do podanej grupy!");

export default async (obj, params, ctx, resolveInfo) => {
    await ensureAuthorized(ctx);
    const session: Session = ctx.driver.session();

    if (await groupExist(session, params.id) === false) {
        throw new ApolloError(groupNotFoundError, "400", [groupNotFoundError]);
    }

    if (await userBelongsToGroup(session, params.id, ctx.user.id) === false) {
        throw new ApolloError(lackingMembershipError, "400", [lackingMembershipError]);
    }

    await session.close();

    params.meId = ctx.user.id;
    return neo4jgraphql(obj, params, ctx, resolveInfo, debugQuery());
};
