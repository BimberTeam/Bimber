import { ensureAuthorized, singleQuote, debugQuery, groupExist, userBelongsToGroup} from "./../../common/helper";
import { ApolloError } from "apollo-server"
import { Session } from "neo4j-driver";
import { neo4jgraphql } from "neo4j-graphql-js";

const groupDoesNotExistError = singleQuote("Podana grupa nie istnieje !");
const lackingMembershipError = singleQuote("Nie należysz do podanej grupy !");

export default async (obj, params, ctx, resolveInfo) => {
    await ensureAuthorized(ctx);
    const session: Session = ctx.driver.session();

    if (await groupExist(session, params.input.groupId) === false) {
        throw new ApolloError(groupDoesNotExistError, "400", [groupDoesNotExistError]);
    }

    if (await userBelongsToGroup(session, params.input.groupId, ctx.user.id) === false) {
        throw new ApolloError(lackingMembershipError, "400", [lackingMembershipError]);
    }

    await session.close();

    params.meId = ctx.user.id;
    return neo4jgraphql(obj, params, ctx, resolveInfo, debugQuery());
};