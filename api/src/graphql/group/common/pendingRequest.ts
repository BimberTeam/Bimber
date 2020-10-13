import { isAuthorized } from './../../common/helper';
import { ApolloError } from "apollo-server"
import { Session } from "neo4j-driver";
import { getValueFromSessionResult } from "../../common/helper";

const userIdEqualsToPendingUserId = "'ID użytkownika na którego chcesz zagłosować musi być różne od Twojego ID !'"
const groupDoesNotExist = "'Podana grupa nie istnieje !'";
const userNotBelongsToGroup = "'Nie należysz do podanej grupy !'";
const userDoesNotExist = "'Podany użytkownik nie istnieje !'";
const userDoesNotPendingToGroup = "'Użytkownik o podanym id nie oczekuje o dołączenie do podanej grupy !'";
const hasUserAlreadyVotedMessage = "'Już oddałeś głos !'";

export default async (params, ctx) => {

    const session: Session = ctx.driver.session();

    isAuthorized(ctx);

    if (ctx.user.id === params.input.userId) {
        throw new ApolloError(userIdEqualsToPendingUserId, "400", [userIdEqualsToPendingUserId]);
    }

    const doesGroupExist = await session.run(
        `
        MATCH (g: Group{id: "${params.input.groupId}"})
        RETURN g as result
        `,
    );

    if (doesGroupExist.records.length === 0) {
        throw new ApolloError(groupDoesNotExist, "400", [groupDoesNotExist]);
    }

    const userBelongsToGroup = await session.run(
        `
        MATCH (a: Account {id: "${ctx.user.id}"})
        MATCH (g: Group{id: "${params.input.groupId}"})
        RETURN EXISTS( (a)-[:BELONGS_TO]-(g) ) as result
        `,
    );

    if (getValueFromSessionResult(userBelongsToGroup, "result") === false) {
        throw new ApolloError(userNotBelongsToGroup, "400", [userNotBelongsToGroup]);
    }

    const pendingUserExists = await session.run(
        `
        MATCH (a: Account{id: "${params.input.userId}"})
        RETURN a as result
        `,
    );

    if (pendingUserExists.records.length === 0) {
        throw new ApolloError(userDoesNotExist, "400", [userDoesNotExist]);
    }

    const isUserPending = await session.run(
        `
        MATCH (a: Account{id: "${params.input.userId}"})
        MATCH (g: Group{id: "${params.input.groupId}"})
        MATCH (a)-[relation:PENDING]-(g)
        RETURN relation as result
        `,
    );

    if (isUserPending.records.length === 0) {
        throw new ApolloError(userDoesNotPendingToGroup, "400", [userDoesNotPendingToGroup]);
    }

    const hasUserAlreadyVoted = await session.run(
        `
        MATCH (a: Account{id: "${params.input.userId}"})
        MATCH (me: Account{id: "${ctx.user.id}"})
        MATCH (g: Group{id: "${params.input.groupId}"})
        RETURN EXISTS( (a)-[:VOTE_IN_FAVOUR{id: me.id}]-(g) ) OR EXISTS( (a)-[:VOTE_AGAINST{id: me.id}]-(g) ) as result
        `,
    );

    if (getValueFromSessionResult(hasUserAlreadyVoted, "result") === true) {
        throw new ApolloError(hasUserAlreadyVotedMessage, "400", [hasUserAlreadyVotedMessage]);
    }

    await session.close();

};