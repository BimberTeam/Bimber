import { ensureAuthorized, singleQuote } from "./../../common/helper";
import { ApolloError } from "apollo-server"
import { Session } from "neo4j-driver";
import { getValueFromSessionResult } from "../../common/helper";

const callerIsPendingUserError = singleQuote("ID użytkownika na którego chcesz zagłosować musi być różne od Twojego ID !");
const groupNotFoundError = singleQuote("Podana grupa nie istnieje !");
const lackingMembershipError = singleQuote("Nie należysz do podanej grupy !");
const userNotFoundError = singleQuote("Podany użytkownik nie istnieje !");
const pendingRelationNotFoundError = singleQuote("Użytkownik o podanym id nie oczekuje o dołączenie do podanej grupy !");
const alreadyVotedError = singleQuote("Już oddałeś głos !");


export class VotesDistribution {
    private groupCount: number;
    private votesCount: number;

    constructor(groupCount: number, votesCount: number) {
        this.groupCount = groupCount;
        this.votesCount = votesCount;
    }

    getVotesDistribution() {
        return (this.votesCount + 1) / this.groupCount;
    }
}

export default async (params, ctx) => {

    const session: Session = ctx.driver.session();

    ensureAuthorized(ctx);

    if (ctx.user.id === params.input.userId) {
        throw new ApolloError(callerIsPendingUserError, "400", [callerIsPendingUserError]);
    }

    const doesGroupExist = await session.run(
        `
        MATCH (g: Group{id: "${params.input.groupId}"})
        RETURN g as result
        `,
    );

    if (doesGroupExist.records.length === 0) {
        throw new ApolloError(groupNotFoundError, "400", [groupNotFoundError]);
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

    const pendingUserExists = await session.run(
        `
        MATCH (a: Account{id: "${params.input.userId}"})
        RETURN a as result
        `,
    );

    if (pendingUserExists.records.length === 0) {
        throw new ApolloError(userNotFoundError, "400", [userNotFoundError]);
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
        throw new ApolloError(pendingRelationNotFoundError, "400", [pendingRelationNotFoundError]);
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
        throw new ApolloError(alreadyVotedError, "400", [alreadyVotedError]);
    }

    await session.close();

};


export const votesDistribution = async (params, ctx, relation): Promise<VotesDistribution> => {
    const session: Session = ctx.driver.session();

    const votesDistribution = await session.run(
        `
        MATCH (a: Account {id: "${params.input.userId}"})
        MATCH (g: Group{id: "${params.input.groupId}"})
        MATCH ( (a)-[vf:${relation}]-(g) )
        RETURN count(vf) as result
        UNION ALL
        MATCH (g: Group{id: "${params.input.groupId}"})-[b:BELONGS_TO]-(a:Account)
        RETURN count(b) as result
        `
    );

    await session.close();

    const votesCount = votesDistribution.records[0].get("result").low;
    const groupCount = votesDistribution.records[1].get("result").low;

    return new VotesDistribution(groupCount, votesCount);
}