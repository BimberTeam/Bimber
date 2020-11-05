import { ensureAuthorized, singleQuote, debugQuery, groupExist } from "../../common/helper";
import { ApolloError } from "apollo-server"
import { Session } from "neo4j-driver";
import { getValueFromSessionResult } from "../../common/helper";

const groupNotFoundError = singleQuote("Podana grupa nie istnieje!");
const lackingMembershipError = singleQuote("Już należysz do podanej grupy!");
const alreadyPendingError = singleQuote("Już oczekujesz na dołącznie do tej grupy!");
const groupOwnerError = singleQuote("Jesteś właścicielem podanej grupy!");

export default async (params, ctx) => {
    await ensureAuthorized(ctx);
    const session: Session = ctx.driver.session();

    if (await groupExist(session, params.input.groupId) === false) {
        throw new ApolloError(groupNotFoundError, "400", [groupNotFoundError]);
    }

    const alreadyGroupOwner = await session.run(
        `
        MATCH (g: Group {id: "${params.input.groupId}"}), (a:Account {id: "${ctx.user.id}"})
        RETURN EXISTS((g)<-[:OWNER]-(a)) AS result
        `,
    );

    if (getValueFromSessionResult(alreadyGroupOwner, "result") === true) {
        throw new ApolloError(groupOwnerError, "200", [groupOwnerError]);
    }

    const alreadyBelongsTo = await session.run(
        `
        MATCH (g: Group {id: "${params.input.groupId}"}), (a:Account {id: "${ctx.user.id}"})
        RETURN EXISTS((g)<-[:BELONGS_TO]-(a)) AS result
        `,
    );

    if (getValueFromSessionResult(alreadyBelongsTo, "result") === true) {
        throw new ApolloError(lackingMembershipError, "200", [lackingMembershipError]);
    }

    const alreadyPending = await session.run(
        `
        MATCH (group: Group {id: "${params.input.groupId}"})
        MATCH (me:Account {id: "${ctx.user.id}"})
        RETURN EXISTS( (me)-[:PENDING]->(group) ) AS result
        `,
    )

    if (getValueFromSessionResult(alreadyPending, "result") === true) {
        throw new ApolloError(alreadyPendingError, "200", [alreadyPendingError]);
    }

    await session.close();
}