import { ApolloError } from "apollo-server"
import { Session } from "neo4j-driver";
import { neo4jgraphql } from "neo4j-graphql-js";
import { getValueFromSessionResult } from "../../utils/helper";

export default async (obj, params, ctx, resolveInfo) => {
    const session: Session = ctx.driver.session();

    if (ctx.user === null) {
        throw new ApolloError("Not authorized", "405", ["Not authorized"]);
    }

    console.log(ctx.user.id.low);

    if (ctx.user.id.low === params.rejectPendingRequestInput.pendingUserId) {
        throw new ApolloError("'pendingUserId' have to be different than your id!", "400", ["'pendingUserId' have to be different than your id!"]);
    }

    const isGroupExist = await session.run(
        `
        MATCH (g: Group{id: ${params.rejectPendingRequestInput.groupId}})
        RETURN g as result
        `,
    );

    if (isGroupExist.records.length === 0) {
        throw new ApolloError("This group doesn't exist", "400", ["This group doesn't exist"]);
    }

    const isBelongsTo = await session.run(
        `
        MATCH (a: Account{id: ${ctx.user.id.low}})
        MATCH (g: Group{id: ${params.rejectPendingRequestInput.groupId}})
        RETURN EXISTS( (a)-[:BELONGS_TO]-(g) ) as result
        `,
    );

    if (getValueFromSessionResult(isBelongsTo, "result") === false) {
        throw new ApolloError("You don't belong to this group", "400", ["You don't belong to this group"]);
    }

    const isPendingUserExist = await session.run(
        `
        MATCH (a: Account{id: ${params.rejectPendingRequestInput.pendingUserId}})
        RETURN a as result
        `,
    );

    if (isPendingUserExist.records.length === 0) {
        throw new ApolloError("User with the given id doesn't exist!", "400", ["User with the given id doesn't exist!"]);
    }

    const isPendingUser = await session.run(
        `
        MATCH (a: Account{id: ${params.rejectPendingRequestInput.pendingUserId}})
        MATCH (g: Group{id: ${params.rejectPendingRequestInput.groupId}})
        MATCH (a)-[relation:PENDING]-(g)
        RETURN relation as result
        `,
    );

    if (isPendingUser.records.length === 0) {
        throw new ApolloError("User with the given id doesn't pending to this group!", "400", ["User with the given id doesn't pending to this group!"]);
    }

    const distributionOfVotes = await session.run(
        `
        MATCH (a: Account{id: ${params.rejectPendingRequestInput.pendingUserId}})
        MATCH (g: Group{id: ${params.rejectPendingRequestInput.groupId}})
        MATCH ( (a)-[vf:VOTE_AGAINST]-(g) )
        RETURN count(vf) as result
        UNION ALL
        MATCH (g: Group{id: ${params.rejectPendingRequestInput.groupId}})-[b:BELONGS_TO]-(a:Account)
        RETURN count(b) as result
        `
    );

    const countOfVoteAgainst = distributionOfVotes.records[0].get("result").low;
    const countOfGroup= distributionOfVotes.records[1].get("result").low;

    const isAlreadyVoted = await session.run(
        `
        MATCH (a: Account{id: ${params.rejectPendingRequestInput.pendingUserId}})
        MATCH (me: Account{id: ${ctx.user.id.low}})
        MATCH (g: Group{id: ${params.rejectPendingRequestInput.groupId}})
        RETURN EXISTS( (a)-[:VOTE_FAVOUR{id: me.id}]-(g) ) OR EXISTS( (a)-[:VOTE_AGAINST{id: me.id}]-(g) ) as result
        `,
    );

    if (getValueFromSessionResult(isAlreadyVoted, "result") === true) {
        throw new ApolloError("You have already voted!", "400", ["You have already voted!"]);
    }

    params.distributionOfVotes = countOfVoteAgainst+1/countOfGroup;
    console.log(params.distributionOfVotes)
    params.meId = ctx.user.id.low;
    return neo4jgraphql(obj, params, ctx, resolveInfo, true);
};