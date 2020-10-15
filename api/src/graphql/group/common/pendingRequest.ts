import { ensureAuthorized, singleQuote } from "./../../common/helper";
import { ApolloError } from "apollo-server"
import { Session } from "neo4j-driver";
import { getValueFromSessionResult } from "../../common/helper";

const userIsPendingUser = singleQuote("ID użytkownika na którego chcesz zagłosować musi być różne od Twojego ID !");
const groupNotExist = singleQuote("Podana grupa nie istnieje !");
const notMemberOfGroup = singleQuote("Nie należysz do podanej grupy !");
const userNotExists = singleQuote("Podany użytkownik nie istnieje !");
const userNotPendingToGroup = singleQuote("Użytkownik o podanym id nie oczekuje o dołączenie do podanej grupy !");
const userAlreadyVoted = singleQuote("Już oddałeś głos !");

export default async (params, ctx) => {

    const session: Session = ctx.driver.session();

    ensureAuthorized(ctx);

    if (ctx.user.id === params.input.userId) {
        throw new ApolloError(userIsPendingUser, "400", [userIsPendingUser]);
    }

    const doesGroupExist = await session.run(
        `
        MATCH (g: Group{id: "${params.input.groupId}"})
        RETURN g as result
        `,
    );

    if (doesGroupExist.records.length === 0) {
        throw new ApolloError(groupNotExist, "400", [groupNotExist]);
    }

    const userBelongsToGroup = await session.run(
        `
        MATCH (a: Account {id: "${ctx.user.id}"})
        MATCH (g: Group{id: "${params.input.groupId}"})
        RETURN EXISTS( (a)-[:BELONGS_TO]-(g) ) as result
        `,
    );

    if (getValueFromSessionResult(userBelongsToGroup, "result") === false) {
        throw new ApolloError(notMemberOfGroup, "400", [notMemberOfGroup]);
    }

    const pendingUserExists = await session.run(
        `
        MATCH (a: Account{id: "${params.input.userId}"})
        RETURN a as result
        `,
    );

    if (pendingUserExists.records.length === 0) {
        throw new ApolloError(userNotExists, "400", [userNotExists]);
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
        throw new ApolloError(userNotPendingToGroup, "400", [userNotPendingToGroup]);
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
        throw new ApolloError(userAlreadyVoted, "400", [userAlreadyVoted]);
    }

    await session.close();

};