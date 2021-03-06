import { executeQuery, userBelongsToGroup, userAlreadyPendingToGroup } from './../../common/helper';
import { ensureAuthorized, singleQuote, debugQuery, groupExists } from "../../common/helper";
import { ApolloError } from "apollo-server"
import { Session } from "neo4j-driver";

export const groupNotFoundError = singleQuote("Podana grupa nie istnieje!");
export const alreadyBelongsError = singleQuote("Już należysz do podanej grupy!");
export const alreadyPendingError = singleQuote("Już oczekujesz na dołącznie do tej grupy!");
export const groupOwnerError = singleQuote("Jesteś właścicielem podanej grupy!");

export default async (params, ctx) => {
    await ensureAuthorized(ctx);
    const session: Session = ctx.driver.session();

    if (!await groupExists(session, params.input.groupId)) {
        throw new ApolloError(groupNotFoundError, "400", [groupNotFoundError]);
    }

    const alreadyGroupOwnerQuery =
        `
        MATCH (g: Group {id: "${params.input.groupId}"}), (a:Account {id: "${ctx.user.id}"})
        RETURN EXISTS((g)<-[:OWNER]-(a)) AS result
        `;

    if (await executeQuery<boolean>(session, alreadyGroupOwnerQuery)) {
        throw new ApolloError(groupOwnerError, "400", [groupOwnerError]);
    }

    if (await userBelongsToGroup(session, params.input.groupId, ctx.user.id)) {
        throw new ApolloError(alreadyBelongsError, "400", [alreadyBelongsError]);
    }

    if (await userAlreadyPendingToGroup(session, params.input.groupId, ctx.user.id )) {
        throw new ApolloError(alreadyPendingError, "400", [alreadyPendingError]);
    }

    await session.close();
}